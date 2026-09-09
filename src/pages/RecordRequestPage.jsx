import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { recordService } from '../services/recordService';
import { activityService } from '../services/activityService';
import {
  FilePlus2,
  Building2,
  Send,
  Clock,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Cpu,
  ArrowRight,
  FileCheck2,
  Lock,
} from 'lucide-react';

export const RecordRequestPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [hospitalName, setHospitalName] = useState('ABC Hospital');
  const [recordType, setRecordType] = useState('Lab Reports');
  const [dateRange, setDateRange] = useState('01 Aug 2026');
  const [reason, setReason] = useState('Medical Consultation & Second Opinion');

  const hospitalOptions = ['ABC Hospital', 'PSG Hospital', 'City Hospital', 'Apex Diagnostic Center', 'Kovai Care Clinic'];
  const recordTypeOptions = ['Lab Reports', 'Prescriptions', 'Consultations', 'Scans', 'All Medical Records'];

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await recordService.getRecordRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    try {
      const newReq = await recordService.submitRecordRequest({ hospitalName, recordType, dateRange, reason });
      await activityService.logEvent(
        'Submitted Retrieval Request',
        `Requested ${recordType} from ${hospitalName} (${dateRange}). Status: Waiting for Consent`,
        'request', 'DownloadCloud'
      );
      setSuccessMessage(`Record request created for ${hospitalName}. Waiting for Consent.`);
      setReason('');
      await loadRequests();
    } catch (err) {
      alert('Failed to submit: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectClass =
    'w-full px-3.5 py-2 bg-[#F4EFE6] border border-[#DED2C0] rounded-lg text-xs text-[#2F2D29] focus:bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#A7AA91]/40 focus:border-[#5D6454] font-medium transition-colors';

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="border-b border-[#E5DDD0] pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#5D6454]" />
          <p className="text-[11px] uppercase tracking-widest text-[#787469] font-mono font-medium">
            Record Retrieval Gateway
          </p>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#2F2D29] tracking-tight">Request Medical Record</h1>
        <p className="text-xs text-[#686358] mt-1 font-light">
          Initiate a medical record retrieval from healthcare providers into your secure Nalathunai locker.
        </p>
      </div>

      {/* Architecture Disclaimer Rule Banner */}
      <div className="p-4 bg-[#F4EFE6] border border-[#E5DDD0] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#686358]">
        <div className="flex items-center gap-2.5">
          <Cpu size={16} className="text-[#5D6454] shrink-0" strokeWidth={1.75} />
          <div>
            <span className="font-semibold text-[#2F2D29]">Multimodal Retrieval &amp; Security Pipeline: </span>
            <span className="font-light">Agent retrieves and normalizes records | Patient consent and authorization strictly enforced.</span>
          </div>
        </div>
        <span className="text-[10px] font-mono font-medium text-[#425938] bg-[#EBF0E6] border border-[#CFDCB8] px-2.5 py-0.5 rounded-md shrink-0">
          Consent Enforced
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Request Form */}
        <div className="lg:col-span-5">
          <Card className="p-6 space-y-5">
            <h2 className="text-base font-serif font-semibold text-[#2F2D29] pb-3 border-b border-[#EAE3D5] flex items-center gap-2">
              <Send size={15} className="text-[#5D6454]" strokeWidth={1.75} />
              New Retrieval Request
            </h2>

            {successMessage && (
              <div className="p-3.5 bg-[#EBF0E6] border border-[#CFDCB8] text-[#425938] text-xs rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 size={14} className="text-[#425938] shrink-0" />
                  <span>Record Request Created</span>
                </div>
                <div className="text-[11px] text-[#425938]">{successMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#4B4A3F] mb-1.5">Healthcare Provider / Hospital</label>
                <select value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} className={selectClass}>
                  {hospitalOptions.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#4B4A3F] mb-1.5">Record Type</label>
                <select value={recordType} onChange={(e) => setRecordType(e.target.value)} className={selectClass}>
                  {recordTypeOptions.map((rt) => <option key={rt} value={rt}>{rt}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#4B4A3F] mb-1.5">Date / Date Range</label>
                <input
                  type="text"
                  placeholder="e.g. 01 Aug 2026 or Last 30 Days"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className={selectClass}
                />
              </div>

              <div>
                <label className="block font-medium text-[#4B4A3F] mb-1.5">Reason for Request</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Seeking second opinion from specialist…"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#F4EFE6] border border-[#DED2C0] rounded-lg text-xs text-[#2F2D29] placeholder-[#A7AA91] focus:bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#A7AA91]/40 focus:border-[#5D6454] transition-colors resize-none"
                />
              </div>

              <Button type="submit" variant="primary" fullWidth disabled={submitting} icon={Send}>
                {submitting ? 'Creating Request…' : 'Request Record'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Live Retrieval Progress & History */}
        <div className="lg:col-span-7 space-y-6">
          {/* Simulated Record Retrieval Tracker Section */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#EAE3D5] pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 size={16} className="text-[#5D6454]" />
                <h2 className="text-base font-serif font-semibold text-[#2F2D29]">Active Record Retrieval Status</h2>
              </div>
              <span className="text-[10px] font-mono font-medium text-[#865F1D] bg-[#FBF1E2] px-2.5 py-0.5 rounded-md border border-[#EAD7B0]">
                Live Pipeline
              </span>
            </div>

            {/* Retrieval Progress Timeline */}
            <div className="space-y-4 font-sans text-xs">
              <div className="p-4 bg-[#F4EFE6] border border-[#E5DDD0] rounded-xl space-y-3">
                <div className="text-[10px] font-mono font-semibold text-[#787469] uppercase tracking-wider">
                  RETRIEVAL STAGE TIMELINE (ABC HOSPITAL)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-[11px]">
                  {/* Stage 1 */}
                  <div className="p-2.5 bg-[#EBF0E6] border border-[#CFDCB8] rounded-lg text-[#425938] font-medium space-y-0.5">
                    <div className="font-bold font-mono">✓ Step 1</div>
                    <div className="text-[10.5px]">Request Sent</div>
                  </div>
                  {/* Stage 2 */}
                  <div className="p-2.5 bg-[#EBF0E6] border border-[#CFDCB8] rounded-lg text-[#425938] font-medium space-y-0.5">
                    <div className="font-bold font-mono">✓ Step 2</div>
                    <div className="text-[10.5px]">Consent Approved</div>
                  </div>
                  {/* Stage 3 */}
                  <div className="p-2.5 bg-[#FBF1E2] border border-[#EAD7B0] rounded-lg text-[#865F1D] font-medium space-y-0.5 animate-pulse">
                    <div className="font-bold font-mono">● Step 3</div>
                    <div className="text-[10.5px]">Retrieving</div>
                  </div>
                  {/* Stage 4 */}
                  <div className="p-2.5 bg-[#FAF7F2] border border-[#E5DDD0] rounded-lg text-[#8C877C] space-y-0.5">
                    <div className="font-mono">○ Step 4</div>
                    <div className="text-[10.5px]">Record Checked</div>
                  </div>
                  {/* Stage 5 */}
                  <div className="p-2.5 bg-[#FAF7F2] border border-[#E5DDD0] rounded-lg text-[#8C877C] space-y-0.5">
                    <div className="font-mono">○ Step 5</div>
                    <div className="text-[10.5px]">Available</div>
                  </div>
                </div>
              </div>

              {/* Record Validation Pipeline Breakdown */}
              <div className="p-4 bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl space-y-2.5">
                <div className="text-[10px] font-mono font-semibold text-[#787469] uppercase tracking-wider">
                  RECORD VALIDATION PIPELINE
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#686358] font-medium">
                  <span className="px-2.5 py-1 bg-[#EFEAE0] rounded-md font-mono text-[10px]">1. Received</span>
                  <span className="text-[#A7AA91]">→</span>
                  <span className="px-2.5 py-1 bg-[#EBF0E6] text-[#425938] rounded-md border border-[#CFDCB8] font-mono text-[10px]">2. Patient Checked</span>
                  <span className="text-[#A7AA91]">→</span>
                  <span className="px-2.5 py-1 bg-[#EBF0E6] text-[#425938] rounded-md border border-[#CFDCB8] font-mono text-[10px]">3. Source Checked</span>
                  <span className="text-[#A7AA91]">→</span>
                  <span className="px-2.5 py-1 bg-[#FBF1E2] text-[#865F1D] rounded-md border border-[#EAD7B0] font-mono text-[10px]">4. Format Checked</span>
                  <span className="text-[#A7AA91]">→</span>
                  <span className="px-2.5 py-1 bg-[#EFEAE0] text-[#8C877C] rounded-md font-mono text-[10px]">5. Available</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Request History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-serif font-semibold text-[#2F2D29] flex items-center gap-2">
                <Clock size={15} className="text-[#A7AA91]" />
                Request History
                <span className="text-[#8C877C] font-mono font-normal text-xs">({requests.length})</span>
              </h2>
              <button
                onClick={loadRequests}
                className="text-xs font-medium text-[#787469] hover:text-[#2F2D29] flex items-center gap-1 transition-colors"
              >
                <RefreshCw size={12} />
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-[#8C877C]">Loading requests…</div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <Card key={req.id} className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] font-semibold text-[#8C877C]">{req.id}</span>
                          <StatusBadge status={req.status} />
                        </div>
                        <h3 className="font-serif font-semibold text-[#2F2D29] text-base">{req.hospitalName}</h3>
                        <p className="text-xs text-[#5D6454] font-medium mt-0.5">{req.recordType}</p>
                      </div>
                      <span className="text-[10px] font-mono text-[#8C877C] shrink-0">{req.requestedAt}</span>
                    </div>

                    <div className="p-3 bg-[#F4EFE6] rounded-xl border border-[#E8E1D4] text-xs space-y-1.5 text-[#686358]">
                      <div className="flex justify-between">
                        <span className="text-[#8C877C]">Date Range:</span>
                        <span className="font-medium text-[#2F2D29]">{req.dateRange}</span>
                      </div>
                      {req.reason && (
                        <div className="flex justify-between border-t border-[#EFEAE0] pt-1.5">
                          <span className="text-[#8C877C]">Reason:</span>
                          <span className="font-medium text-[#2F2D29] truncate max-w-xs">{req.reason}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
