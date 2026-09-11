import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { consentService } from '../services/consentService';
import { activityService } from '../services/activityService';
import {
  ShieldCheck,
  ShieldAlert,
  Building2,
  CheckCircle2,
  XCircle,
  Ban,
  Eye,
  Lock,
} from 'lucide-react';

export const ConsentPage = () => {
  const [activeConsents, setActiveConsents] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('All'); // 'All' | 'Pending' | 'Approved' | 'Expired' | 'Revoked'

  const [approvalModalRequest, setApprovalModalRequest] = useState(null);
  const [viewConsentModal, setViewConsentModal] = useState(null);
  const [revokeConfirmConsent, setRevokeConfirmConsent] = useState(null);

  const fetchConsents = async () => {
    setLoading(true);
    try {
      const [consents, pending] = await Promise.all([
        consentService.getConsents(),
        consentService.getPendingRequests(),
      ]);
      setActiveConsents(consents);
      setPendingRequests(pending);
    } catch (err) {
      console.error('Failed to load consent data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConsents(); }, []);

  const handleApproveConfirm = async () => {
    if (!approvalModalRequest) return;
    try {
      await consentService.approveConsent(approvalModalRequest.id);
      await activityService.logEvent(
        'Approved Access Request',
        `You granted record access to ${approvalModalRequest.hospitalName} (${approvalModalRequest.requesterName}).`,
        'consent', 'ShieldCheck'
      );
      setApprovalModalRequest(null);
      await fetchConsents();
    } catch (err) {
      alert('Failed to approve: ' + err.message);
    }
  };

  const handleDenyRequest = async (requestId, requesterName, hospitalName) => {
    if (!window.confirm(`Deny access request from ${hospitalName}?`)) return;
    try {
      await consentService.denyConsent(requestId);
      await activityService.logEvent(
        'Denied Access Request',
        `Denied request from ${hospitalName} (${requesterName}).`,
        'consent', 'ShieldAlert'
      );
      await fetchConsents();
    } catch (err) {
      alert('Failed to deny: ' + err.message);
    }
  };

  const handleRevokeConfirm = async () => {
    if (!revokeConfirmConsent) return;
    try {
      await consentService.revokeConsent(revokeConfirmConsent.id);
      await activityService.logEvent(
        'Revoked Access',
        `Revoked access for ${revokeConfirmConsent.hospitalName}.`,
        'consent', 'ShieldAlert'
      );
      setRevokeConfirmConsent(null);
      await fetchConsents();
    } catch (err) {
      alert('Failed to revoke: ' + err.message);
    }
  };

  // Combine and filter items based on tab
  const filteredConsents = activeConsents.filter((c) => {
    if (filterTab === 'All') return true;
    if (filterTab === 'Approved') return c.status === 'Active' || c.status === 'Approved';
    if (filterTab === 'Expired') return c.status === 'Expired';
    if (filterTab === 'Revoked') return c.status === 'Revoked';
    return true;
  });

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="border-b border-[#E5DDD0] pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#5D6454]" />
          <p className="text-[11px] uppercase tracking-widest text-[#787469] font-mono font-medium">
            Authorization &amp; Privacy
          </p>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#2F2D29] tracking-tight">Consent Management</h1>
        <p className="text-xs text-[#686358] mt-1 font-light">
          Control who can view your health records. Approve pending requests, view active permissions, or revoke access at any time.
        </p>
      </div>

      {/* Mandatory Patient Control Banner */}
      <div className="p-4 bg-[#EBF0E6] border border-[#CFDCB8] rounded-xl flex items-center gap-3 text-xs text-[#425938]">
        <ShieldCheck size={18} className="text-[#425938] shrink-0" strokeWidth={1.75} />
        <div>
          <span className="font-bold">Patient Sovereignty Rule: </span>
          <span className="font-light">The patient always controls access. No healthcare provider automatically receives access to your records.</span>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-[#E5DDD0] pb-3 text-xs">
        {['All', 'Pending', 'Approved', 'Expired', 'Revoked'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all border ${
              filterTab === tab
                ? 'bg-[#2F2D29] text-[#F7F3EA] border-[#2F2D29] shadow-xs'
                : 'bg-[#FAF7F2] text-[#686358] border-[#E5DDD0] hover:bg-[#F4EFE6]'
            }`}
          >
            {tab}
            {tab === 'Pending' && pendingRequests.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-[#A84236] text-[#F7F3EA] rounded-full text-[10px] font-mono">
                {pendingRequests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pending Requests Section (visible under 'All' or 'Pending') */}
      {(filterTab === 'All' || filterTab === 'Pending') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-serif font-semibold text-[#2F2D29] flex items-center gap-2">
              <ShieldAlert size={16} className="text-[#865F1D]" strokeWidth={1.75} />
              Pending Requests ({pendingRequests.length})
            </h2>
            <span className="text-xs text-[#8C877C] font-light">Requires your explicit decision</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#8C877C]">Checking requests…</div>
          ) : pendingRequests.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-[#F4EFE6] border border-[#E5DDD0] rounded-xl text-xs">
              <CheckCircle2 size={16} className="text-[#425938] shrink-0" strokeWidth={1.75} />
              <span className="text-[#686358] font-medium">No pending consent requests right now.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pendingRequests.map((req) => (
                <div key={req.id} className="bg-[#FAF7F2] border border-[#EAD7B0] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(47,45,41,0.03)] flex flex-col justify-between">
                  <div>
                    <div className="px-5 py-4 border-b border-[#EAD7B0] flex items-start justify-between gap-3 bg-[#FBF1E2]/50">
                      <div>
                        <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-[#865F1D] bg-[#FBF1E2] border border-[#EAD7B0] px-2 py-0.5 rounded-md mb-2 inline-block">
                          Status: Pending
                        </span>
                        <h3 className="font-serif font-semibold text-[#2F2D29] text-base">{req.hospitalName}</h3>
                        <p className="text-xs text-[#787469] mt-0.5">{req.requesterName}</p>
                      </div>
                      <span className="text-[10px] font-mono text-[#865F1D] font-medium">{req.expiryWindow}</span>
                    </div>

                    <div className="px-5 py-3.5 space-y-2.5 text-xs bg-[#F4EFE6]/60">
                      <div>
                        <span className="text-[10px] text-[#8C877C] uppercase font-mono font-semibold">Purpose</span>
                        <p className="text-[#2F2D29] font-medium mt-0.5">{req.purpose}</p>
                      </div>
                      <div className="flex justify-between border-t border-[#EFEAE0] pt-2">
                        <span className="text-[#8C877C]">Requested Records:</span>
                        <span className="font-medium text-[#5D6454]">{req.requestedRecords.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8C877C]">Duration:</span>
                        <span className="font-medium text-[#2F2D29]">{req.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 flex gap-2.5 bg-[#FAF7F2] border-t border-[#EAE3D5]">
                    <Button
                      fullWidth
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDenyRequest(req.id, req.requesterName, req.hospitalName)}
                      icon={XCircle}
                      className="text-[#933D33] hover:bg-[#F7EBE8] hover:border-[#EEC4BD]"
                    >
                      Deny
                    </Button>
                    <Button
                      fullWidth
                      size="sm"
                      variant="primary"
                      onClick={() => setApprovalModalRequest(req)}
                      icon={CheckCircle2}
                    >
                      Allow Access
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Approved / Active / Expired / Revoked Consents */}
      {(filterTab !== 'Pending') && (
        <section className="space-y-4 pt-4 border-t border-[#E5DDD0]">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-serif font-semibold text-[#2F2D29] flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#5D6454]" strokeWidth={1.75} />
              Consent Permissions ({filteredConsents.length})
            </h2>
            <span className="text-xs text-[#8C877C] font-light">Active &amp; Historical Access Grants</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#8C877C]">Loading consent records…</div>
          ) : filteredConsents.length === 0 ? (
            <Card className="p-8 text-center text-xs text-[#8C877C]">No consents found for status "{filterTab}".</Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredConsents.map((consent) => (
                <Card key={consent.id} className="p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <StatusBadge status={consent.status} />
                        <h3 className="font-serif font-semibold text-[#2F2D29] text-base mt-2">{consent.doctorName}</h3>
                        <p className="text-xs text-[#787469] flex items-center gap-1 mt-0.5">
                          <Building2 size={12} className="text-[#A7AA91]" strokeWidth={1.75} />
                          {consent.hospitalName}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs bg-[#F4EFE6] p-3.5 rounded-xl border border-[#E8E1D4]">
                      {[
                        ['Access Scope', consent.accessLevel],
                        ['Granted Date', consent.grantedDate],
                        ['Expires On', consent.expiryDate],
                        ['Duration', consent.duration],
                        ['Purpose', consent.purpose],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-[#8C877C]">{label}:</span>
                          <span className="font-medium text-[#2F2D29]">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[#EFEAE0] pt-3 flex gap-2 justify-end">
                    <Button size="sm" variant="secondary" onClick={() => setViewConsentModal(consent)} icon={Eye}>
                      View Details
                    </Button>
                    {(consent.status === 'Active' || consent.status === 'Approved') && (
                      <Button size="sm" variant="danger" onClick={() => setRevokeConfirmConsent(consent)} icon={Ban}>
                        Revoke Access
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Modal: Approve */}
      {approvalModalRequest && (
        <Modal
          isOpen={!!approvalModalRequest}
          onClose={() => setApprovalModalRequest(null)}
          title="Confirm Access Permission"
          footer={
            <div className="flex gap-2 w-full justify-end">
              <Button variant="secondary" size="sm" onClick={() => setApprovalModalRequest(null)}>Cancel</Button>
              <Button size="sm" variant="primary" onClick={handleApproveConfirm} icon={CheckCircle2}>
                Allow Access
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-[#F4EFE6] border border-[#E5DDD0] rounded-xl">
              <div className="flex items-center gap-2 text-[#2F2D29] font-serif font-semibold text-sm mb-1.5">
                <Lock size={16} className="text-[#5D6454]" strokeWidth={1.75} />
                Allow {approvalModalRequest.hospitalName} to access your records?
              </div>
              <p className="text-[#686358] leading-relaxed font-light">
                By clicking Allow Access, you grant time-bound permission for the requested duration. You can revoke this permission at any time.
              </p>
            </div>
            <div className="space-y-2 bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-4">
              {[
                ['Provider', `${approvalModalRequest.hospitalName} — ${approvalModalRequest.requesterName}`],
                ['Records', Array.isArray(approvalModalRequest.requestedRecords) ? approvalModalRequest.requestedRecords.join(', ') : (approvalModalRequest.requestedRecords || 'All Records')],
                ['Duration', approvalModalRequest.duration],
                ['Purpose', approvalModalRequest.purpose],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-[#EFEAE0] pb-1.5 last:border-0 last:pb-0">
                  <span className="text-[#8C877C] font-medium">{label}:</span>
                  <span className="font-semibold text-[#2F2D29] text-right max-w-[200px]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: View Consent Detail */}
      {viewConsentModal && (
        <Modal
          isOpen={!!viewConsentModal}
          onClose={() => setViewConsentModal(null)}
          title={`Consent Detail — ${viewConsentModal.doctorName}`}
          footer={
            <Button size="sm" variant="secondary" onClick={() => setViewConsentModal(null)}>Close</Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-[#F4EFE6] rounded-xl border border-[#E8E1D4]">
              <div>
                <div className="font-serif font-semibold text-[#2F2D29] text-sm">{viewConsentModal.hospitalName}</div>
                <div className="text-[#787469] mt-0.5">{viewConsentModal.doctorName}</div>
              </div>
              <StatusBadge status={viewConsentModal.status} />
            </div>
            <div className="space-y-2 border border-[#E5DDD0] rounded-xl p-4 bg-[#FAF7F2]">
              {[
                ['Consent ID', viewConsentModal.id],
                ['Scope', viewConsentModal.accessLevel],
                ['Granted Date', viewConsentModal.grantedDate],
                ['Expiry Date', viewConsentModal.expiryDate],
                ['Purpose', viewConsentModal.purpose],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-[#EFEAE0] pb-1.5 last:border-0 last:pb-0">
                  <span className="text-[#8C877C]">{label}:</span>
                  <span className="font-medium text-[#2F2D29] font-mono text-right max-w-[200px] break-all">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Revoke Confirm */}
      {revokeConfirmConsent && (
        <Modal
          isOpen={!!revokeConfirmConsent}
          onClose={() => setRevokeConfirmConsent(null)}
          title="Revoke Access Permission"
          footer={
            <div className="flex gap-2 w-full justify-end">
              <Button variant="secondary" size="sm" onClick={() => setRevokeConfirmConsent(null)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleRevokeConfirm} icon={Ban}>
                Yes, Revoke Access
              </Button>
            </div>
          }
        >
          <div className="p-4 bg-[#F7EBE8] border border-[#EEC4BD] rounded-xl text-xs text-[#933D33]">
            <p className="font-semibold mb-1">Revoke access for {revokeConfirmConsent.doctorName}?</p>
            <p>{revokeConfirmConsent.hospitalName} will immediately lose access to your health records.</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

