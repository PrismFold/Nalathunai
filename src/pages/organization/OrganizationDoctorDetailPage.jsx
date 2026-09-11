import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { organizationDoctorService } from '../../services/organizationDoctorService';
import { organizationRequestService } from '../../services/organizationRequestService';
import { organizationRecordService } from '../../services/organizationRecordService';
import { organizationAuditService } from '../../services/organizationAuditService';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Stethoscope,
  Mail,
  Phone,
  Calendar,
  FileText,
  ShieldCheck,
  Activity,
  SendHorizontal,
} from 'lucide-react';

export const OrganizationDoctorDetailPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const orgId = user?.orgId || 'HOSP-PSG-01';

  const [doctor, setDoctor] = useState(null);
  const [requests, setRequests] = useState([]);
  const [records, setRecords] = useState([]);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status toggle state
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    const loadDoctorDetails = async () => {
      setLoading(true);
      try {
        const doc = await organizationDoctorService.getDoctorById(doctorId, orgId);
        setDoctor(doc);

        const [allReqs, allRecs, allAudits] = await Promise.all([
          organizationRequestService.getRequests(orgId),
          organizationRecordService.getRecords(orgId),
          organizationAuditService.getAuditLogs(orgId),
        ]);

        // Filter for this doctor
        setRequests(allReqs.filter((r) => r.doctorId === doctorId || r.doctorName === doc.name));
        setRecords(allRecs.filter((r) => r.doctorId === doctorId || r.doctorName === doc.name));
        setAudits(allAudits.filter((a) => a.actorName === doc.name || a.actorRegNo === doc.registrationNumber));
      } catch (err) {
        console.error('Failed to load doctor detail:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDoctorDetails();
  }, [doctorId, orgId]);

  const handleToggleStatus = async () => {
    if (!doctor) return;
    const targetStatus = doctor.organization_access_status === 'Active' ? 'Suspended' : 'Active';
    setStatusUpdating(true);
    try {
      const updated = await organizationDoctorService.updateDoctorAccessStatus(
        doctor.id,
        targetStatus,
        `Status set to ${targetStatus} by administrative toggle`
      );
      setDoctor(updated);
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-[#787469]">
        Loading doctor profile details...
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-[#2F2D29]">Doctor profile not found</p>
        <button
          onClick={() => navigate('/organization/doctors')}
          className="text-xs text-[#5D6454] underline"
        >
          Return to directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/organization/doctors')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#686358] hover:text-[#2F2D29] transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to Doctors Directory</span>
      </button>

      {/* Practitioner Banner */}
      <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-[#E5DDD0] text-[#2F2D29] font-bold text-lg flex items-center justify-center shrink-0 border border-[#D5CDBD]">
              {doctor.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-serif font-bold text-[#2F2D29]">{doctor.name}</h1>
                <span className="text-xs px-2 py-0.5 rounded font-mono bg-[#EFEAE0] text-[#555147]">
                  {doctor.id}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    doctor.organization_access_status === 'Active'
                      ? 'bg-[#EFF4EA] border-[#C5D9B4] text-[#345124]'
                      : 'bg-[#FBEBE8] border-[#E4BCB3] text-[#933D33]'
                  }`}
                >
                  {doctor.organization_access_status}
                </span>
              </div>
              <p className="text-xs text-[#555147] font-medium">
                {doctor.designation} • {doctor.specialization} ({doctor.qualification})
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#787469] pt-1">
                <span className="font-mono text-[#4E7737] font-semibold">{doctor.registrationNumber}</span>
                <span>{doctor.council}</span>
                <span>{doctor.roomNo}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={handleToggleStatus}
              disabled={statusUpdating}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                doctor.organization_access_status === 'Active'
                  ? 'bg-white border-[#E4BCB3] text-[#933D33] hover:bg-rose-50'
                  : 'bg-white border-[#C5D9B4] text-[#345124] hover:bg-emerald-50'
              }`}
            >
              {statusUpdating
                ? 'Updating...'
                : doctor.organization_access_status === 'Active'
                ? 'Suspend Access'
                : 'Reactivate Access'}
            </button>
          </div>
        </div>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-4 text-xs space-y-2">
          <div className="font-semibold text-[#8C877C] uppercase tracking-wider text-[10px]">Contact Info</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[#2F2D29]">
              <Mail size={13} className="text-[#8C877C]" />
              <span>{doctor.email}</span>
            </div>
            <div className="flex items-center gap-2 text-[#2F2D29]">
              <Phone size={13} className="text-[#8C877C]" />
              <span>{doctor.phone}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-4 text-xs space-y-2">
          <div className="font-semibold text-[#8C877C] uppercase tracking-wider text-[10px]">Clinical Experience</div>
          <div className="space-y-1 text-[#2F2D29]">
            <p className="font-medium">{doctor.experienceYears} Years Clinical Practice</p>
            <p className="text-[11px] text-[#787469]">Joined Facility on {doctor.joiningDate}</p>
          </div>
        </div>

        <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-4 text-xs space-y-2">
          <div className="font-semibold text-[#8C877C] uppercase tracking-wider text-[10px]">Medical Council Status</div>
          <div className="flex items-center gap-1.5 text-[#345124] font-medium">
            <CheckCircle2 size={13} className="text-[#4E7737]" />
            <span>State Council Verified & In Good Standing</span>
          </div>
        </div>
      </div>

      {/* Associated Records & Consent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consent Requests initiated by this doctor */}
        <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E5DDD0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SendHorizontal size={14} className="text-[#5D6454]" />
              <h2 className="text-xs font-semibold text-[#2F2D29] uppercase tracking-wider">
                Consent Requests ({requests.length})
              </h2>
            </div>
          </div>

          <div className="divide-y divide-[#E5DDD0]">
            {requests.length === 0 ? (
              <div className="p-5 text-center text-xs text-[#8C877C]">No consent requests initiated yet.</div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="p-4 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#2F2D29]">{req.patientName}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        req.status === 'Accepted'
                          ? 'bg-[#EFF4EA] border-[#C5D9B4] text-[#345124]'
                          : req.status === 'Pending'
                          ? 'bg-[#FDF8E8] border-[#EADAA4] text-[#8C6D28]'
                          : 'bg-[#FBEBE8] border-[#E4BCB3] text-[#933D33]'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#787469]">{req.purpose}</p>
                  <p className="text-[10px] text-[#8C877C]">{req.requestDate} • Expiry: {req.expiryDate}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Clinical Access History by this doctor */}
        <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E5DDD0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-[#5D6454]" />
              <h2 className="text-xs font-semibold text-[#2F2D29] uppercase tracking-wider">
                Access Audit Events ({audits.length})
              </h2>
            </div>
          </div>

          <div className="divide-y divide-[#E5DDD0]">
            {audits.length === 0 ? (
              <div className="p-5 text-center text-xs text-[#8C877C]">No recent access events recorded for this doctor.</div>
            ) : (
              audits.map((log) => (
                <div key={log.id} className="p-4 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#2F2D29]">{log.action}</span>
                    <span className="text-[10px] text-[#8C877C]">{log.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-[#787469]">Target: {log.targetItem} ({log.patientName})</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#4E7737]">
                    <CheckCircle2 size={11} />
                    <span>{log.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
