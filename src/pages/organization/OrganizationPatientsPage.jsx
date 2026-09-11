import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { patientSearchService } from '../../services/patientSearchService';
import { organizationRequestService } from '../../services/organizationRequestService';
import { organizationDoctorService } from '../../services/organizationDoctorService';
import {
  Users,
  Search,
  SendHorizontal,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  Building2,
  AlertCircle,
  Plus,
  X,
  User,
  FileText,
} from 'lucide-react';

export const OrganizationPatientsPage = () => {
  const { user } = useAuth();
  const orgId = user?.orgId || 'HOSP-PSG-01';
  const orgName = user?.name || 'PSG Institute of Medical Sciences & Research';

  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Request Consent Modal State
  const [requestModalPatient, setRequestModalPatient] = useState(null);
  const [requestDoctorId, setRequestDoctorId] = useState('');
  const [requestPurpose, setRequestPurpose] = useState('Hospital clinical record verification & consultation');
  const [submitting, setSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');

  const loadData = async (query = '') => {
    setLoading(true);
    try {
      const [pts, docs, reqs] = await Promise.all([
        patientSearchService.searchPatients(query),
        organizationDoctorService.getDoctors(orgId),
        organizationRequestService.getRequests(orgId),
      ]);

      // Enrich patients with current hospital consent status
      const enriched = pts.map((p) => {
        const hospitalReq = reqs.find(
          (r) => r.patientId === p.id || r.patientAbha === p.abhaId
        );
        return {
          ...p,
          consentStatus: hospitalReq ? hospitalReq.status : 'No Request Sent',
          consentReq: hospitalReq || null,
        };
      });

      setPatients(enriched);
      setDoctors(docs);
      if (docs.length > 0 && !requestDoctorId) {
        setRequestDoctorId(docs[0].id);
      }
      if (enriched.length > 0 && !selectedPatient) {
        setSelectedPatient(enriched[0]);
      } else if (selectedPatient) {
        const updated = enriched.find((item) => item.id === selectedPatient.id);
        if (updated) setSelectedPatient(updated);
      }
    } catch (err) {
      console.error('Failed to load organization patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(searchQuery);
  }, [orgId, searchQuery]);

  const handleOpenRequestModal = (patient) => {
    setRequestModalPatient(patient);
    setRequestSuccess('');
  };

  const handleSendConsentRequest = async (e) => {
    e.preventDefault();
    if (!requestModalPatient) return;
    setSubmitting(true);
    try {
      const doc = doctors.find((d) => d.id === requestDoctorId);
      await organizationRequestService.createRequest(orgId, {
        patientName: requestModalPatient.name,
        patientId: requestModalPatient.id,
        patientAbha: requestModalPatient.abhaId,
        doctorId: doc ? doc.id : 'D001',
        doctorName: doc ? doc.name : 'Attending Specialist',
        hospitalName: orgName,
        purpose: requestPurpose,
        recordTypes: ['All Available Hospital Records'],
        accessLevel: 'View & Verify',
      });
      setRequestSuccess('Consent request successfully dispatched to patient via ABDM network.');
      setTimeout(() => {
        setRequestModalPatient(null);
        loadData(searchQuery);
      }, 1500);
    } catch (err) {
      alert('Failed to send consent request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2F2D29]">
          Patient Directory & Record Mediation
        </h1>
        <p className="text-xs text-[#787469] mt-0.5">
          Locate registered patients across the healthcare network, inspect active consent authorizations, and mediate records access without central storage.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-4 shadow-xs">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-3 text-[#A8A296]" />
          <input
            type="text"
            placeholder="Search by patient name, 14-digit ABHA ID, mobile number, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#D5CDBD] rounded-lg text-xs text-[#2F2D29] placeholder-[#A8A296] focus:outline-none focus:ring-1 focus:ring-[#2F2D29]"
          />
        </div>
      </div>

      {/* Main Split Grid: Left = Patients List, Right = Selected Patient Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patient List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E5DDD0] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#2F2D29] uppercase tracking-wider">
                Patients Found ({patients.length})
              </span>
              <span className="text-[10px] text-[#8C877C]">Select to inspect</span>
            </div>

            <div className="divide-y divide-[#E5DDD0] max-h-[600px] overflow-y-auto">
              {patients.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8C877C]">
                  No patients found matching your search.
                </div>
              ) : (
                patients.map((p) => {
                  const isSelected = selectedPatient?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPatient(p)}
                      className={`p-4 transition-colors cursor-pointer text-xs space-y-1.5 ${
                        isSelected ? 'bg-[#EEE8DC]' : 'hover:bg-[#F4EFE6]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#2F2D29]">{p.name}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            p.consentStatus === 'Accepted'
                              ? 'bg-[#EFF4EA] border-[#C5D9B4] text-[#345124]'
                              : p.consentStatus === 'Pending'
                              ? 'bg-[#FDF8E8] border-[#EADAA4] text-[#8C6D28]'
                              : 'bg-[#F4EFE6] border-[#D5CDBD] text-[#787469]'
                          }`}
                        >
                          {p.consentStatus}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[#787469]">{p.abhaId}</div>
                      <div className="text-[11px] text-[#8C877C] flex items-center justify-between pt-0.5">
                        <span>{p.city}</span>
                        <span>{p.gender}, {p.age} yrs</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detail Card & Consent Status (7 cols) */}
        <div className="lg:col-span-7">
          {selectedPatient ? (
            <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-6 shadow-xs space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E5DDD0] pb-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-[#E5DDD0] text-[#2F2D29] font-bold text-base flex items-center justify-center shrink-0 border border-[#D5CDBD]">
                    {selectedPatient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-[#2F2D29]">{selectedPatient.name}</h2>
                    <p className="font-mono text-xs text-[#4E7737] font-semibold">{selectedPatient.abhaId}</p>
                    <p className="text-[11px] text-[#787469] mt-0.5">
                      {selectedPatient.gender}, {selectedPatient.age} yrs • Blood Group: {selectedPatient.bloodGroup || 'O+'}
                    </p>
                  </div>
                </div>

                {/* Consent Request CTA */}
                <div className="shrink-0">
                  {selectedPatient.consentStatus === 'Accepted' ? (
                    <div className="px-3 py-1.5 bg-[#EFF4EA] border border-[#C5D9B4] text-[#345124] rounded-lg text-xs font-semibold flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-[#4E7737]" />
                      <span>Active Mediation Consent</span>
                    </div>
                  ) : selectedPatient.consentStatus === 'Pending' ? (
                    <div className="px-3 py-1.5 bg-[#FDF8E8] border border-[#EADAA4] text-[#8C6D28] rounded-lg text-xs font-semibold flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>Request Awaiting Patient</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenRequestModal(selectedPatient)}
                      className="px-3.5 py-2 rounded-lg bg-[#2F2D29] text-[#F7F3EA] hover:bg-[#433F38] transition-colors text-xs font-medium flex items-center gap-1.5 shadow-xs"
                    >
                      <SendHorizontal size={14} />
                      <span>Request Record Access</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Patient Core Attributes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-[#F4EFE6] rounded-lg border border-[#E5DDD0]">
                  <span className="text-[10px] text-[#8C877C] uppercase font-semibold">Contact Mobile</span>
                  <p className="font-medium text-[#2F2D29] mt-0.5">{selectedPatient.mobile}</p>
                </div>
                <div className="p-3 bg-[#F4EFE6] rounded-lg border border-[#E5DDD0]">
                  <span className="text-[10px] text-[#8C877C] uppercase font-semibold">Registered City</span>
                  <p className="font-medium text-[#2F2D29] mt-0.5">{selectedPatient.city}</p>
                </div>
                <div className="p-3 bg-[#F4EFE6] rounded-lg border border-[#E5DDD0]">
                  <span className="text-[10px] text-[#8C877C] uppercase font-semibold">Primary Hospital</span>
                  <p className="font-medium text-[#2F2D29] mt-0.5 truncate">{selectedPatient.primaryHospital || 'PSG Hospital'}</p>
                </div>
              </div>

              {/* Mediation & Access Status Explainer */}
              <div className="p-4 bg-white border border-[#D5CDBD] rounded-xl space-y-3 text-xs">
                <div className="flex items-center gap-2 text-[#2F2D29] font-semibold">
                  <Building2 size={15} className="text-[#5D6454]" />
                  <span>Nalathunai Federated Mediation Status</span>
                </div>
                <p className="text-[11px] text-[#787469] leading-relaxed">
                  Nalathunai acts solely as a secure mediator. Patient records reside in the source hospital databases. When valid consent is granted by the patient, clinical practitioners can retrieve and view records securely through this node.
                </p>

                {selectedPatient.consentStatus === 'Accepted' ? (
                  <div className="p-3 bg-[#EFF4EA] border border-[#C5D9B4] rounded-lg space-y-1 text-xs">
                    <div className="font-semibold text-[#345124] flex items-center gap-1.5">
                      <CheckCircle2 size={13} />
                      <span>Authorized for Clinical Review</span>
                    </div>
                    <p className="text-[11px] text-[#4E7737]">
                      Authorized doctor: {selectedPatient.consentReq?.doctorName || 'Attending Physician'}
                    </p>
                    <p className="text-[10px] text-[#787469]">
                      Valid until: {selectedPatient.consentReq?.expiryDate || 'Active window'}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-[#FDF8E8] border border-[#EADAA4] rounded-lg text-xs text-[#8C6D28] flex items-start gap-2">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>
                      Access to hospital records for this patient is restricted until explicit consent is granted via ABHA/Nalathunai.
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-12 text-center text-xs text-[#8C877C]">
              Select a patient from the directory to review credentials and mediation status.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Request Record Access */}
      {requestModalPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F2D29]/40 backdrop-blur-xs">
          <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DDD0] pb-3">
              <h3 className="text-sm font-semibold text-[#2F2D29]">
                Request Access: {requestModalPatient.name}
              </h3>
              <button onClick={() => setRequestModalPatient(null)} className="text-[#8C877C] hover:text-[#2F2D29]">
                <X size={16} />
              </button>
            </div>

            {requestSuccess ? (
              <div className="p-3 bg-[#EFF4EA] border border-[#C5D9B4] text-[#345124] rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#4E7737]" />
                <span>{requestSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleSendConsentRequest} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#555147] mb-1">Target Patient</label>
                  <div className="p-2.5 bg-[#F4EFE6] rounded-lg border border-[#E5DDD0] font-mono text-[11px]">
                    {requestModalPatient.name} ({requestModalPatient.abhaId})
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#555147] mb-1">Requesting Clinician</label>
                  <select
                    value={requestDoctorId}
                    onChange={(e) => setRequestDoctorId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialization})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#555147] mb-1">Clinical Justification / Purpose</label>
                  <input
                    type="text"
                    required
                    value={requestPurpose}
                    onChange={(e) => setRequestPurpose(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg"
                  />
                </div>

                <div className="p-2.5 bg-[#F4EFE6] border border-[#E5DDD0] rounded-lg text-[11px] text-[#787469]">
                  ABDM Tier-1 consent artifact will be sent to the patient for one-click approval.
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5DDD0]">
                  <button
                    type="button"
                    onClick={() => setRequestModalPatient(null)}
                    className="px-3.5 py-1.5 rounded-lg border border-[#D5CDBD] text-[#555147] hover:bg-[#EFEAE0]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-3.5 py-1.5 rounded-lg bg-[#2F2D29] text-[#F7F3EA] hover:bg-[#433F38]"
                  >
                    {submitting ? 'Transmitting...' : 'Send Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
