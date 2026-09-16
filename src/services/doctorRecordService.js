// Doctor Record Retrieval Service for Nalathunai Platform
// Strictly enforces patient consent before returning any medical records
// Automatically logs all record access events for compliance & audit history

import { mockSearchablePatients } from '../data/mockDoctorData';
import { doctorConsentService } from './doctorConsentService';
import { auditService } from './auditService';

export const doctorRecordService = {
  /**
   * Retrieve patient medical records.
   * STRICT ACCESS CONTROL: Only returns records if active consent exists!
   * 
   * @param {string} patientId 
   * @param {string} doctorRegNo 
   * @param {string} doctorName 
   */
  async getPatientRecords(patientId, doctorRegNo = 'TN-MED-00123', doctorName = 'Dr. Ananya Kumar') {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 1. Verify consent
    const { status, consent } = await doctorConsentService.getPatientConsentStatus(patientId, doctorRegNo);

    if (status !== 'Accepted') {
      // Log blocked unauthorized attempt
      await auditService.logAccess({
        patientId,
        patientName: 'Restricted Access',
        recordTitle: 'All Records Access Attempt',
        hospital: 'EHR Gateway',
        accessStatus: `Access Denied - Status is ${status}`,
        consentId: consent?.id || 'NONE',
        reason: 'Unauthorized access attempt blocked by consent gateway',
      });

      throw new Error(
        `Access denied. Medical records are restricted because patient consent is ${status.toUpperCase()}.`
      );
    }

    // 2. Locate patient
    const patient = mockSearchablePatients.find((p) => p.id === patientId);
    if (!patient) {
      throw new Error('Patient records not found.');
    }

    // 3. Log authorized access to audit trail
    await auditService.logAccess({
      patientId: patient.id,
      patientName: patient.name,
      recordTitle: 'Comprehensive Clinical File',
      hospital: patient.primaryHospital || 'PSG Hospital',
      accessStatus: 'Authorized - Active Consent',
      consentId: consent?.id || 'CONS-01',
      reason: consent?.purpose || 'Clinical care review',
    });

    return {
      patient: {
        id: patient.id,
        name: patient.name,
        dob: patient.dob,
        age: patient.age,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        city: patient.city,
        abhaId: patient.abhaId,
        primaryHospital: patient.primaryHospital,
      },
      consent,
      records: patient.records || [],
    };
  }
};
