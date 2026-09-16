import React from 'react';
import { useWebhookSync } from '../context/WebhookContext';
import { Modal } from './Modal';
import {
  Wifi,
  WifiOff,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Clock,
  Zap,
  Code2,
  Sparkles,
} from 'lucide-react';

export const WebhookStatusBadge = ({ compact = false }) => {
  const {
    isSyncing,
    syncResult,
    webhookUrl,
    triggerManualSync,
    isInspectorOpen,
    openInspector,
    closeInspector,
  } = useWebhookSync();

  const isConnected = syncResult?.success === true;
  const statusLabel = isSyncing
    ? 'Syncing…'
    : isConnected
    ? 'Live'
    : syncResult
    ? 'Disconnected'
    : 'Idle';

  const dotColor = isSyncing
    ? 'bg-amber-400'
    : isConnected
    ? 'bg-emerald-500'
    : syncResult?.errorMessage
    ? 'bg-red-400'
    : 'bg-gray-400';

  const StatusIcon = isSyncing
    ? Loader2
    : isConnected
    ? Wifi
    : WifiOff;

  return (
    <>
      {/* Pill Badge */}
      <button
        onClick={openInspector}
        title={`SNS Workbench: ${statusLabel}\n${webhookUrl}`}
        className={`
          inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium
          transition-all duration-200 cursor-pointer select-none
          ${isConnected
            ? 'bg-[#E8F0E4] text-[#3A5131] hover:bg-[#D9E8D2] border border-[#C2D6B8]'
            : isSyncing
            ? 'bg-[#FEF3E2] text-[#7C5A1D] hover:bg-[#FDE8C8] border border-[#EBD49E]'
            : 'bg-[#F4EEEE] text-[#6B4F4F] hover:bg-[#EBE1E1] border border-[#D9CACA]'
          }
        `}
      >
        {/* Pulsing dot */}
        <span className="relative flex h-2 w-2">
          {(isConnected || isSyncing) && (
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${dotColor} ${
                isSyncing ? 'animate-ping' : 'animate-pulse'
              }`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
        </span>

        <StatusIcon
          size={12}
          strokeWidth={2}
          className={isSyncing ? 'animate-spin' : ''}
        />

        {!compact && (
          <span className="tracking-wide font-mono uppercase text-[10px]">
            {statusLabel}
          </span>
        )}
      </button>

      {/* Response Inspector Modal */}
      {isInspectorOpen && (
        <Modal
          isOpen={isInspectorOpen}
          onClose={closeInspector}
          title="SNS Workbench Webhook Inspector"
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-[11px] text-[#8C877C] font-mono">
                {syncResult?.latencyMs != null && (
                  <>
                    <Clock size={12} />
                    <span>{syncResult.latencyMs}ms</span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={closeInspector}
                  className="px-3 py-1.5 text-xs rounded-lg border border-[#DED2C0] text-[#686358] hover:bg-[#F4EFE6] transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => triggerManualSync()}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#2F2D29] text-[#F7F3EA] hover:bg-[#1E1D1A] disabled:opacity-50 transition-colors"
                >
                  <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                  {isSyncing ? 'Syncing…' : 'Re-trigger Webhook'}
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-5 text-xs">
            {/* Connection Status Banner */}
            <div
              className={`flex items-start gap-3 p-4 rounded-xl border ${
                isConnected
                  ? 'bg-[#EDF5E9] border-[#C2D6B8] text-[#3A5131]'
                  : 'bg-[#FCEDED] border-[#E5C0C0] text-[#7D3434]'
              }`}
            >
              <div className="mt-0.5">
                {isConnected ? (
                  <CheckCircle2 size={18} strokeWidth={1.75} />
                ) : (
                  <XCircle size={18} strokeWidth={1.75} />
                )}
              </div>
              <div>
                <p className="font-semibold text-[13px]">
                  {isConnected
                    ? 'Webhook Connected & Responding'
                    : syncResult?.errorMessage
                    ? 'Webhook Connection Failed'
                    : 'Waiting for Connection'}
                </p>
                <p className="mt-0.5 opacity-80">
                  {isConnected
                    ? `Auto-handshake completed at ${syncResult?.formattedTime || 'N/A'}`
                    : syncResult?.errorMessage || 'No response received yet'}
                </p>
              </div>
            </div>

            {/* Endpoint URL */}
            <div className="p-3.5 bg-[#F4EFE6] rounded-xl border border-[#E8E1D4]">
              <div className="text-[10px] text-[#8C877C] font-mono uppercase font-semibold mb-1.5 flex items-center gap-1">
                <ExternalLink size={10} />
                Webhook Endpoint
              </div>
              <code className="text-[12px] font-mono text-[#2F2D29] break-all leading-relaxed">
                {webhookUrl}
              </code>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ['Status', syncResult?.status || '—', Zap],
                ['Mode', syncResult?.mode || '—', Code2],
                ['Latency', syncResult?.latencyMs != null ? `${syncResult.latencyMs}ms` : '—', Clock],
                ['Synced At', syncResult?.formattedTime || '—', Clock],
              ].map(([label, value, Icon]) => (
                <div key={label} className="p-3 bg-[#F4EFE6] rounded-xl border border-[#E8E1D4]">
                  <div className="text-[10px] text-[#8C877C] font-mono uppercase font-semibold mb-1 flex items-center gap-1">
                    <Icon size={10} />
                    {label}
                  </div>
                  <div className="font-semibold text-[#2F2D29] text-[13px]">{value}</div>
                </div>
              ))}
            </div>

            {/* AI Clinical Summary (if present) */}
            {(syncResult?.aiSummary || syncResult?.responseData?.aiSummary) && (() => {
              const summary = syncResult?.aiSummary || syncResult?.responseData?.aiSummary;
              return (
                <div className="p-4 bg-gradient-to-br from-[#F4EFE6] to-[#FAF7F2] border border-[#D9CDB8] rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#E2D8C3]">
                    <span className="flex items-center gap-1.5 font-semibold text-[#2F2D29] text-[12px]">
                      <Sparkles size={13} className="text-[#865F1D]" />
                      AI Clinical Synthesis (Immediate Response)
                    </span>
                    <span className="text-[10px] font-mono text-[#3A5131] bg-[#E8F0E4] px-2 py-0.5 rounded-md border border-[#C2D6B8]">
                      Gemini Agent
                    </span>
                  </div>
                  <p className="text-[#4F4A3E] leading-relaxed text-[11.5px]">
                    {summary.clinicalOverview || summary}
                  </p>
                  {summary.vitalsAssessment && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0]">
                        <span className="font-semibold text-[#2F2D29]">Glycemic Control: </span>
                        <span className="text-[#5D6454]">{summary.vitalsAssessment.glycemicControl}</span>
                      </div>
                      <div className="p-2 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0]">
                        <span className="font-semibold text-[#2F2D29]">Cardiovascular: </span>
                        <span className="text-[#5D6454]">{summary.vitalsAssessment.cardiovascular}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Payload Sent */}
            {syncResult?.payload && (
              <div>
                <h4 className="text-xs font-semibold text-[#2F2D29] mb-1.5 uppercase tracking-wider font-mono flex items-center gap-1">
                  <Code2 size={11} />
                  Request Payload
                </h4>
                <pre className="p-3.5 bg-[#1E1D1A] text-[#E8E4D8] rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed max-h-40 overflow-y-auto">
                  {JSON.stringify(syncResult.payload, null, 2)}
                </pre>
              </div>
            )}

            {/* Response Data */}
            {syncResult?.responseData && (
              <div>
                <h4 className="text-xs font-semibold text-[#2F2D29] mb-1.5 uppercase tracking-wider font-mono flex items-center gap-1">
                  <Code2 size={11} />
                  Response Data
                </h4>
                <pre className="p-3.5 bg-[#1E1D1A] text-[#C4E0A5] rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed max-h-48 overflow-y-auto">
                  {JSON.stringify(syncResult.responseData, null, 2)}
                </pre>
              </div>
            )}

            {/* Error details */}
            {syncResult?.errorMessage && (
              <div className="p-3.5 bg-[#FDF1F1] border border-[#E5C0C0] rounded-xl">
                <div className="text-[10px] text-[#7D3434] font-mono uppercase font-semibold mb-1">
                  Error Details
                </div>
                <p className="text-[#933D33] font-mono text-[12px]">{syncResult.errorMessage}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};
