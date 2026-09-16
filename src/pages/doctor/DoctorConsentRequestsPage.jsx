import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorConsentService } from '../../services/doctorConsentService';
import { Button } from '../../components/Button';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  FileText,
  Calendar,
  Building2,
  Filter,
  User,
} from 'lucide-react';

export const DoctorConsentRequestsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const regNumber = user?.registrationNumber || 'TN-MED-00123';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('All'); // 'All' | 'Pending' | 'Accepted' | 'Rejected' | 'Revoked'

  const fetchDoctorRequests = async () => {
    setLoading(true);
    try {
      const list = await doctorConsentService.getAllDoctorRequests(regNumber);
      setRequests(list);
    } catch (e) {
      console.error('Failed to load doctor requests:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorRequests();
  }, [regNumber]);

  const filteredList = requests.filter((r) => {
    if (filterTab === 'All') return true;
    return r.status.toLowerCase() === filterTab.toLowerCase();
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="px-2.5 py-1 bg-[#EFF4EA] border border-[#C5D9B4] text-[#345124] rounded-full text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-[#4E7737]" />
            <span>Access Granted</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2.5 py-1 bg-[#FBF1E2] border border-[#EAD7B0] text-[#865F1D] rounded-full text-xs font-semibold flex items-center gap-1.5">
            <Clock size={13} />
            <span>Waiting for Patient Approval</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-1 bg-[#FDF2F0] border border-[#F3C4BE] text-[#9A2D23] rounded-full text-xs font-semibold flex items-center gap-1.5">
            <XCircle size={13} className="text-[#C94F45]" />
            <span>Access Denied</span>
          </span>
        );
      case 'Revoked':
        return (
          <span className="px-2.5 py-1 bg-[#FDF2F0] border border-[#F3C4BE] text-[#9A2D23] rounded-full text-xs font-semibold flex items-center gap-1.5">
            <ShieldAlert size={13} className="text-[#C94F45]" />
            <span>Patient Revoked Access</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#E5DDD0] pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-[#5D6454]" />
          <p className="text-[11px] uppercase tracking-widest text-[#787469] font-mono font-medium">
            Authorization Governance
          </p>
        </div>
        <h1 className="text-3xl font-serif font-normal text-[#2F2D29] tracking-tight">
          Consent Requests
        </h1>
        <p className="text-xs text-[#686358] mt-1">
          Monitor your patient record access requests. Clinical records can only be viewed after a patient grants explicit approval.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-[#E5DDD0] pb-3 text-xs">
        {['All', 'Pending', 'Accepted', 'Rejected', 'Revoked'].map((tab) => {
          const count =
            tab === 'All'
              ? requests.length
              : requests.filter((r) => r.status.toLowerCase() === tab.toLowerCase()).length;

          return (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors border flex items-center gap-1.5 ${
                filterTab === tab
                  ? 'bg-[#2F2D29] text-[#F7F3EA] border-[#2F2D29] shadow-xs'
                  : 'bg-[#FAF7F2] text-[#686358] border-[#E5DDD0] hover:bg-[#F4EFE6]'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  filterTab === tab ? 'bg-white/20 text-[#F7F3EA]' : 'bg-[#EEE8DC] text-[#787469]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#8C877C]">
          Loading consent requests…
        </div>
      ) : filteredList.length === 0 ? (
        <div className="p-12 bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl text-center text-xs text-[#787469] space-y-2">
          <ShieldCheck size={28} className="mx-auto text-[#A0988A]" />
          <p className="font-semibold text-[#2F2D29]">No consent requests found in "{filterTab}"</p>
          <p className="text-[11px] text-[#787469] max-w-sm mx-auto">
            Use "Find Patient" to look up a patient and request access to their medical records.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredList.map((req) => (
            <div
              key={req.id}
              className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Card Top */}
                <div className="p-5 border-b border-[#E5DDD0] flex items-start justify-between gap-3 bg-[#FAF7F2]">
                  <div>
                    <span className="font-mono text-[10px] text-[#787469] block mb-1">
                      {req.id} • {req.date}
                    </span>
                    <h3 className="font-serif font-semibold text-lg text-[#2F2D29]">
                      {req.patientName}
                    </h3>
                    <p className="text-xs text-[#787469] font-mono mt-0.5">
                      Patient ID: {req.patientId}
                    </p>
                  </div>
                  <div>{getStatusBadge(req.status)}</div>
                </div>

                {/* Card Details */}
                <div className="p-5 space-y-3 text-xs bg-[#F4EFE6]/50">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#8C877C] font-semibold block">
                      Clinical Purpose
                    </span>
                    <p className="text-[#2F2D29] font-medium mt-0.5">{req.purpose}</p>
                  </div>

                  <div className="flex justify-between border-t border-[#EFEAE0] pt-2">
                    <span className="text-[#8C877C]">Requested Records:</span>
                    <span className="font-medium text-[#2F2D29]">
                      {Array.isArray(req.requestedRecords)
                        ? req.requestedRecords.join(', ')
                        : req.requestedRecords}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#8C877C]">Access Duration:</span>
                    <span className="font-medium text-[#2F2D29]">{req.duration}</span>
                  </div>

                  {req.expiryDate && (
                    <div className="flex justify-between border-t border-[#EFEAE0] pt-2">
                      <span className="text-[#8C877C]">Valid Until:</span>
                      <span className="font-mono font-medium text-[#5D6454]">{req.expiryDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-[#FAF7F2] border-t border-[#E5DDD0] flex items-center justify-between">
                <span className="text-[11px] text-[#787469]">
                  Facility: <strong className="text-[#2F2D29] font-medium">{req.hospitalName}</strong>
                </span>

                {req.status === 'Accepted' ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate(`/doctor/patients/${req.patientId}`)}
                    icon={FileText}
                  >
                    View Records
                  </Button>
                ) : (
                  <span className="text-[11px] font-mono text-[#8C877C] italic">
                    {req.status === 'Pending' ? 'Records locked until patient approval' : 'Record access disabled'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
