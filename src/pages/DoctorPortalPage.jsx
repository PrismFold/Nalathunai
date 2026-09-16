import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hospitalDoctorService } from '../services/hospitalDoctorService';
import { supabaseService } from '../services/supabaseService';
import { recordService } from '../services/recordService';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import {
  Stethoscope,
  Search,
  User,
  ShieldCheck,
  Clock,
  Building2,
  LogOut,
  Send,
  Sparkles,
  Award,
  CheckCircle2,
  Lock,
  Eye,
  RefreshCw,
} from 'lucide-react';

const RECORD_TYPES_LIST = [
  'All Medical Records',
  'Lab Reports',
  'Prescriptions',
  'Consultations',
  'Scans',
];

const DURATION_OPTIONS = [
  { value: '24 Hours', label: '24 Hours (Emergency / Immediate Review)' },
  { value: '7 Days', label: '7 Days (Follow-up Consultation)' },
  { value: '15 Days', label: '15 Days (Short-term Treatment Course)' },
  { value: '30 Days', label: '30 Days (Standard Care Episode)' },
  { value: '90 Days', label: '90 Days (Chronic Disease Management)' },
];

export const DoctorPortalPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Tab State: 'search' | 'requests' | 'authorized'
  const [activeTab, setActiveTab] = useState('search');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [patients, setPatients] = useState([]);

  // Modal State for Requesting Consent
  const [selectedPatientForConsent, setSelectedPatientForConsent] = useState(null);
  const [consentCategories, setConsentCategories] = useState(['All Medical Records']);
  const [consentPurpose, setConsentPurpose] = useState('Comprehensive clinical evaluation & diagnostic biomarker review');
  const [consentDuration, setConsentDuration] = useState('30 Days');
  const [isSubmittingConsent, setIsSubmittingConsent] = useState(false);
  const [consentSuccessMsg, setConsentSuccessMsg] = useState('');

  // Selected Patient Record View (when Consent is Active)
  const [activePatientRecordView, setActivePatientRecordView] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [clinicalSummary, setClinicalSummary] = useState(null);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  // Consent Requests History
  const [myRequests, setMyRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Active Doctor object
  const doctor = useMemo(() => {
    return {
      id: user?.id || 'DOC-101',
      name: user?.name || 'Dr. Vikram Seth',
      specialization: user?.specialization || 'Cardiology',
      hospitalName: user?.hospitalName || 'Ganga Hospital',
      regNumber: user?.regNumber || 'NMC-TN-2015-8491',
      email: user?.email || 'dr.vikram@gangahospital.com',
      hospitalId: user?.hospitalId || 'HOSP-001',
    };
  }, [user]);

  // Load patients and requests on mount
  const handleSearch = useCallback(async (query = '') => {
    setIsSearching(true);
    try {
      const results = await hospitalDoctorService.searchPatients(query, doctor.id);
      setPatients(results);
    } finally {
      setIsSearching(false);
    }
  }, [doctor.id]);

  const loadMyRequests = useCallback(async () => {
    setIsLoadingRequests(true);
    try {
      const list = await hospitalDoctorService.getDoctorConsentRequests(doctor.id);
      setMyRequests(list);
    } finally {
      setIsLoadingRequests(false);
    }
  }, [doctor.id]);

  useEffect(() => {
    handleSearch('');
    loadMyRequests();
  }, [handleSearch, loadMyRequests]);

  // Handle Consent Modal Submission
  const handleOpenConsentModal = (patient) => {
    setSelectedPatientForConsent(patient);
    setConsentCategories(['Lab Reports', 'Prescriptions']);
    setConsentPurpose(`Clinical evaluation for ${patient.name} at ${doctor.hospitalName}`);
    setConsentDuration('30 Days');
    setConsentSuccessMsg('');
  };

  const handleToggleCategory = (cat) => {
    if (cat === 'All Medical Records') {
      setConsentCategories(['All Medical Records']);
      return;
    }
    const filtered = consentCategories.filter((c) => c !== 'All Medical Records');
    if (filtered.includes(cat)) {
      const next = filtered.filter((c) => c !== cat);
      setConsentCategories(next.length > 0 ? next : ['All Medical Records']);
    } else {
      setConsentCategories([...filtered, cat]);
    }
  };

  const handleSubmitConsentRequest = async (e) => {
    e.preventDefault();
    if (!selectedPatientForConsent) return;
    setIsSubmittingConsent(true);

    try {
      const consentRecord = await hospitalDoctorService.requestConsent({
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialization: doctor.specialization,
        hospitalId: doctor.hospitalId,
        hospitalName: doctor.hospitalName,
        patientId: selectedPatientForConsent.id,
        patientName: selectedPatientForConsent.name,
        patientAadhaar: selectedPatientForConsent.aadhaar,
        patientAbha: selectedPatientForConsent.abhaId,
        requestedRecords: consentCategories,
        purpose: consentPurpose,
        duration: consentDuration,
      });

      // Dispatch event to SNS Workbench Webhook
      await recordService.sendDoctorConsentWebhook({
        doctor,
        patient: selectedPatientForConsent,
        consent: consentRecord,
        action: 'DOCTOR_CONSENT_REQUEST',
      });

      setConsentSuccessMsg(`Consent request successfully dispatched to ${selectedPatientForConsent.name}.`);
      await handleSearch(searchQuery);
      await loadMyRequests();

      setTimeout(() => {
        setSelectedPatientForConsent(null);
        setConsentSuccessMsg('');
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to submit consent request');
    } finally {
      setIsSubmittingConsent(false);
    }
  };

  // Inspect Consented Patient Records
  const handleInspectRecords = async (patient) => {
    setActivePatientRecordView(patient);
    setIsLoadingRecords(true);
    try {
      // Fetch multi-hospital records from Supabase
      const records = await recordService.getRecords('All');
      const summary = supabaseService.generateClinicalSummary(records);
      setPatientRecords(records);
      setClinicalSummary(summary);

      // Log access audit
      hospitalDoctorService.logAuditEvent({
        hospitalId: doctor.hospitalId,
        hospitalName: doctor.hospitalName,
        doctorId: doctor.id,
        doctorName: doctor.name,
        patientId: patient.id,
        patientName: patient.name,
        action: 'RECORD_VIEWED',
        resourceType: 'Clinical Biomarkers & Hospital Records',
        details: `Doctor inspected ${records.length} records under valid consent.`,
      });
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Filter authorized patients
  const authorizedPatients = useMemo(() => {
    return patients.filter((p) => p.consentStatus === 'Active');
  }, [patients]);

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#2F2D29] flex flex-col font-sans">
      
      {/* TOP CLINICAL APP HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5DDD0] shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="small" />
            <span className="hidden sm:inline-block w-px h-5 bg-stone-300 mx-1" />
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#e8f3f3] text-[#0f5257] rounded-full text-xs font-semibold">
              <Stethoscope size={13} /> Doctor Clinical Console
            </div>
          </div>

          {/* Doctor Profile Pill & Actions */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-stone-900 flex items-center justify-end gap-1">
                {doctor.name}
                <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-mono">
                  {doctor.regNumber}
                </span>
              </div>
              <div className="text-[11px] text-stone-500">
                {doctor.specialization} · {doctor.hospitalName}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* SUB-HEADER / TAB NAVIGATION */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('search')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'search'
                ? 'border-[#0f5257] text-[#0f5257]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Search size={14} /> Search &amp; Patient Registry
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'requests'
                ? 'border-[#0f5257] text-[#0f5257]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Clock size={14} /> My Consent Requests
            <span className="ml-1 px-1.5 py-0.5 bg-stone-100 text-stone-600 text-[10px] rounded-full font-mono">
              {myRequests.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('authorized')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'authorized'
                ? 'border-[#0f5257] text-[#0f5257]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShieldCheck size={14} /> Authorized Patients (Consent Active)
            <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-mono">
              {authorizedPatients.length}
            </span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        
        {/* DOCTOR BANNER */}
        <div className="bg-gradient-to-r from-[#0f5257] to-[#1e3a5f] rounded-2xl p-6 text-white shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">{doctor.name}</h1>
                <span className="bg-white/20 text-white text-[11px] px-2 py-0.5 rounded-full font-medium">
                  {doctor.specialization}
                </span>
              </div>
              <p className="text-xs text-white/80 flex items-center gap-2">
                <Building2 size={13} /> {doctor.hospitalName}
                <span>·</span>
                <Award size={13} /> Reg No: {doctor.regNumber}
                <span>·</span>
                <span>Active Clinical Session</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-4 py-2 rounded-xl text-center">
                <div className="text-lg font-bold font-mono">{authorizedPatients.length}</div>
                <div className="text-[10px] text-white/75 uppercase tracking-wider font-medium">Active Consents</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-4 py-2 rounded-xl text-center">
                <div className="text-lg font-bold font-mono">{myRequests.filter(r => r.status === 'Pending').length}</div>
                <div className="text-[10px] text-white/75 uppercase tracking-wider font-medium">Pending Requests</div>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 1: PATIENT SEARCH & CONSENT REQUEST */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            
            {/* Search Bar Container */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-stone-900">Search Patient Healthcare Identifier</h2>
                  <p className="text-xs text-stone-500">
                    Query patients across Tamil Nadu ABDM network by Aadhaar, Full Name, ABHA ID, or Mobile
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSearch(searchQuery)}
                  className="text-xs font-semibold text-[#0f5257] hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={12} className={isSearching ? 'animate-spin' : ''} /> Refresh Registry
                </button>
              </div>

              <div className="relative">
                <Search size={18} className="absolute left-4 top-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Enter 12-digit Aadhaar (e.g. 8730-5083-3227), ABHA ID, or Patient Name (e.g. Ananya Ramesh, Jeremiah)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 hover:bg-white focus:bg-white border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0f5257]/20 focus:border-[#0f5257] transition-all"
                />
              </div>

              {/* Quick Search Pills */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-[11px] text-stone-400 font-medium">Quick Query:</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('8730-5083-3227');
                    handleSearch('8730-5083-3227');
                  }}
                  className="text-[11px] font-mono bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-md transition-colors"
                >
                  Aadhaar: 8730-5083-3227 (Ananya Ramesh)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('Jeremiah');
                    handleSearch('Jeremiah');
                  }}
                  className="text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-md transition-colors"
                >
                  Jeremiah (USR-162674)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('Vasantha');
                    handleSearch('Vasantha');
                  }}
                  className="text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-md transition-colors"
                >
                  Vasantha Kumaraswamy
                </button>
              </div>
            </div>

            {/* Results Grid */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Patient Records Found ({patients.length})
                </span>
                <span className="text-xs text-stone-400">
                  Consent required before medical file access
                </span>
              </div>

              {patients.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center space-y-2">
                  <User size={32} className="mx-auto text-stone-300" />
                  <h3 className="text-sm font-semibold text-stone-800">No Patient Records Matched</h3>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    Try entering an alternate Aadhaar number, ABHA ID or search term.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patients.map((patient) => {
                    const isConsentActive = patient.consentStatus === 'Active';
                    const isConsentPending = patient.consentStatus === 'Pending';

                    return (
                      <div
                        key={patient.id}
                        className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs hover:border-stone-300 transition-all space-y-4"
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-sm">
                              {patient.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-stone-900">{patient.name}</h3>
                              <div className="text-xs text-stone-500 font-mono flex items-center gap-1.5">
                                <span>Aadhaar: {patient.aadhaar}</span>
                                <span>·</span>
                                <span>ABHA: {patient.abhaId}</span>
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          {isConsentActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ShieldCheck size={12} /> Consent Active
                            </span>
                          ) : isConsentPending ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock size={12} /> Pending Approval
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                              <Lock size={12} /> No Consent
                            </span>
                          )}
                        </div>

                        {/* Patient Demographics */}
                        <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-stone-50 rounded-xl text-center text-xs">
                          <div>
                            <span className="text-[10px] uppercase text-stone-400 block font-medium">Blood Group</span>
                            <span className="font-bold text-stone-800">{patient.bloodGroup || 'O+'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-stone-400 block font-medium">Gender</span>
                            <span className="font-bold text-stone-800">{patient.gender || 'Female'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-stone-400 block font-medium">City</span>
                            <span className="font-bold text-stone-800">{patient.city || 'Coimbatore'}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-1 flex items-center gap-2">
                          {isConsentActive ? (
                            <button
                              type="button"
                              onClick={() => handleInspectRecords(patient)}
                              className="flex-1 py-2.5 px-4 bg-[#0f5257] hover:bg-[#0c4246] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                            >
                              <Eye size={14} /> Inspect Consented Records &amp; AI Summary
                            </button>
                          ) : isConsentPending ? (
                            <div className="flex-1 py-2.5 px-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                              <span className="flex items-center gap-1.5 font-medium">
                                <Clock size={13} className="text-amber-600" />
                                Consent Request Sent to Patient
                              </span>
                              <span className="text-[10px] text-amber-600">Expires in 30d</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenConsentModal(patient)}
                              className="flex-1 py-2.5 px-4 bg-[#e8f3f3] hover:bg-[#d5ecec] text-[#0f5257] rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-[#b8dfdf] transition-colors"
                            >
                              <Send size={13} /> Request Consent for Patient Records
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY CONSENT REQUESTS */}
        {activeTab === 'requests' && (
          <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden space-y-0">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-stone-900">Consent Requests Dispatched</h2>
                <p className="text-xs text-stone-500">
                  Track status of access permissions requested from patients
                </p>
              </div>
              <button
                type="button"
                onClick={loadMyRequests}
                className="text-xs font-semibold text-[#0f5257] hover:underline flex items-center gap-1"
              >
                <RefreshCw size={12} className={isLoadingRequests ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            {myRequests.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Clock size={32} className="mx-auto text-stone-300" />
                <h3 className="text-sm font-semibold text-stone-800">No Consent Requests Made Yet</h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Search for a patient in the registry and click "Request Consent" to initiate access.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {myRequests.map((req) => (
                  <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">{req.patientName}</span>
                        <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded">
                          {req.patientAadhaar}
                        </span>
                        {req.status === 'Active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Approved &amp; Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Pending Patient Approval
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-600">
                        <strong>Purpose:</strong> {req.purpose}
                      </p>

                      <div className="text-[11px] text-stone-400 flex items-center gap-3">
                        <span>Requested Files: {Array.isArray(req.requestedRecords) ? req.requestedRecords.join(', ') : req.requestedRecords}</span>
                        <span>·</span>
                        <span>Duration: {req.duration}</span>
                        <span>·</span>
                        <span>Requested: {new Date(req.requestedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div>
                      {req.status === 'Active' ? (
                        <button
                          type="button"
                          onClick={() => handleInspectRecords({ id: req.patientId, name: req.patientName, aadhaar: req.patientAadhaar })}
                          className="px-3 py-1.5 bg-[#0f5257] hover:bg-[#0c4246] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Eye size={12} /> View Records
                        </button>
                      ) : (
                        <span className="text-xs text-stone-400 italic">Waiting for Patient</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUTHORIZED PATIENTS */}
        {activeTab === 'authorized' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-stone-900">Authorized Patient Directory</h2>
                <p className="text-xs text-stone-500">
                  Patients with currently active, legally binding consents granted to {doctor.name}
                </p>
              </div>
            </div>

            {authorizedPatients.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center space-y-2">
                <ShieldCheck size={32} className="mx-auto text-stone-300" />
                <h3 className="text-sm font-semibold text-stone-800">No Currently Active Consents</h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  When patients approve your record requests in their Nalathunai portal, they will automatically unlock here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {authorizedPatients.map((patient) => (
                  <div key={patient.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-stone-900">{patient.name}</h3>
                        <div className="text-xs text-stone-500 font-mono">
                          Aadhaar: {patient.aadhaar} · ABHA: {patient.abhaId}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Consent Active
                      </span>
                    </div>

                    <div className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl space-y-1">
                      <div><strong>Primary Hospital:</strong> {patient.primaryHospital}</div>
                      <div><strong>Contact:</strong> {patient.phone}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInspectRecords(patient)}
                      className="w-full py-2 px-3 bg-[#0f5257] hover:bg-[#0c4246] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye size={13} /> Open Clinical Records &amp; Biomarkers
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CLINICAL RECORD INSPECTION DRAWER / MODAL */}
        {activePatientRecordView && (
          <Modal
            isOpen={!!activePatientRecordView}
            onClose={() => setActivePatientRecordView(null)}
            title={`Clinical Records: ${activePatientRecordView.name}`}
            maxWidth="max-w-4xl"
          >
            <div className="space-y-6">
              
              {/* Patient Badge */}
              <div className="bg-[#e8f3f3]/60 border border-[#c1e2e2] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900">{activePatientRecordView.name}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      Legally Consented Access
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 font-mono">
                    Aadhaar: {activePatientRecordView.aadhaar} · Accessing Practitioner: {doctor.name}
                  </div>
                </div>
                <div className="text-xs text-[#0f5257] font-medium flex items-center gap-1">
                  <ShieldCheck size={14} /> End-to-End Audit Logged
                </div>
              </div>

              {isLoadingRecords ? (
                <div className="py-12 text-center text-xs text-stone-500 space-y-2">
                  <RefreshCw size={24} className="animate-spin mx-auto text-[#0f5257]" />
                  <p>Retrieving diagnostic biomarker records from Supabase hospital partition...</p>
                </div>
              ) : (
                <>
                  {/* AI CLINICAL SYNTHESIS CARD */}
                  {clinicalSummary && (
                    <div className="bg-gradient-to-br from-white to-stone-50 border border-stone-200 rounded-xl p-4 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                          <Sparkles size={14} className="text-[#0f5257]" />
                          Gemini Clinical Synthesis &amp; Biomarker Analysis
                        </div>
                        <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                          SNS Workbench LLM Agent
                        </span>
                      </div>

                      <p className="text-xs text-stone-700 leading-relaxed bg-stone-50/80 p-3 rounded-lg border border-stone-100">
                        {clinicalSummary.clinicalOverview}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-xs">
                        <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                          <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">Glycemic Control</span>
                          <span className="text-stone-700 font-medium">{clinicalSummary.vitalsAssessment?.glycemicControl}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                          <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">Cardiovascular &amp; Lipids</span>
                          <span className="text-stone-700 font-medium">{clinicalSummary.vitalsAssessment?.cardiovascular}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                          <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">BMI Metric</span>
                          <span className="text-stone-700 font-medium">{clinicalSummary.vitalsAssessment?.bmiStatus}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* RECORDS LIST */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Consented Clinical Files ({patientRecords.length})
                    </h4>
                    <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto border border-stone-200 rounded-xl">
                      {patientRecords.map((rec) => (
                        <div key={rec.id} className="p-3.5 bg-white hover:bg-stone-50 flex items-center justify-between transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-900">{rec.title}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">
                                {rec.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500">
                              {rec.hospital} · Visit Date: {rec.date}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] font-mono text-stone-400 block">{rec.fileSize || '1.2 MB'}</span>
                            <span className="text-[11px] font-semibold text-[#0f5257]">Available (PDF)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="pt-2 flex justify-end">
                <Button variant="secondary" onClick={() => setActivePatientRecordView(null)}>
                  Close Viewer
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* REQUEST CONSENT MODAL */}
        {selectedPatientForConsent && (
          <Modal
            isOpen={!!selectedPatientForConsent}
            onClose={() => setSelectedPatientForConsent(null)}
            title="Request Clinical Record Consent"
            maxWidth="max-w-lg"
          >
            {consentSuccessMsg ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-stone-900">Consent Request Dispatched!</h4>
                <p className="text-xs text-stone-500">{consentSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitConsentRequest} className="space-y-4">
                
                {/* Patient Summary Header */}
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-stone-900">{selectedPatientForConsent.name}</div>
                    <div className="text-[11px] text-stone-500 font-mono">
                      Aadhaar: {selectedPatientForConsent.aadhaar}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-stone-500">
                    <div>Requester: <strong>{doctor.name}</strong></div>
                    <div>{doctor.hospitalName}</div>
                  </div>
                </div>

                {/* Granular Record Types Selection */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-2">
                    Select Specific Health Files / Categories to Request *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {RECORD_TYPES_LIST.map((type) => {
                      const checked = consentCategories.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleToggleCategory(type)}
                          className={`px-3 py-2 text-xs font-medium rounded-lg border text-left flex items-center justify-between transition-colors ${
                            checked
                              ? 'bg-[#0f5257]/10 border-[#0f5257] text-[#0f5257] font-semibold'
                              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          <span>{type}</span>
                          {checked && <CheckCircle2 size={13} className="text-[#0f5257]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clinical Purpose */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Clinical Purpose / Medical Justification *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={consentPurpose}
                    onChange={(e) => setConsentPurpose(e.target.value)}
                    placeholder="e.g. Pre-operative cardiac evaluation and medication review"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f5257]/30"
                  />
                </div>

                {/* Access Duration */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Access Permission Duration *
                  </label>
                  <select
                    value={consentDuration}
                    onChange={(e) => setConsentDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f5257]/30"
                  >
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Legal Note */}
                <p className="text-[11px] text-stone-400 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-[#0f5257]" />
                  The patient will receive this request with full authority to grant or deny access.
                </p>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setSelectedPatientForConsent(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingConsent}
                    icon={Send}
                  >
                    {isSubmittingConsent ? 'Dispatching Request…' : 'Send Consent Request'}
                  </Button>
                </div>
              </form>
            )}
          </Modal>
        )}
      </main>
    </div>
  );
};
