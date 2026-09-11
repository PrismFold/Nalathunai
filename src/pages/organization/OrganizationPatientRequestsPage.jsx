import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { organizationRequestService } from '../../services/organizationRequestService';
import { organizationDoctorService } from '../../services/organizationDoctorService';
import {
  SendHorizontal,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  X,
  Shield,
  User,
  Calendar,
} from 'lucide-react';

export const OrganizationPatientRequestsPage = () => {
  const { user } = useAuth();
  const orgId = user?.orgId || 'HOSP-PSG-01';
  const orgName = user?.name || 'PSG Institute of Medical Sciences & Research';

  const [requests, setRequests] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // New Request Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newReq, setNewReq] = useState({
    patientName: 'Ananya Ramesh',
    patientAbha: '91-4829-1029-4720',
    doctorId: '',
    doctorName: '',
    purpose: 'Cardiovascular screening & pre-procedure record review',
    recordTypes: ['Lab Reports', 'Prescriptions'],
    accessLevel: 'View & Download',
  });

  const loadRequests = async () => {
    setLoading(true);
    try {
      const [reqList, docList] = await Promise.all([
        organizationRequestService.getRequests(orgId, statusFilter),
        organizationDoctorService.getDoctors(orgId),
      ]);
      setRequests(reqList);
      setDoctors(docList);
      if (docList.length > 0 && !newReq.doctorId) {
        setNewReq((prev) => ({
          ...prev,
          doctorId: docList[0].id,
          doctorName: docList[0].name,
        }));
      }
    } catch (err) {
      console.error('Failed to load patient requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [orgId, statusFilter]);

  const filteredRequests = requests.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.patientName.toLowerCase().includes(q) ||
      r.patientAbha.toLowerCase().includes(q) ||
      r.doctorName.toLowerCase().includes(q) ||
      r.purpose.toLowerCase().includes(q)
    );
  });

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedDoc = doctors.find((d) => d.id === newReq.doctorId);
      await organizationRequestService.createRequest(orgId, {
        ...newReq,
        hospitalName: orgName,
        doctorName: selectedDoc ? selectedDoc.name : newReq.doctorName,
      });
      setShowModal(false);
      await loadRequests();
    } catch (err) {
      alert('Failed to dispatch consent request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this pending consent request?')) return;
    try {
      await organizationRequestService.cancelRequest(requestId);
      await loadRequests();
    } catch (err) {
      alert('Failed to cancel request: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2F2D29]">
            Patient Record Requests
          </h1>
          <p className="text-xs text-[#787469] mt-0.5">
            Manage consent requests dispatched to patients under ABDM consent framework guidelines.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 rounded-lg bg-[#2F2D29] text-[#F7F3EA] hover:bg-[#433F38] transition-colors text-xs font-medium flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>New Record Request</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-3 text-[#A8A296]" />
            <input
              type="text"
              placeholder="Search by patient name, ABHA ID, doctor, or purpose..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#D5CDBD] rounded-lg text-xs text-[#2F2D29] placeholder-[#A8A296] focus:outline-none"
            />
          </div>

          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg text-xs text-[#2F2D29] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Accepted">Accepted / Active</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4EFE6] border-b border-[#E5DDD0] text-[#787469] uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Patient & ABHA ID</th>
                <th className="px-5 py-3">Requesting Doctor</th>
                <th className="px-5 py-3">Purpose & Records</th>
                <th className="px-5 py-3">Dates</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DDD0]">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-xs text-[#8C877C]">
                    No consent requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#F4EFE6] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#2F2D29]">{req.patientName}</div>
                      <div className="text-[11px] text-[#8C877C] font-mono">{req.patientAbha}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-[#2F2D29]">{req.doctorName}</div>
                      <div className="text-[11px] text-[#787469]">{orgName}</div>
                    </td>

                    <td className="px-5 py-4 max-w-xs">
                      <div className="text-[#2F2D29] line-clamp-1">{req.purpose}</div>
                      <div className="text-[10px] text-[#8C877C]">
                        {Array.isArray(req.recordTypes) ? req.recordTypes.join(', ') : req.recordTypes}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-[11px]">
                      <div className="text-[#2F2D29]">Sent: {req.requestDate}</div>
                      <div className="text-[#8C877C]">Expires: {req.expiryDate}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          req.status === 'Accepted'
                            ? 'bg-[#EFF4EA] border-[#C5D9B4] text-[#345124]'
                            : req.status === 'Pending'
                            ? 'bg-[#FDF8E8] border-[#EADAA4] text-[#8C6D28]'
                            : 'bg-[#FBEBE8] border-[#E4BCB3] text-[#933D33]'
                        }`}
                      >
                        {req.status === 'Accepted' && <CheckCircle2 size={11} />}
                        {req.status === 'Pending' && <Clock size={11} />}
                        {req.status !== 'Accepted' && req.status !== 'Pending' && <XCircle size={11} />}
                        <span>{req.status}</span>
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      {req.status === 'Pending' ? (
                        <button
                          onClick={() => handleCancelRequest(req.id)}
                          className="px-2.5 py-1 text-[11px] font-medium rounded border border-[#E4BCB3] text-[#933D33] hover:bg-rose-50 transition-colors"
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#A8A296]">Archived</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Consent Request */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F2D29]/40 backdrop-blur-xs">
          <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DDD0] pb-3">
              <h3 className="text-sm font-semibold text-[#2F2D29]">
                Initiate Patient Consent Request
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#8C877C] hover:text-[#2F2D29]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#555147] mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Ramesh"
                  value={newReq.patientName}
                  onChange={(e) => setNewReq({ ...newReq, patientName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#555147] mb-1">Patient ABHA Number / ID</label>
                <input
                  type="text"
                  required
                  placeholder="91-4829-1029-4720"
                  value={newReq.patientAbha}
                  onChange={(e) => setNewReq({ ...newReq, patientAbha: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#555147] mb-1">Requesting Practitioner</label>
                <select
                  value={newReq.doctorId}
                  onChange={(e) => {
                    const doc = doctors.find((d) => d.id === e.target.value);
                    setNewReq({
                      ...newReq,
                      doctorId: e.target.value,
                      doctorName: doc ? doc.name : '',
                    });
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg"
                >
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#555147] mb-1">Clinical Purpose</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pre-operative assessment, Diagnostic follow-up"
                  value={newReq.purpose}
                  onChange={(e) => setNewReq({ ...newReq, purpose: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#555147] mb-1">Access Duration</label>
                <div className="p-2 bg-[#F4EFE6] rounded border border-[#E5DDD0] text-[11px] text-[#787469]">
                  Standard 7-Day Access Window (Compliant with ABDM Tier-1 policy)
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5DDD0]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#D5CDBD] text-[#555147] hover:bg-[#EFEAE0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3.5 py-1.5 rounded-lg bg-[#2F2D29] text-[#F7F3EA] hover:bg-[#433F38]"
                >
                  {submitting ? 'Transmitting...' : 'Dispatch Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
