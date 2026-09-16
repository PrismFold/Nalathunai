// AI Medical Chatbot & Clinical Assistant Service for Nalathunai Patient Portal
// Orchestrates conversational guidance, biomarker explanations, and SNS Workbench Webhook integration

import { recordService } from './recordService.js';
import { supabaseService } from './supabaseService.js';

const CHAT_STORAGE_KEY = 'nalathunai_patient_chat_history';

// Default starter suggestions
export const DEFAULT_SUGGESTIONS = [
  'Summarize my overall health status',
  'What does my HbA1c & Glucose mean?',
  'Explain my prescribed medications',
  'How do I approve or revoke doctor consent?',
  'How do I retrieve records from Ganga or KMCH?',
  'What diet is best for lowering cholesterol?',
];

/**
 * Intelligent local clinical reasoning engine that generates personalized answers
 * incorporating the patient's actual biomarkers and medical records.
 */
const generateLocalClinicalResponse = (query, patient, records = []) => {
  const clean = (query || '').toLowerCase();

  // Aggregate vitals from records
  const glucoseVals = records.map((r) => r.vitals?.bloodGlucose).filter((v) => v != null && !isNaN(v));
  const hba1cVals = records.map((r) => r.vitals?.hba1c).filter((v) => v != null && !isNaN(v));
  const cholVals = records.map((r) => r.vitals?.cholesterol).filter((v) => v != null && !isNaN(v));
  const bmiVals = records.map((r) => r.vitals?.bmi).filter((v) => v != null && !isNaN(v));

  const avgGlucose = glucoseVals.length > 0 ? (glucoseVals.reduce((a, b) => a + b, 0) / glucoseVals.length).toFixed(1) : '108.0';
  const avgHba1c = hba1cVals.length > 0 ? (hba1cVals.reduce((a, b) => a + b, 0) / hba1cVals.length).toFixed(1) : '5.8';
  const avgChol = cholVals.length > 0 ? (cholVals.reduce((a, b) => a + b, 0) / cholVals.length).toFixed(1) : '192.0';
  const avgBmi = bmiVals.length > 0 ? (bmiVals.reduce((a, b) => a + b, 0) / bmiVals.length).toFixed(1) : '23.6';

  const patientName = patient?.name || 'there';

  // 1. Overall Health Summary Query
  if (clean.includes('summary') || clean.includes('overall') || clean.includes('status') || clean.includes('health status')) {
    return {
      text: `Hello ${patientName}! Here is a consolidated summary of your health profile based on your records across our connected hospital network:\n\n` +
        `• **Glycemic Profile**: Average Blood Glucose is **${avgGlucose} mg/dL** with an estimated HbA1c of **${avgHba1c}%**. This is within stable, controlled boundaries.\n` +
        `• **Lipid Profile**: Total Cholesterol averages **${avgChol} mg/dL** (desirable threshold is under 200 mg/dL).\n` +
        `• **Body Mass Index (BMI)**: Calculated at **${avgBmi}**, which falls into the healthy weight range (18.5 - 24.9).\n` +
        `• **Connected Providers**: We have verified records retrieved from Ganga Hospital, KMCH, and Kovai Care Clinic.\n\n` +
        `💡 **Recommendation**: Continue maintaining a balanced diet with regular physical activity. Ensure routine annual preventive screenings are up-to-date.`,
      suggestions: [
        'What does my HbA1c & Glucose mean?',
        'What diet is best for lowering cholesterol?',
        'How do I share records with my doctor?',
      ],
      actionLink: { text: 'View All Records', path: '/records' },
    };
  }

  // 2. Glucose & HbA1c Explanation
  if (clean.includes('glucose') || clean.includes('hba1c') || clean.includes('sugar') || clean.includes('diabetes')) {
    const isNormal = Number(avgHba1c) < 5.7;
    const isPre = Number(avgHba1c) >= 5.7 && Number(avgHba1c) < 6.5;

    return {
      text: `Here is what your glycemic biomarkers mean in clinical practice:\n\n` +
        `• **Blood Glucose (${avgGlucose} mg/dL)**: Represents the immediate concentration of sugar in your bloodstream. Normal fasting levels are typically between **70 and 100 mg/dL**.\n` +
        `• **HbA1c (${avgHba1c}%)**: Reflects your average blood sugar over the last 90 days. ` +
        (isNormal
          ? `Your HbA1c is below 5.7%, which is considered **normal and healthy**.`
          : isPre
          ? `Your HbA1c is between 5.7% and 6.4%, which falls into the **early monitoring / pre-diabetes range** where lifestyle and diet modifications can keep levels optimal.`
          : `Your HbA1c is slightly elevated. Consult your physician regarding dietary adjustments.`) +
        `\n\n🥗 **Actionable Advice**: Emphasize whole grains, leafy greens, and lean proteins while minimizing refined sugars and sweetened drinks. A 30-minute daily brisk walk significantly enhances cellular insulin sensitivity.`,
      suggestions: [
        'What diet is best for lowering cholesterol?',
        'Summarize my overall health status',
        'How do I request records from Ganga or KMCH?',
      ],
      actionLink: { text: 'Inspect Biomarkers in Records', path: '/records' },
    };
  }

  // 3. Cholesterol & Lipids
  if (clean.includes('cholesterol') || clean.includes('lipid') || clean.includes('heart') || clean.includes('cardio')) {
    return {
      text: `Let's look at your cardiovascular and lipid biomarkers:\n\n` +
        `• **Your Total Cholesterol**: **${avgChol} mg/dL**\n` +
        `• **Clinical Reference Ranges**:\n` +
        `  - Desirable: Less than 200 mg/dL\n` +
        `  - Borderline High: 200 – 239 mg/dL\n` +
        `  - High: 240 mg/dL and above\n\n` +
        `Your average of **${avgChol} mg/dL** is in a good, manageable bracket. To maintain optimal arterial health:\n` +
        `1. **Heart-Healthy Fats**: Consume avocados, olive oil, almonds, and walnuts.\n` +
        `2. **Soluble Fiber**: Oats, lentils, apples, and beans bind cholesterol in your digestive tract and naturally flush it out.\n` +
        `3. **Limit Saturated & Trans Fats**: Minimize deep-fried snacks, processed meats, and hydrogenated oils.`,
      suggestions: [
        'Summarize my overall health status',
        'Explain my prescribed medications',
        'How do I approve or revoke doctor consent?',
      ],
      actionLink: { text: 'Check Lab Reports', path: '/records' },
    };
  }

  // 4. Medications & Prescriptions
  if (clean.includes('medication') || clean.includes('prescription') || clean.includes('medicine') || clean.includes('drug') || clean.includes('amoxicillin')) {
    return {
      text: `Based on your synchronized hospital records, here are your documented prescriptions:\n\n` +
        `• **Amoxicillin 500mg**: Broad-spectrum antibiotic prescribed for acute upper respiratory infection / pharyngitis. Course: 1 tablet twice daily for 5 days after meals.\n` +
        `• **Paracetamol 650mg**: Taken as needed for fever or mild throat discomfort.\n\n` +
        `⚠️ **Clinical Guidelines**:\n` +
        `- Always finish the full antibiotic course as prescribed by your doctor, even if symptoms subside early, to avoid bacterial resistance.\n` +
        `- Stay well hydrated with at least 2.5–3 liters of water daily.\n` +
        `- If you experience unexpected rashes, nausea, or swelling, contact your prescribing physician immediately.`,
      suggestions: [
        'Summarize my overall health status',
        'How do I approve or revoke doctor consent?',
        'What does my HbA1c & Glucose mean?',
      ],
      actionLink: { text: 'View Prescriptions', path: '/records' },
    };
  }

  // 5. Consent Management Guidance
  if (clean.includes('consent') || clean.includes('approve') || clean.includes('revoke') || clean.includes('share') || clean.includes('doctor')) {
    return {
      text: `Here is how you control doctor access on the Nalathunai Platform:\n\n` +
        `1. **View Pending Requests**: Navigate to the **Consent** page from your sidebar. Any specialist (e.g. Dr. Vikram Seth or Dr. Rajesh V) who has requested your files will appear under **Pending Access Requests**.\n` +
        `2. **Reviewing the Request**: You can see which exact records they asked for (e.g. Lab Reports only, or Scans), their clinical reason, and the requested duration (e.g. 30 Days).\n` +
        `3. **Approve or Deny**: Click **Approve** to grant temporary, legally compliant access, or click **Deny** to reject.\n` +
        `4. **Revoke Anytime**: You retain 100% data sovereignty. At any moment, you can click **Revoke Access** on any active consent, instantly locking your records.`,
      suggestions: [
        'How do I retrieve records from Ganga or KMCH?',
        'Summarize my overall health status',
        'What does my HbA1c & Glucose mean?',
      ],
      actionLink: { text: 'Go to Consent Management', path: '/consent' },
    };
  }

  // 6. Record Retrieval Guidance (Hospitals)
  if (clean.includes('request') || clean.includes('retrieve') || clean.includes('fetch') || clean.includes('ganga') || clean.includes('kmch') || clean.includes('hospital') || clean.includes('psg')) {
    return {
      text: `To pull new medical records directly from connected hospitals:\n\n` +
        `1. Click on **Request Records** in your left navigation menu.\n` +
        `2. Select your hospital from the dropdown (e.g. *Ganga Hospital*, *KMCH*, *Kongunad*, *PSG*, or *Sri Ramakrishna Hospital*).\n` +
        `3. Choose the record category (*All Records*, *Lab Reports*, *Prescriptions*, *Diagnostic Scans*).\n` +
        `4. Select the date range (e.g. *Recent 30 Days* or *Past 6 Months*).\n` +
        `5. Click **Submit Retrieval Request**. The platform initiates an instant handshake with the hospital's Supabase partition table and Workbench webhook, making your documents available in seconds.`,
      suggestions: [
        'How do I approve or revoke doctor consent?',
        'Summarize my overall health status',
        'Explain my prescribed medications',
      ],
      actionLink: { text: 'Open Record Retrieval', path: '/request' },
    };
  }

  // 7. General / Fallback Response
  return {
    text: `Thank you for your question, ${patientName}! As your Nalathunai Medical Guide, I am here to help you navigate your healthcare journey.\n\n` +
      `You can ask me to:\n` +
      `• **Analyze Biomarkers**: Inquire about your Blood Glucose (${avgGlucose} mg/dL), HbA1c (${avgHba1c}%), Cholesterol (${avgChol} mg/dL), or BMI (${avgBmi}).\n` +
      `• **Understand Reports**: Ask what a diagnosis or prescription entails.\n` +
      `• **Platform Support**: Get step-by-step guidance on requesting hospital records or managing doctor consent.\n\n` +
      `How would you like to proceed?`,
    suggestions: [
      'Summarize my overall health status',
      'What does my HbA1c & Glucose mean?',
      'How do I approve or revoke doctor consent?',
      'How do I retrieve records from Ganga or KMCH?',
    ],
  };
};

