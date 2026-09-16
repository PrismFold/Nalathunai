import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebhookSync } from '../context/WebhookContext';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { recordService } from '../services/recordService';
import { consentService } from '../services/consentService';
import { activityService } from '../services/activityService';
import { supabaseService } from '../services/supabaseService';
import {
  FolderHeart,
  ShieldAlert,
  ShieldCheck,
  History,
  FilePlus2,
  Eye,
  Download,
  ArrowUpRight,
  Clock,
  Sparkles,
  Bot,
  Building2,
  RefreshCw,
  Wifi,
  X,
  ExternalLink,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    isSyncing,
    syncResult,
    webhookUrl,
    triggerManualSync,
    hasNotifiedLaunch,
    dismissLaunchNotice,
    openInspector,
  } = useWebhookSync();

  const [records, setRecords] = useState([]);
  const [activeConsents, setActiveConsents] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [recs, consents, pending, acts] = await Promise.all([
          recordService.getRecords(),
          consentService.getConsents(),
          consentService.getPendingRequests(),
          activityService.getActivityLog(),
        ]);
        setRecords(recs);
        setActiveConsents(consents.filter((c) => c.status === 'Active'));
        setPendingRequests(pending);
        setActivities(acts);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const clinicalSummary = useMemo(() => {
    return supabaseService.generateClinicalSummary(records);
  }, [records]);

  return (
    <div className="space-y-8">
      {/* Webhook Auto-Sync Launch Banner */}
      {hasNotifiedLaunch && syncResult?.success && (
        <div className="relative flex items-start gap-3.5 p-4 sm:p-5 bg-gradient-to-r from-[#E8F0E4] to-[#F0F5EC] border border-[#C2D6B8] rounded-xl shadow-[0_1px_4px_rgba(60,80,50,0.06)] animate-[fadeIn_0.4s_ease-out]">
          <div className="p-2 rounded-lg bg-[#D2E4C8] text-[#3A5131] shrink-0 mt-0.5">
            <Wifi size={18} strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#2F3D27]">
              SNS Workbench Webhook Connected on Launch
            </p>
            <p className="text-xs text-[#5A6E4E] mt-0.5 leading-relaxed">
              Auto-handshake with{' '}
              <code className="text-[10.5px] font-mono bg-[#C8DAC0] px-1.5 py-0.5 rounded text-[#2A3C22]">
                {webhookUrl}
              </code>{' '}
              completed successfully in{' '}
              <strong>{syncResult.latencyMs}ms</strong>.
              Status: <strong>{syncResult.status}</strong> · Mode: <strong>{syncResult.mode}</strong>
            </p>
            <div className="flex items-center gap-3 mt-2.5">
              <button
                onClick={openInspector}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#3A5131] underline underline-offset-2 decoration-[#A2C393] hover:decoration-[#3A5131] transition-colors"
              >
                <ExternalLink size={11} />
                Inspect Response
              </button>
              <button
                onClick={() => triggerManualSync()}
                disabled={isSyncing}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#3A5131] underline underline-offset-2 decoration-[#A2C393] hover:decoration-[#3A5131] transition-colors disabled:opacity-50"
              >
                <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Syncing…' : 'Re-trigger'}
              </button>
            </div>
          </div>
          <button
            onClick={dismissLaunchNotice}
            className="p-1 rounded-md text-[#5A6E4E] hover:bg-[#C2D6B8]/40 transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Editorial Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-[#E5DDD0]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#5D6454]" />
            <p className="text-[11px] uppercase tracking-widest text-[#787469] font-mono font-medium">
              Patient Journal &amp; Records Archive
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#2F2D29] tracking-tight">
            {greeting()}, {user?.name?.split(' ')[0] || 'Patient'}
          </h1>
          <p className="text-sm text-[#686358] mt-1.5 font-light">
            Your health records are under your consent and encrypted for your privacy.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button onClick={() => navigate('/request')} size="md" icon={FilePlus2} variant="primary">
            Request Records
          </Button>
          <Button onClick={() => navigate('/consent')} size="md" variant="secondary" icon={ShieldCheck}>
            Manage Consent
            {pendingRequests.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 bg-[#A84236] text-[#F7F3EA] rounded-full text-[10px] font-bold">
                {pendingRequests.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Editorial Ledger Summary Strip */}
      <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(47,45,41,0.03)]">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-[#E5DDD0] lg:divide-x">
          {/* Item 1 */}
          <div
            onClick={() => navigate('/records')}
            className="p-5 sm:p-6 hover:bg-[#F5EFE4] cursor-pointer transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#787469]">
              <span className="text-[11px] font-mono uppercase tracking-wider">Health Records</span>
              <FolderHeart size={16} className="text-[#5D6454] group-hover:scale-110 transition-transform" strokeWidth={1.75} />
            </div>
            <div className="my-3">
              <span className="text-3xl sm:text-4xl font-serif font-normal text-[#2F2D29]">
                {loading ? '—' : records.length}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#787469] group-hover:text-[#2F2D29] transition-colors">
              <span>View archive</span>
              <ArrowUpRight size={12} />
            </div>
          </div>

          {/* Item 2 */}
          <div
            onClick={() => navigate('/consent')}
            className="p-5 sm:p-6 hover:bg-[#F5EFE4] cursor-pointer transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#787469]">
              <span className="text-[11px] font-mono uppercase tracking-wider">Pending Requests</span>
              <ShieldAlert size={16} className="text-[#865F1D] group-hover:scale-110 transition-transform" strokeWidth={1.75} />
            </div>
            <div className="my-3">
              <span className="text-3xl sm:text-4xl font-serif font-normal text-[#2F2D29]">
                {loading ? '—' : pendingRequests.length}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#787469] group-hover:text-[#2F2D29] transition-colors">
              <span>Review requests</span>
              <ArrowUpRight size={12} />
            </div>
          </div>

          {/* Item 3 */}
          <div
            onClick={() => navigate('/consent')}
            className="p-5 sm:p-6 hover:bg-[#F5EFE4] cursor-pointer transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#787469]">
              <span className="text-[11px] font-mono uppercase tracking-wider">Active Permissions</span>
              <ShieldCheck size={16} className="text-[#425938] group-hover:scale-110 transition-transform" strokeWidth={1.75} />
            </div>
            <div className="my-3">
              <span className="text-3xl sm:text-4xl font-serif font-normal text-[#2F2D29]">
                {loading ? '—' : activeConsents.length}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#787469] group-hover:text-[#2F2D29] transition-colors">
              <span>Manage access</span>
              <ArrowUpRight size={12} />
            </div>
          </div>

          {/* Item 4 */}
          <div
            onClick={() => navigate('/activity')}
            className="p-5 sm:p-6 hover:bg-[#F5EFE4] cursor-pointer transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#787469]">
              <span className="text-[11px] font-mono uppercase tracking-wider">Audit Events</span>
              <History size={16} className="text-[#686358] group-hover:scale-110 transition-transform" strokeWidth={1.75} />
            </div>
            <div className="my-3">
              <span className="text-3xl sm:text-4xl font-serif font-normal text-[#2F2D29]">
                {loading ? '—' : activities.length}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#787469] group-hover:text-[#2F2D29] transition-colors">
              <span>View audit log</span>
              <ArrowUpRight size={12} />
            </div>
          </div>
        </div>
      </div>

      {/* Pending requests alert banner */}
      {!loading && pendingRequests.length > 0 && (
        <div className="flex items-start justify-between gap-4 p-5 bg-[#FBF1E2] border border-[#EAD7B0] rounded-xl text-[#2F2D29]">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-[#F5E2C4] text-[#865F1D] shrink-0 mt-0.5">
              <ShieldAlert size={18} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#2F2D29]">
                {pendingRequests.length} pending access request{pendingRequests.length > 1 ? 's' : ''} awaiting your approval
              </p>
              <p className="text-xs text-[#686358] mt-0.5">
                {pendingRequests[0]?.hospitalName} has requested permission to access records. You maintain full sovereignty.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/consent')}
            className="bg-[#2F2D29] hover:bg-[#1E1D1A] text-[#F7F3EA] shrink-0"
          >
            Review Request
          </Button>
        </div>
      )}

      {/* AI Health Summary & Assistant Guidance Card */}
      <div className="bg-gradient-to-br from-[#FAF7F2] to-white border border-[#E5DDD0] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE3D5] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0f5257] text-white flex items-center justify-center shadow-xs">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2F2D29]">AI Health Summary &amp; Biomarker Synthesis</h2>
              <p className="text-xs text-[#787469]">
                Live Gemini synthesis from connected hospital partition records
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open_nalathunai_chatbot', { detail: { query: 'Summarize my overall health status' } }))}
            className="py-2 px-3.5 bg-[#0f5257] hover:bg-[#0c4246] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-xs transition-colors"
          >
            <Bot size={14} /> Open AI Medical Assistant
          </button>
        </div>

        <p className="text-xs text-[#686358] leading-relaxed">
          {clinicalSummary?.clinicalOverview}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 bg-white border border-[#E5DDD0] rounded-xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C877C] block font-medium">Glycemic Control</span>
            <p className="text-[#2F2D29] font-medium leading-snug">{clinicalSummary?.vitalsAssessment?.glycemicControl}</p>
          </div>
          <div className="p-3 bg-white border border-[#E5DDD0] rounded-xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C877C] block font-medium">Cardiovascular &amp; Lipids</span>
            <p className="text-[#2F2D29] font-medium leading-snug">{clinicalSummary?.vitalsAssessment?.cardiovascular}</p>
          </div>
          <div className="p-3 bg-white border border-[#E5DDD0] rounded-xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C877C] block font-medium">BMI Metric</span>
            <p className="text-[#2F2D29] font-medium leading-snug">{clinicalSummary?.vitalsAssessment?.bmiStatus}</p>
          </div>
        </div>
      </div>

      {/* Main content 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Recent Records Ledger (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-end justify-between px-1">
            <div>
              <h2 className="text-xl font-serif font-normal text-[#2F2D29] tracking-tight">Recent Health Records</h2>
              <p className="text-xs text-[#787469] mt-0.5">Clinical files received and linked to your profile</p>
            </div>
            <button
              onClick={() => navigate('/records')}
              className="text-xs font-medium text-[#2F2D29] hover:text-[#5D6454] underline underline-offset-4 decoration-[#DED2C0] transition-colors"
            >
              View full archive ({records.length})
            </button>
          </div>

          <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(47,45,41,0.03)]">
            {loading ? (
              <div className="p-10 text-center text-xs text-[#8C877C]">Loading records archive…</div>
            ) : records.length === 0 ? (
              <div className="p-10 text-center text-xs text-[#8C877C]">No health records found yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#EAE3D5] text-[#8C877C] uppercase tracking-widest text-[10px] font-mono bg-[#F4EFE6]/60">
                      <th className="py-3.5 px-5 font-medium">Record</th>
                      <th className="py-3.5 px-5 font-medium hidden sm:table-cell">Provider</th>
                      <th className="py-3.5 px-5 font-medium hidden md:table-cell">Date</th>
                      <th className="py-3.5 px-5 font-medium">Status</th>
                      <th className="py-3.5 px-5 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEAE0]">
                    {records.slice(0, 5).map((record) => (
                      <tr key={record.id} className="hover:bg-[#F5EFE4]/70 transition-colors group">
                        <td className="py-4 px-5">
                          <div className="font-medium text-[#2F2D29] text-[13px] group-hover:text-[#1E1D1A] transition-colors">
                            {record.title}
                          </div>
                          <div className="text-[11px] text-[#787469] mt-0.5">
                            {record.type}
                          </div>
                        </td>
                        <td className="py-4 px-5 text-[#686358] hidden sm:table-cell truncate max-w-[150px]">
                          <div className="flex items-center gap-1.5">
                            <Building2 size={13} className="text-[#A7AA91] shrink-0" />
                            <span>{record.hospital}</span>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-[#787469] font-mono text-[11px] whitespace-nowrap hidden md:table-cell">
                          {record.date}
                        </td>
                        <td className="py-4 px-5">
                          <StatusBadge status={record.status} />
                        </td>
                        <td className="py-4 px-5 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedRecord(record)}
                            icon={Eye}
                            className="bg-[#FAF7F2] hover:bg-[#EEE7DB] border-[#DED2C0]"
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Timeline (1/3 width) */}
        <div className="space-y-4">
          <div className="flex items-end justify-between px-1">
            <div>
              <h2 className="text-xl font-serif font-normal text-[#2F2D29] tracking-tight">Activity Log</h2>
              <p className="text-xs text-[#787469] mt-0.5">Consent and access audit history</p>
            </div>
            <button
              onClick={() => navigate('/activity')}
              className="text-xs font-medium text-[#2F2D29] hover:text-[#5D6454] underline underline-offset-4 decoration-[#DED2C0] transition-colors"
            >
              Full log
            </button>
          </div>

          <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl p-5 shadow-[0_1px_3px_rgba(47,45,41,0.03)]">
            {loading ? (
              <div className="text-xs text-[#8C877C] py-4 text-center">Loading activity…</div>
            ) : activities.length === 0 ? (
              <div className="text-xs text-[#8C877C] py-4 text-center">No activity logged yet.</div>
            ) : (
              <div className="relative pl-4 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-1.5 before:w-px before:bg-[#E5DDD0]">
                {activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="relative text-xs group">
                    {/* Timeline dot */}
                    <div className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-[#A7AA91] border-2 border-[#FAF7F2] group-hover:bg-[#5D6454] transition-colors" />
                    <div className="font-medium text-[#2F2D29] text-[12.5px] leading-snug">
                      {act.title}
                    </div>
                    <div className="text-[#8C877C] text-[11px] font-mono mt-1 flex items-center gap-1">
                      <Clock size={11} className="text-[#A7AA91]" />
                      <span>{act.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record View Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={selectedRecord.title}
          size="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono text-[#8C877C]">
                {selectedRecord.fileFormat} · {selectedRecord.fileSize}
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedRecord(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => alert(`Simulated download of ${selectedRecord.title}`)}
                  icon={Download}
                >
                  Download
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Hospital / Provider', selectedRecord.hospital],
                ['Attending Doctor', selectedRecord.doctor],
                ['Record Type', selectedRecord.type],
                ['Date Issued', selectedRecord.date],
              ].map(([label, value]) => (
                <div key={label} className="p-3.5 bg-[#F4EFE6] rounded-xl border border-[#E8E1D4]">
                  <div className="text-[10px] text-[#8C877C] font-mono uppercase font-semibold mb-1">{label}</div>
                  <div className="font-semibold text-[#2F2D29] text-[13px]">{value}</div>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[#2F2D29] mb-1.5 uppercase tracking-wider font-mono">Clinical Summary</h4>
              <p className="p-3.5 bg-[#F4EFE6] border border-[#E8E1D4] rounded-xl text-[#4B4A3F] leading-relaxed">
                {selectedRecord.summary}
              </p>
            </div>

            {selectedRecord.details && (
              <div className="border-t border-[#EAE3D5] pt-3.5">
                <h4 className="text-xs font-semibold text-[#2F2D29] mb-2 uppercase tracking-wider font-mono">Record Metadata</h4>
                <div className="space-y-2">
                  {Object.entries(selectedRecord.details).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-[#EFEAE0] pb-1.5">
                      <span className="capitalize text-[#787469]">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-medium text-[#2F2D29]">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
