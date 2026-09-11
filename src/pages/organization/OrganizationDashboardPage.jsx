import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { organizationService } from '../../services/organizationService';
import { organizationDoctorService } from '../../services/organizationDoctorService';
import { organizationRequestService } from '../../services/organizationRequestService';
import { organizationAuditService } from '../../services/organizationAuditService';
import { Button } from '../../components/Button';
import {
  Users,
  UserCheck,
  ShieldCheck,
  Clock,
  SendHorizontal,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  ChevronRight,
  Eye,
} from 'lucide-react';

export const OrganizationDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const orgId = user?.orgId || 'HOSP-PSG-01';
  const orgName = user?.name || 'PSG Institute of Medical Sciences & Research';
  const abdmFacilityId = user?.abdmFacilityId || 'IN-TN-CBE-FAC-00244';

  const [stats, setStats] = useState({
    totalDoctors: 4,
    activeDoctors: 4,
    activeConsents: 1,
    pendingRequests: 1,
    departmentsCount: 4,
  });
  const [doctors, setDoctors] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentAudits, setRecentAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [dashStats, orgDocs, reqs, audits] = await Promise.all([
          organizationService.getOrganizationStats(orgId),
          organizationDoctorService.getDoctors(orgId),
          organizationRequestService.getRequests(orgId),
          organizationAuditService.getAuditLogs(orgId),
        ]);
        setStats(dashStats);
        setDoctors(orgDocs);
        setRecentRequests(reqs.slice(0, 5));
        setRecentAudits(audits.slice(0, 4));
      } catch (err) {
        console.error('Failed to load organization dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [orgId]);

  return (
    <div className="space-y-8">
      {/* Hospital Node Header Banner */}
      <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-mono bg-[#EFEAE0] text-[#5D6454]">
                {orgId}
              </span>
              <span className="text-[11px] text-[#8C877C] font-mono">ABDM Node: {abdmFacilityId}</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#2F2D29] tracking-tight">{orgName}</h1>
            <p className="text-xs text-[#787469] max-w-2xl">
              Healthcare Facility Mediation Console. Manage affiliated clinicians, verify patient consent status, review record requests, and audit controlled data access. Hospital records reside safely in source databases.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => navigate('/organization/patient-requests')}
              className="px-3.5 py-2 rounded-lg bg-[#2F2D29] text-[#F7F3EA] hover:bg-[#433F38] transition-colors text-xs font-medium flex items-center gap-1.5 shadow-xs"
            >
              <SendHorizontal size={14} />
              <span>New Consent Request</span>
            </button>
            <button
              onClick={() => navigate('/organization/patients')}
              className="px-3.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#D5CDBD] text-[#2F2D29] hover:bg-[#EFEAE0] transition-colors text-xs font-medium flex items-center gap-1.5"
            >
              <UserCheck size={14} />
              <span>Search Patients</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Doctors */}
        <div
          onClick={() => navigate('/organization/doctors')}
          className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-5 hover:border-[#C5BCAB] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-[#787469] mb-3">
            <span className="text-xs font-semibold text-[#8C877C] uppercase tracking-wider">Affiliated Doctors</span>
            <div className="w-8 h-8 rounded-lg bg-[#EFEAE0] text-[#5D6454] flex items-center justify-center group-hover:bg-[#2F2D29] group-hover:text-[#F7F3EA] transition-colors">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#2F2D29]">{stats.totalDoctors}</div>
          <div className="text-[11px] text-[#787469] mt-1 flex items-center gap-1">
            <CheckCircle2 size={12} className="text-[#4E7737]" />
            <span>{stats.activeDoctors} Active in {stats.departmentsCount} Specializations</span>
          </div>
        </div>

        {/* Patients & Mediation */}
        <div
          onClick={() => navigate('/organization/patients')}
          className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-5 hover:border-[#C5BCAB] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-[#787469] mb-3">
            <span className="text-xs font-semibold text-[#8C877C] uppercase tracking-wider">Patient Mediation</span>
            <div className="w-8 h-8 rounded-lg bg-[#EFEAE0] text-[#5D6454] flex items-center justify-center group-hover:bg-[#2F2D29] group-hover:text-[#F7F3EA] transition-colors">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#2F2D29]">Active</div>
          <div className="text-[11px] text-[#787469] mt-1 flex items-center gap-1">
            <span>Federated record discovery</span>
          </div>
        </div>

        {/* Active Consents */}
        <div
          onClick={() => navigate('/organization/patient-requests')}
          className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-5 hover:border-[#C5BCAB] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-[#787469] mb-3">
            <span className="text-xs font-semibold text-[#8C877C] uppercase tracking-wider">Active Consents</span>
            <div className="w-8 h-8 rounded-lg bg-[#EFF4EA] text-[#4E7737] flex items-center justify-center group-hover:bg-[#4E7737] group-hover:text-white transition-colors">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#2F2D29]">{stats.activeConsents}</div>
          <div className="text-[11px] text-[#787469] mt-1 flex items-center gap-1">
            <span>Patient-granted record view access</span>
          </div>
        </div>

        {/* Pending Requests */}
        <div
          onClick={() => navigate('/organization/patient-requests')}
          className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-5 hover:border-[#C5BCAB] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-[#787469] mb-3">
            <span className="text-xs font-semibold text-[#8C877C] uppercase tracking-wider">Pending Requests</span>
            <div className="w-8 h-8 rounded-lg bg-[#FDF8E8] text-[#8C6D28] flex items-center justify-center group-hover:bg-[#8C6D28] group-hover:text-white transition-colors">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#2F2D29]">{stats.pendingRequests}</div>
          <div className="text-[11px] text-[#787469] mt-1 flex items-center gap-1">
            <span>Awaiting patient authorization</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Doctors List + Recent Requests, Right = Audit Feed & Facility Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Doctors Directory Snippet & Requests */}
        <div className="lg:col-span-2 space-y-6">
          {/* Doctors Section */}
          <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#E5DDD0] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#2F2D29] uppercase tracking-wider">
                  Affiliated Medical Practitioners ({doctors.length})
                </h2>
                <p className="text-[11px] text-[#787469]">
                  Licensed doctors registered under {orgName}
                </p>
              </div>
              <button
                onClick={() => navigate('/organization/doctors')}
                className="text-xs font-semibold text-[#5D6454] hover:text-[#2F2D29] flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="divide-y divide-[#E5DDD0]">
              {doctors.slice(0, 4).map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => navigate(`/organization/doctors/${doc.id}`)}
                  className="p-4 sm:px-5 hover:bg-[#F4EFE6] transition-colors cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#E5DDD0] text-[#2F2D29] font-semibold text-xs flex items-center justify-center shrink-0">
                      {doc.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#2F2D29] truncate">{doc.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-[#EFEAE0] text-[#787469]">
                          {doc.id}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#787469] truncate">
                        {doc.specialization} • {doc.qualification}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        doc.organization_access_status === 'Active'
                          ? 'bg-[#EFF4EA] border-[#C5D9B4] text-[#345124]'
                          : 'bg-[#FDF8E8] border-[#EADAA4] text-[#8C6D28]'
                      }`}
                    >
                      {doc.organization_access_status}
                    </span>
                    <ChevronRight size={15} className="text-[#C2BCB0]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Patient Consent Requests */}
          <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#E5DDD0] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#2F2D29] uppercase tracking-wider">
                  Recent Consent Requests
                </h2>
                <p className="text-[11px] text-[#787469]">
                  Transmitted records access authorizations
                </p>
              </div>
              <button
                onClick={() => navigate('/organization/patient-requests')}
                className="text-xs font-semibold text-[#5D6454] hover:text-[#2F2D29] flex items-center gap-1 transition-colors"
              >
                <span>View Requests</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="divide-y divide-[#E5DDD0]">
              {recentRequests.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#8C877C]">No consent requests found.</div>
              ) : (
                recentRequests.map((req) => (
                  <div key={req.id} className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#2F2D29]">{req.patientName}</span>
                        <span className="font-mono text-[10px] text-[#8C877C]">{req.patientAbha}</span>
                      </div>
                      <div className="text-[11px] text-[#787469]">
                        Doctor: <span className="font-medium text-[#2F2D29]">{req.doctorName}</span> • Purpose: {req.purpose}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:self-center">
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
                      <span className="text-[10px] text-[#8C877C]">{req.requestDate}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Audit Log & ABDM Compliance */}
        <div className="space-y-6">
          {/* Live Access Audit Trail */}
          <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DDD0] pb-3">
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-[#5D6454]" />
                <h3 className="text-xs font-semibold text-[#2F2D29] uppercase tracking-wider">
                  Access Audit Activity
                </h3>
              </div>
              <button
                onClick={() => navigate('/organization/access-history')}
                className="text-[11px] font-semibold text-[#5D6454] hover:text-[#2F2D29] transition-colors"
              >
                All Logs
              </button>
            </div>

            <div className="space-y-3.5">
              {recentAudits.map((log) => (
                <div key={log.id} className="text-xs space-y-1 pb-3 border-b border-[#EFEAE0] last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between gap-1 text-[10px] text-[#8C877C]">
                    <span className="font-semibold text-[#2F2D29]">{log.actorName}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-[#555147]">
                    {log.action}: <span className="font-medium text-[#2F2D29]">{log.targetItem}</span> ({log.patientName})
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#4E7737]">
                    <CheckCircle2 size={11} />
                    <span>{log.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ABDM Tier-1 Node Information Box */}
          <div className="bg-[#F4EFE6] border border-[#E5DDD0] rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2F2D29]">
              <Building2 size={15} className="text-[#5D6454]" />
              <span>Ayushman Bharat Digital Mission</span>
            </div>
            <p className="text-[11px] text-[#787469] leading-relaxed">
              This node is certified for Health Facility Registry (HFR) and ABDM Consent Manager (CM) specs v2.0. Direct medical records are encrypted end-to-end.
            </p>
            <div className="pt-2 border-t border-[#E5DDD0]/70 flex items-center justify-between text-[11px]">
              <span className="text-[#787469]">Facility Status:</span>
              <span className="font-semibold text-[#345124] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4E7737] animate-pulse" />
                Operational & Synced
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