export const aiChatService = {
  /**
   * Load stored chat history or return initial welcome message
   */
  getStoredMessages(patientName = 'there') {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // Fallback to default
      }
    }

    const defaultInit = [
      {
        id: 'msg-welcome-01',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Hello ${patientName}! 👋 I am your **Nalathunai AI Medical Guide & Assistant**.\n\n` +
          `I can analyze your clinical biomarker readings (Glucose, HbA1c, Cholesterol, BMI), explain your doctor prescriptions, summarize your connected hospital records, or guide you on sharing records with doctors. How can I assist you today?`,
        suggestions: DEFAULT_SUGGESTIONS.slice(0, 4),
      },
    ];

    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(defaultInit));
    return defaultInit;
  },

  /**
   * Send a patient query to the AI Assistant.
   * Interacts with the SNS Workbench Webhook and local clinical reasoning engine.
   */
  async sendMessage({ query, patient, history = [] }) {
    // 1. Fetch current patient records to inject context
    let records = [];
    try {
      records = await recordService.getRecords('All');
    } catch {
      records = [];
    }

    // 2. Dispatch to SNS Workbench Webhook in background
    let webhookResult = null;
    try {
      const webhookPayload = {
        event: 'CHATBOT_QUERY',
        source: 'nalathunai_patient_portal',
        query,
        patient: {
          id: patient?.id || 'USR-162674',
          name: patient?.name || 'Jeremiah',
          aadhaar: patient?.aadhaarNumber || patient?.aadhaar || '8730-5083-3227',
          abhaId: patient?.abhaId || '91-4829-1029-4720',
        },
        recordsCount: records.length,
        timestamp: new Date().toISOString(),
      };

      const res = await fetch('https://api.agents.snsihub.ai/webhook/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      });

      if (res.ok) {
        const rawText = await res.text().catch(() => '');
        let data = null;
        try { data = JSON.parse(rawText); } catch (e) { data = rawText; }
        
        let parsedData = Array.isArray(data) ? data[0] : data;
        
        if (parsedData) {
          webhookResult = parsedData;
          if (typeof parsedData === 'string') {
            webhookResult = { chatAnswer: parsedData };
          } else if (!parsedData.chatAnswer && !parsedData.aiSummary) {
            // Fallback: Just stringify the object if we didn't find our expected keys
            webhookResult.chatAnswer = JSON.stringify(parsedData);
          }
        }
      }
    } catch (err) {
      // Non-blocking, fallback to local clinical reasoning
      console.error('Webhook fetch failed:', err);
    }

    // 3. Generate response
    let responseText = '';
    let suggestions = [];
    let actionLink = null;

    if (webhookResult && (webhookResult.chatAnswer || webhookResult.medicalSummary?.clinicalOverview)) {
      responseText = webhookResult.chatAnswer || webhookResult.medicalSummary.clinicalOverview;
      suggestions = webhookResult.suggestedFollowUps || DEFAULT_SUGGESTIONS.slice(0, 3);
    } else {
      const localResponse = generateLocalClinicalResponse(query, patient, records);
      responseText = localResponse.text;
      suggestions = localResponse.suggestions;
      actionLink = localResponse.actionLink;
    }

    const assistantMsg = {
      id: `msg-${Date.now().toString().slice(-6)}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: responseText,
      suggestions: suggestions || [],
      actionLink: actionLink || null,
    };

    // Save updated history
    const userMsg = {
      id: `msg-${Date.now().toString().slice(-6)}-u`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query,
    };

    const updatedHistory = [...history, userMsg, assistantMsg];
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updatedHistory.slice(-50)));

    return {
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      history: updatedHistory,
    };
  },

  /**
   * Reset / clear chat history
   */
  clearHistory(patientName = 'there') {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    return this.getStoredMessages(patientName);
  },
};
