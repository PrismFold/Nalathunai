import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { patientSearchService } from '../../services/patientSearchService';
import { doctorConsentService } from '../../services/doctorConsentService';
import { RequestConsentModal } from '../../components/RequestConsentModal';
import { Button } from '../../components/Button';
import {
  Search,
  ShieldCheck,
  Clock,
  CheckCircle2,
  FileText,
  User,
  ShieldAlert,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';

export const DoctorPatientsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const regNumber = user?.registrationNumber || 'TN-MED-00123';

  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [consentModalPatient, setConsentModalPatient] = useState(null);

  const fetchPatientsWithConsent = async (query = '') => {
    setLoading(true);
    try {
      const list = await patientSearchService.searchPatients(query);
      const enriched = await Promise.all(
        list.map(async (p) => {
          const { status, consent } = await doctorConsentService.getPatientConsentStatus(
            p.id,
            regNumber
          );
          return { ...p, consentStatus: status, consent };
        })
      );
      setPatients(enriched);
      if (enriched.length > 0 && !selectedPatient) {
        setSelectedPatient(enriched[0]);
      } else if (selectedPatient) {
        const updatedSelected = enriched.find((item) => item.id === selectedPatient.id);
        if (updatedSelected) setSelectedPatient(updatedSelected);
      }
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientsWithConsent();
  }, [regNumber]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatientsWithConsent(searchQuery);
  };

  const handleConsentRequested = () => {
    fetchPatientsWithConsent(searchQuery);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-[#E5DDD0] pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-[#5D6454]" />
          <p className="text-[11px] uppercase tracking-widest text-[#787469] font-mono font-medium">
            Patient Directory &amp; Lookup
          </p>
        </div>
        <h1 className="text-3xl font-serif font-normal text-[#2F2D29] tracking-tight">
          Find Patient
        </h1>
        <p className="text-xs text-[#686358] mt-1">
          Search registered patients across the Nalathunai network. In compliance with patient privacy rules, clinical records are restricted until patient consent is granted.
        </p>
      </div>

      {/* Prominent Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3.5 text-[#A0988A]" />
          <input
            type="text"
            placeholder="Search by Patient ID (e.g. PAT-9082), Patient Name, or Registered Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#DED2C0] rounded-xl text-sm text-[#2F2D29] placeholder-[#A0988A] focus:outline-none focus:ring-2 focus:ring-[#5D6454]/25 focus:border-[#5D6454] transition-colors"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          variant="primary"
          disabled={loading}
          className="shrink-0"
        >
          {loading ? 'Searching…' : 'Search'}
        </Button>
      </form>

      {/* Two Column Workspace: Patient List + Selected Patient Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Patient List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-[#2F2D29]">
              Matching Patients ({patients.length})
            </span>
            <span className="text-[11px] text-[#787469] font-mono">Select to inspect</span>
          </div>

          {loading ? (
            <div className="p-8 bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl text-center text-xs text-[#8C877C]">
              Searching directory…
            </div>
          ) : patients.length === 0 ? (
            <div className="p-8 bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl text-center text-xs text-[#787469]">
              No patients found matching "{searchQuery}".
            </div>
          ) : (
            <div className="space-y-2.5">
              {patients.map((p) => {
                const isSelected = selectedPatient?.id === p.id;
                const isAccepted = p.consentStatus === 'Accepted';
                const isPending = p.consentStatus === 'Pending';
                const isRevoked = p.consentStatus === 'Revoked';
                const isRejected = p.consentStatus === 'Rejected';

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#EEE8DC] border-[#DED2C0] shadow-xs'
                        : 'bg-[#FAF7F2] border-[#E5DDD0] hover:bg-[#F4EFE6]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif font-semibold text-sm text-[#2F2D29]">
                          {p.name}
                        </h3>
                        <p className="text-[11px] font-mono text-[#787469] mt-0.5">
                          ID: {p.id} • {p.city}
                        </p>
                      </div>

                      {/* Status chip */}
                      {isAccepted ? (
                        <span className="px-2 py-0.5 bg-[#EFF4EA] border border-[#C5D9B4] text-[#345124] rounded text-[10px] font-semibold">
                          Access Granted
                        </span>
                      ) : isPending ? (
                        <span className="px-2 py-0.5 bg-[#FBF1E2] border border-[#EAD7B0] text-[#865F1D] rounded text-[10px] font-semibold">
                          Pending
                        </span>
                      ) : isRevoked ? (
                        <span className="px-2 py-0.5 bg-[#FDF2F0] border border-[#F3C4BE] text-[#9A2D23] rounded text-[10px] font-semibold">
                          Revoked
                        </span>
                      ) : isRejected ? (
                        <span className="px-2 py-0.5 bg-[#FDF2F0] border border-[#F3C4BE] text-[#9A2D23] rounded text-[10px] font-semibold">
                          Denied
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-[#EEE8DC] border border-[#DED2C0] text-[#787469] rounded text-[10px] font-semibold">
                          Consent Required
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Selected Patient Details & Privacy Guard (7 cols) */}
        <div className="lg:col-span-7">
          {selectedPatient ? (
            <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl p-6 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#E5DDD0]">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-serif font-semibold text-[#2F2D29]">
                      {selectedPatient.name}
                    </h2>
                    <span className="font-mono text-xs text-[#787469]">
                      {selectedPatient.id}
                    </span>
                  </div>
                  <p className="text-xs text-[#787469] mt-0.5">
                    ABHA: <span className="font-mono text-[#2F2D29]">{selectedPatient.abhaId || '—'}</span>
                  </p>
                </div>

                {/* Consent Status Badge */}
                {selectedPatient.consentStatus === 'Accepted' ? (
                  <div className="px-3 py-1 bg-[#EFF4EA] border border-[#C5D9B4] text-[#345124] rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#4E7737]" />
                    <span>Access Granted</span>
                  </div>
                ) : selectedPatient.consentStatus === 'Pending' ? (
                  <div className="px-3 py-1 bg-[#FBF1E2] border border-[#EAD7B0] text-[#865F1D] rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <Clock size={13} />
                    <span>Pending Patient Approval</span>
                  </div>
                ) : selectedPatient.consentStatus === 'Revoked' ? (
                  <div className="px-3 py-1 bg-[#FDF2F0] border border-[#F3C4BE] text-[#9A2D23] rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <ShieldAlert size={13} />
                    <span>Access Revoked</span>
                  </div>
                ) : selectedPatient.consentStatus === 'Rejected' ? (
                  <div className="px-3 py-1 bg-[#FDF2F0] border border-[#F3C4BE] text-[#9A2D23] rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <AlertCircle size={13} />
                    <span>Request Denied</span>
                  </div>
                ) : (
                  <div className="px-3 py-1 bg-[#EEE8DC] border border-[#DED2C0] text-[#787469] rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <ShieldCheck size={13} />
                    <span>Consent Required</span>
                  </div>
                )}
              </div>

              {/* Permitted Basic Identifying Information */}
              <div>
                <h3 className="text-xs font-semibold uppercase font-mono text-[#7D786D] tracking-wider mb-2.5">
                  Permitted Identifying Information
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-[#F4EFE6] p-4 rounded-xl border border-[#E5DDD0]">
                  <div>
                    <span className="text-[#8C877C] block text-[10px]">Age / Gender</span>
                    <span className="font-medium text-[#2F2D29]">{selectedPatient.age} yrs • {selectedPatient.gender}</span>
                  </div>
                  <div>
                    <span className="text-[#8C877C] block text-[10px]">Date of Birth</span>
                    <span className="font-medium text-[#2F2D29]">{selectedPatient.dob}</span>
                  </div>
                  <div>
                    <span className="text-[#8C877C] block text-[10px]">Blood Group</span>
                    <span className="font-medium text-[#2F2D29]">{selectedPatient.bloodGroup || 'O+'}</span>
                  </div>
                  <div>
                    <span className="text-[#8C877C] block text-[10px]">City / Location</span>
                    <span className="font-medium text-[#2F2D29]">{selectedPatient.city}</span>
                  </div>
                  <div>
                    <span className="text-[#8C877C] block text-[10px]">Primary Hospital</span>
                    <span className="font-medium text-[#2F2D29]">{selectedPatient.primaryHospital}</span>
                  </div>
                  <div>
                    <span className="text-[#8C877C] block text-[10px]">Registered Contact</span>
                    <span className="font-medium text-[#2F2D29]">{selectedPatient.email}</span>
                  </div>
                </div>
              </div>

              {/* STRICT PRIVACY BANNER & ACTION */}
              {selectedPatient.consentStatus === 'Accepted' ? (
                <div className="p-4 bg-[#EFF4EA] border border-[#C5D9B4] rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#345124] font-semibold">
                    <CheckCircle2 size={16} className="text-[#4E7737] shrink-0" />
                    <span>Patient has granted active consent for medical record access.</span>
                  </div>
                  <p className="text-[11px] text-[#4E7737]">
                    You may view diagnostic lab reports, clinical consultations, scan summaries, and prescriptions for this patient.
                  </p>
                  <Button
                    size="md"
                    variant="primary"
                    onClick={() => navigate(`/doctor/patients/${selectedPatient.id}`)}
                    icon={FileText}
                  >
                    View Medical Records
                  </Button>
                </div>
              ) : selectedPatient.consentStatus === 'Pending' ? (
                <div className="p-4 bg-[#FBF1E2] border border-[#EAD7B0] rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#865F1D] font-semibold">
                    <Clock size={16} className="shrink-0" />
                    <span>Consent Request Pending Patient Approval</span>
                  </div>
                  <p className="text-[11px] text-[#865F1D] leading-relaxed">
                    A consent request has been delivered to {selectedPatient.name}'s Nalathunai portal. Medical records remain locked until the patient explicitly reviews and approves the request.
                  </p>
                </div>
              ) : selectedPatient.consentStatus === 'Revoked' ? (
                <div className="p-4 bg-[#FDF2F0] border border-[#F3C4BE] rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#9A2D23] font-semibold">
                    <ShieldAlert size={16} className="shrink-0 text-[#C94F45]" />
                    <span>Access Revoked by Patient</span>
                  </div>
                  <p className="text-[11px] text-[#9A2D23] leading-relaxed">
                    The patient previously granted permission but has revoked authorization. All clinical record access has been immediately terminated in compliance with patient control policies.
                  </p>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setConsentModalPatient(selectedPatient)}
                    icon={ShieldCheck}
                  >
                    Send New Access Request
                  </Button>
                </div>
              ) : selectedPatient.consentStatus === 'Rejected' ? (
                <div className="p-4 bg-[#FDF2F0] border border-[#F3C4BE] rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#9A2D23] font-semibold">
                    <AlertCircle size={16} className="shrink-0 text-[#C94F45]" />
                    <span>Access Request Denied</span>
                  </div>
                  <p className="text-[11px] text-[#9A2D23] leading-relaxed">
                    The patient declined the previous record access request.
                  </p>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setConsentModalPatient(selectedPatient)}
                    icon={ShieldCheck}
                  >
                    Re-request Access
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-[#F4EFE6] border border-[#E5DDD0] rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#2F2D29] font-semibold">
                    <ShieldCheck size={16} className="text-[#5D6454] shrink-0" />
                    <span>Consent Required to View Clinical Records</span>
                  </div>
                  <p className="text-[11px] text-[#787469] leading-relaxed">
                    Under the Nalathunai patient-first architecture, doctors cannot automatically view health records after finding a patient. Send an explicit access request detailing the medical reason and records required.
                  </p>
                  <Button
                    size="md"
                    variant="primary"
                    onClick={() => setConsentModalPatient(selectedPatient)}
                    icon={ShieldCheck}
                  >
                    Request Access
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex items-center justify-center p-8 bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl text-xs text-[#787469]">
              Select a patient from the list to view profile and consent status.
            </div>
          )}
        </div>
      </div>

      {/* Request Consent Modal */}
      <RequestConsentModal
        isOpen={!!consentModalPatient}
        onClose={() => setConsentModalPatient(null)}
        patient={consentModalPatient}
        onConsentRequested={handleConsentRequested}
      />
    </div>
  );
};
