import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { organizationDoctorService } from '../../services/organizationDoctorService';
import { Button } from '../../components/Button';
import {
  Search,
  Filter,
  Plus,
  Users,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Shield,
  Stethoscope,
  X,
  Phone,
  Mail,
} from 'lucide-react';

export const OrganizationDoctorsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const orgId = user?.orgId || 'HOSP-PSG-01';

  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // Status Modal State
  const [managingDoctor, setManagingDoctor] = useState(null);
  const [newStatus, setNewStatus] = useState('Active');
  const [statusReason, setStatusReason] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Add Doctor Modal State
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [newDocData, setNewDocData] = useState({
    name: '',
    qualification: 'MBBS, MD',
    specialization: 'Internal Medicine',
    registrationNumber: '',
    email: '',
    phone: '',
    department: 'Internal Medicine',
    designation: 'Consultant Specialist',
    roomNo: 'OPD Block',
  });
  const [addError, setAddError] = useState('');

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const list = await organizationDoctorService.getDoctors(
        orgId,
        searchQuery,
        selectedDept,
        selectedStatus
      );
      setDoctors(list);
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [orgId, searchQuery, selectedDept, selectedStatus]);

  const departments = Array.from(new Set(doctors.map((d) => d.specialization || d.department))).filter(Boolean);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!managingDoctor) return;
    setStatusUpdating(true);
    try {
      await organizationDoctorService.updateDoctorAccessStatus(
        managingDoctor.id,
        newStatus,
        statusReason
      );
      setManagingDoctor(null);
      setStatusReason('');
      await loadDoctors();
    } catch (err) {
      alert(err.message || 'Failed to update doctor status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setAddError('');
    try {
      await organizationDoctorService.addDoctorToOrganization(orgId, newDocData);
      setShowAddDoctorModal(false);
      setNewDocData({
        name: '',
        qualification: 'MBBS, MD',
        specialization: 'Internal Medicine',
        registrationNumber: '',
        email: '',
        phone: '',
        department: 'Internal Medicine',
        designation: 'Consultant Specialist',
        roomNo: 'OPD Block',
      });
      await loadDoctors();
    } catch (err) {
      setAddError(err.message || 'Failed to register doctor');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2F2D29]">
            Affiliated Doctors Directory
          </h1>
          <p className="text-xs text-[#787469] mt-0.5">
            Manage licensed clinicians authorized to consult and request records on behalf of this facility.
          </p>
        </div>
        <button
          onClick={() => setShowAddDoctorModal(true)}
          className="px-3.5 py-2 rounded-lg bg-[#2F2D29] text-[#F7F3EA] hover:bg-[#433F38] transition-colors text-xs font-medium flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-3 text-[#A8A296]" />
            <input
              type="text"
              placeholder="Search doctor by name, registration number, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#D5CDBD] rounded-lg text-xs text-[#2F2D29] placeholder-[#A8A296] focus:outline-none focus:ring-1 focus:ring-[#2F2D29]"
            />
          </div>

          {/* Department Filter */}
          <div className="w-full md:w-56">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg text-xs text-[#2F2D29] focus:outline-none focus:ring-1 focus:ring-[#2F2D29]"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-44">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg text-xs text-[#2F2D29] focus:outline-none focus:ring-1 focus:ring-[#2F2D29]"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Table / Card View */}
      <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4EFE6] border-b border-[#E5DDD0] text-[#787469] uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Doctor & ID</th>
                <th className="px-5 py-3">Department & Qualification</th>
                <th className="px-5 py-3">Medical Reg No</th>
                <th className="px-5 py-3">Access Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DDD0]">
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-xs text-[#8C877C]">
                    No doctors found matching the criteria.
                  </td>
                </tr>
              ) : (
                doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F4EFE6] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#E5DDD0] text-[#2F2D29] font-semibold text-xs flex items-center justify-center shrink-0">
                          {doc.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div
                            onClick={() => navigate(`/organization/doctors/${doc.id}`)}
                            className="font-semibold text-[#2F2D29] hover:underline cursor-pointer"
                          >
                            {doc.name}
                          </div>
                          <div className="text-[11px] text-[#8C877C] font-mono">{doc.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-[#2F2D29] font-medium">{doc.specialization}</div>
                      <div className="text-[11px] text-[#787469]">{doc.qualification}</div>
                    </td>

                    <td className="px-5 py-4 font-mono text-[11px] text-[#4E7737] font-semibold">
                      {doc.registrationNumber}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          doc.organization_access_status === 'Active'
                            ? 'bg-[#EFF4EA] border-[#C5D9B4] text-[#345124]'
                            : 'bg-[#FBEBE8] border-[#E4BCB3] text-[#933D33]'
                        }`}
                      >
                        {doc.organization_access_status === 'Active' ? (
                          <CheckCircle2 size={11} />
                        ) : (
                          <AlertTriangle size={11} />
                        )}
                        <span>{doc.organization_access_status}</span>
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setManagingDoctor(doc);
                            setNewStatus(doc.organization_access_status);
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium rounded border border-[#D5CDBD] text-[#555147] hover:bg-[#EFEAE0] transition-colors"
                        >
                          Manage Access
                        </button>
                        <button
                          onClick={() => navigate(`/organization/doctors/${doc.id}`)}
                          className="p-1 rounded text-[#8C877C] hover:text-[#2F2D29] transition-colors"
                          title="View Profile"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Manage Access Status */}
      {managingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F2D29]/40 backdrop-blur-xs">
          <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DDD0] pb-3">
              <h3 className="text-sm font-semibold text-[#2F2D29]">
                Manage Doctor Access: {managingDoctor.name}
              </h3>
              <button
                onClick={() => setManagingDoctor(null)}
                className="text-[#8C877C] hover:text-[#2F2D29]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#555147]">Current Affiliation</label>
                <div className="p-2.5 bg-[#F4EFE6] rounded-lg border border-[#E5DDD0] text-[11px]">
                  <p className="font-medium text-[#2F2D29]">{managingDoctor.name} ({managingDoctor.id})</p>
                  <p className="text-[#787469]">{managingDoctor.specialization} • {managingDoctor.registrationNumber}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#555147]">Access Authorization Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg text-xs text-[#2F2D29] focus:outline-none"
                >
                  <option value="Active">Active (Permit Patient Consent Requests & Records View)</option>
                  <option value="Suspended">Suspended (Revoke Clinical Access Node)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#555147]">Administrative Reason / Note</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Temporary leave of absence / Clinical credential review"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg text-xs text-[#2F2D29] placeholder-[#A8A296] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5DDD0]">
                <button
                  type="button"
                  onClick={() => setManagingDoctor(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#D5CDBD] text-[#555147] hover:bg-[#EFEAE0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusUpdating}
                  className="px-3.5 py-1.5 rounded-lg bg-[#2F2D29] text-[#F7F3EA] hover:bg-[#433F38] transition-colors"
                >
                  {statusUpdating ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Doctor to Roster */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F2D29]/40 backdrop-blur-xs">
          <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DDD0] pb-3">
              <h3 className="text-sm font-semibold text-[#2F2D29]">
                Register Doctor to Hospital Roster
              </h3>
              <button
                onClick={() => setShowAddDoctorModal(false)}
                className="text-[#8C877C] hover:text-[#2F2D29]"
              >
                <X size={16} />
              </button>
            </div>

            {addError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddDoctor} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#555147] mb-1">Doctor Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. S. Mohan"
                    value={newDocData.name}
                    onChange={(e) => setNewDocData({ ...newDocData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#555147] mb-1">State Reg No</label>
                  <input
                    type="text"
                    required
                    placeholder="TN-MED-99881"
                    value={newDocData.registrationNumber}
                    onChange={(e) => setNewDocData({ ...newDocData, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#555147] mb-1">Qualifications</label>
                  <input
                    type="text"
                    required
                    placeholder="MBBS, MD (General Medicine)"
                    value={newDocData.qualification}
                    onChange={(e) => setNewDocData({ ...newDocData, qualification: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#555147] mb-1">Specialization</label>
                  <input
                    type="text"
                    required
                    placeholder="Cardiology / Internal Medicine"
                    value={newDocData.specialization}
                    onChange={(e) => setNewDocData({ ...newDocData, specialization: e.target.value, department: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#555147] mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@hospital.example.com"
                    value={newDocData.email}
                    onChange={(e) => setNewDocData({ ...newDocData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#555147] mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98400 12345"
                    value={newDocData.phone}
                    onChange={(e) => setNewDocData({ ...newDocData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#555147] mb-1">Designation</label>
                  <input
                    type="text"
                    placeholder="Senior Consultant"
                    value={newDocData.designation}
                    onChange={(e) => setNewDocData({ ...newDocData, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#555147] mb-1">Room / OPD Clinic</label>
                  <input
                    type="text"
                    placeholder="Room 102, Block B"
                    value={newDocData.roomNo}
                    onChange={(e) => setNewDocData({ ...newDocData, roomNo: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5DDD0]">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#D5CDBD] text-[#555147] hover:bg-[#EFEAE0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-[#2F2D29] text-[#F7F3EA] hover:bg-[#433F38]"
                >
                  Enroll Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
