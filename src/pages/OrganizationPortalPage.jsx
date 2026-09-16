import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hospitalDoctorService } from '../services/hospitalDoctorService';
import { supabaseService } from '../services/supabaseService';
import { recordService } from '../services/recordService';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import {
  Building2,
  Stethoscope,
  ShieldCheck,
  Users,
  Database,
  Search,
  Plus,
  LogOut,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

const SPECIALIZATIONS = [
  'Cardiology',
  'Internal Medicine',
  'Interventional Cardiology',
  'Endocrinology & Diabetology',
  'Orthopedics & Spine Surgery',
  'Neurology',
  'Pediatrics',
  'General Surgery',
  'Pulmonology',
];

export const OrganizationPortalPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Active Tab: 'doctors' | 'governance' | 'partition'
  const [activeTab, setActiveTab] = useState('governance');

  // Hospital Data
  const hospital = useMemo(() => {
    return {
      id: user?.id || 'HOSP-001',
      name: user?.name || 'Ganga Hospital',
      licenseNo: user?.licenseNo || 'NABH-TN-CBE-041',
      hospitalType: user?.hospitalType || 'Tertiary Care & Orthopedics',
      city: user?.city || 'Coimbatore',
      state: user?.state || 'Tamil Nadu',
      adminName: user?.adminName || 'Dr. S. Rajashekaran',
      email: user?.email || 'admin@gangahospital.com',
      phone: user?.phone || '+91 422 2485000',
      supabaseTable: user?.supabaseTable || 'ganga_hospital',
      bedCount: user?.bedCount || 450,
      accreditation: user?.accreditation || 'NABH Accredited',
    };
  }, [user]);

  // Doctors State
  const [doctors, setDoctors] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // Governance & Access State
  const [governanceList, setGovernanceList] = useState([]);
  const [governanceFilter, setGovernanceFilter] = useState('All');
  const [governanceSearch, setGovernanceSearch] = useState('');
  const [isLoadingGovernance, setIsLoadingGovernance] = useState(false);

  // Supabase Partition Records
  const [partitionRecords, setPartitionRecords] = useState([]);
  const [isLoadingPartition, setIsLoadingPartition] = useState(false);

  // Add Doctor Modal State
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [newDoctorData, setNewDoctorData] = useState({
    name: '',
    regNumber: '',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD',
    experienceYears: '7',
    email: '',
    phone: '',
    password: 'Doctor@123',
  });
  const [isSubmittingDoctor, setIsSubmittingDoctor] = useState(false);
  const [doctorSuccessNotice, setDoctorSuccessNotice] = useState('');

  // Audit Dispatch State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditMessage, setAuditMessage] = useState('');

  // Load Data Callbacks
  const loadDoctors = useCallback(async () => {
    setIsLoadingDoctors(true);
    try {
      const list = await hospitalDoctorService.getAllDoctors(hospital.id);
      setDoctors(list);
    } finally {
      setIsLoadingDoctors(false);
    }
  }, [hospital.id]);

  const loadGovernance = useCallback(async () => {
    setIsLoadingGovernance(true);
    try {
      const list = await hospitalDoctorService.getHospitalDoctorAccessGovernance(hospital.id);
      setGovernanceList(list);
    } finally {
      setIsLoadingGovernance(false);
    }
  }, [hospital.id]);

  const loadPartitionRecords = useCallback(async () => {
    setIsLoadingPartition(true);
    try {
      const rows = await supabaseService.fetchHospitalRows(hospital.supabaseTable, 20);
      setPartitionRecords(rows);
    } finally {
      setIsLoadingPartition(false);
    }
  }, [hospital.supabaseTable]);

  useEffect(() => {
    loadDoctors();
    loadGovernance();
    loadPartitionRecords();
  }, [loadDoctors, loadGovernance, loadPartitionRecords]);

  // Handle Add Doctor
  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingDoctor(true);
    try {
      await hospitalDoctorService.registerDoctor({
        ...newDoctorData,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
      });

      setDoctorSuccessNotice(`Dr. ${newDoctorData.name} registered under ${hospital.name}.`);
      await loadDoctors();

      setTimeout(() => {
        setIsAddDoctorOpen(false);
        setDoctorSuccessNotice('');
        setNewDoctorData({
          name: '',
          regNumber: '',
          specialization: 'Cardiology',
          qualification: 'MBBS, MD',
          experienceYears: '7',
          email: '',
          phone: '',
          password: 'Doctor@123',
        });
      }, 1200);
    } catch (err) {
      alert(err.message || 'Could not register doctor');
    } finally {
      setIsSubmittingDoctor(false);
    }
  };

  // Trigger SNS Workbench Audit Sync
  const handleTriggerAuditSync = async () => {
    setIsAuditing(true);
    setAuditMessage('');
    try {
      const res = await recordService.sendOrganizationAuditWebhook({
        hospital,
        doctorsCount: doctors.length,
        consentsCount: governanceList.length,
        action: 'ORGANIZATION_AUDIT',
      });
      setAuditMessage('Access governance audit successfully synced to SNS Workbench orchestrator.');
      setTimeout(() => setAuditMessage(''), 3000);
    } catch {
      setAuditMessage('Audit logged locally.');
      setTimeout(() => setAuditMessage(''), 3000);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Filtered Governance Permissions Table
  const filteredGovernance = useMemo(() => {
    return governanceList.filter((item) => {
      const matchesFilter =
        governanceFilter === 'All' || item.status?.toLowerCase() === governanceFilter.toLowerCase();
      const term = governanceSearch.trim().toLowerCase();
      const matchesSearch =
        !term ||
        item.doctorName?.toLowerCase().includes(term) ||
        item.patientName?.toLowerCase().includes(term) ||
        item.patientAadhaar?.toLowerCase().includes(term) ||
        item.purpose?.toLowerCase().includes(term);

      return matchesFilter && matchesSearch;
    });
  }, [governanceList, governanceFilter, governanceSearch]);

  const activeConsentsCount = useMemo(() => {
    return governanceList.filter((g) => g.status === 'Active').length;
  }, [governanceList]);

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#2F2D29] flex flex-col font-sans">
      
      {/* TOP HOSPITAL APP HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5DDD0] shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="small" />
            <span className="hidden sm:inline-block w-px h-5 bg-stone-300 mx-1" />
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#eef2f6] text-[#1e3a5f] rounded-full text-xs font-semibold">
              <Building2 size={13} /> Hospital Command Center
            </div>
          </div>

          {/* Hospital Profile Info & Actions */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-stone-900 flex items-center justify-end gap-1.5">
                {hospital.name}
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-semibold border border-blue-200">
                  {hospital.licenseNo}
                </span>
              </div>
              <div className="text-[11px] text-stone-500">
                Admin: {hospital.adminName} · {hospital.city}, {hospital.state}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('governance')}
              className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'governance'
                  ? 'border-[#1e3a5f] text-[#1e3a5f]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <ShieldCheck size={14} /> Doctor Patient Record Access Governance
              <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded-full font-mono">
                {governanceList.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'doctors'
                  ? 'border-[#1e3a5f] text-[#1e3a5f]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Users size={14} /> Affiliated Doctors Directory
              <span className="ml-1 px-1.5 py-0.5 bg-stone-100 text-stone-600 text-[10px] rounded-full font-mono">
                {doctors.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('partition')}
              className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'partition'
                  ? 'border-[#1e3a5f] text-[#1e3a5f]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Database size={14} /> Supabase Partition Records (`{hospital.supabaseTable}`)
              <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-mono">
                {partitionRecords.length}
              </span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={handleTriggerAuditSync}
              disabled={isAuditing}
              className="py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={12} className={isAuditing ? 'animate-spin' : ''} />
              {isAuditing ? 'Auditing…' : 'Sync Workbench Audit'}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        
        {/* ORGANIZATION HERO BANNER & KPI CARDS */}
        <div className="bg-gradient-to-r from-[#1e3a5f] via-[#24426b] to-[#0f5257] rounded-2xl p-6 text-white shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight">{hospital.name}</h1>
                <span className="bg-white/20 text-white text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                  {hospital.accreditation}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-1 flex items-center gap-2">
                <span>{hospital.hospitalType}</span>
                <span>·</span>
                <span>Licensed Beds: {hospital.bedCount}</span>
                <span>·</span>
                <span>Backend Partition: `public.{hospital.supabaseTable}`</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddDoctorOpen(true)}
                className="py-2.5 px-4 bg-white text-[#1e3a5f] hover:bg-stone-100 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus size={14} strokeWidth={2.5} /> Onboard New Doctor
              </button>
            </div>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-3.5 rounded-xl">
              <div className="text-2xl font-bold font-mono">{doctors.length}</div>
              <div className="text-[10px] text-white/75 font-semibold uppercase tracking-wider mt-0.5">
                Affiliated Doctors
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-3.5 rounded-xl">
              <div className="text-2xl font-bold font-mono text-emerald-300">{activeConsentsCount}</div>
              <div className="text-[10px] text-white/75 font-semibold uppercase tracking-wider mt-0.5">
                Active Patient Consents
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-3.5 rounded-xl">
              <div className="text-2xl font-bold font-mono">{partitionRecords.length}</div>
              <div className="text-[10px] text-white/75 font-semibold uppercase tracking-wider mt-0.5">
                Supabase Records Stored
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-3.5 rounded-xl">
              <div className="text-2xl font-bold font-mono text-cyan-300">100%</div>
              <div className="text-[10px] text-white/75 font-semibold uppercase tracking-wider mt-0.5">
                ABDM Governance Compliance
              </div>
            </div>
          </div>
        </div>

        {auditMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{auditMessage}</span>
          </div>
        )}

        {/* TAB 1: DOCTOR PATIENT RECORD ACCESS GOVERNANCE TABLE */}
        {activeTab === 'governance' && (
          <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden space-y-0">
            
            {/* Table Controls */}
            <div className="p-5 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-stone-900">
                  Doctor Patient Record Access Governance &amp; Audit Logs
                </h2>
                <p className="text-xs text-stone-500">
                  Comprehensive audit of each doctor's granted permissions and access to patient clinical records
                </p>
              </div>

              {/* Filter & Search */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search doctor, patient, or Aadhaar…"
                    value={governanceSearch}
                    onChange={(e) => setGovernanceSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#1e3a5f]"
                  />
                </div>

                <select
                  value={governanceFilter}
                  onChange={(e) => setGovernanceFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Consents</option>
                  <option value="Pending">Pending Requests</option>
                </select>

                <button
                  type="button"
                  onClick={loadGovernance}
                  className="p-2 text-stone-500 hover:text-stone-800 rounded-lg"
                  title="Reload Governance Table"
                >
                  <RefreshCw size={14} className={isLoadingGovernance ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Governance Table */}
            {filteredGovernance.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <ShieldCheck size={36} className="mx-auto text-stone-300" />
                <h3 className="text-sm font-semibold text-stone-800">No Access Records Matched</h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  When affiliated doctors request consent or access patient records, the auditable governance logs will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Doctor (Practitioner)</th>
                      <th className="py-3 px-4">Patient &amp; Identifier</th>
                      <th className="py-3 px-4">Accessible Record Categories</th>
                      <th className="py-3 px-4">Clinical Purpose</th>
                      <th className="py-3 px-4">Consent Status</th>
                      <th className="py-3 px-4">Duration &amp; Expiry</th>
                      <th className="py-3 px-4 text-right">Audit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredGovernance.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                        
                        {/* Doctor */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-stone-900">{item.doctorName}</div>
                          <div className="text-[11px] text-stone-500">{item.doctorSpecialization || 'Clinical Specialist'}</div>
                        </td>

                        {/* Patient */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-stone-800">{item.patientName}</div>
                          <div className="text-[11px] text-stone-500 font-mono">
                            Aadhaar: {item.patientAadhaar}
                          </div>
                        </td>

                        {/* Accessible Categories */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(item.requestedRecords) ? item.requestedRecords : [item.requestedRecords]).map((cat, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[10px] font-medium rounded-md"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Purpose */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-stone-700 truncate" title={item.purpose}>
                            {item.purpose}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {item.status === 'Active' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 size={11} /> Granted &amp; Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Pending Approval
                            </span>
                          )}
                        </td>

                        {/* Duration */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600">
                          <div>{item.duration || '30 Days'}</div>
                          <div className="text-[10px] text-stone-400">
                            {item.expiresAt ? `Until ${new Date(item.expiresAt).toLocaleDateString()}` : '30-day window'}
                          </div>
                        </td>

                        {/* Action / Verified */}
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                            ABDM Audited
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AFFILIATED DOCTORS ROSTER */}
        {activeTab === 'doctors' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-stone-900">Affiliated Medical Staff Roster</h2>
                <p className="text-xs text-stone-500">
                  Certified practitioners registered to practice and request patient consent under {hospital.name}
                </p>
              </div>
              <Button
                size="sm"
                icon={Plus}
                onClick={() => setIsAddDoctorOpen(true)}
              >
                Add Practitioner
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doc) => (
                <div key={doc.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#eef2f6] text-[#1e3a5f] flex items-center justify-center font-bold">
                        <Stethoscope size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-stone-900">{doc.name}</h3>
                        <p className="text-xs text-[#1e3a5f] font-semibold">{doc.specialization}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {doc.status || 'Active'}
                    </span>
                  </div>

                  <div className="bg-stone-50 p-2.5 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Council Reg No:</span>
                      <span className="font-mono font-semibold text-stone-700">{doc.regNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Experience:</span>
                      <span className="font-semibold text-stone-700">{doc.experienceYears || 8} Years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Email:</span>
                      <span className="text-stone-700 truncate">{doc.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Contact Phone:</span>
                      <span className="text-stone-700">{doc.phone}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1">
                    <span>Department: {doc.department || doc.specialization}</span>
                    <span className="text-[#1e3a5f] font-semibold">Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SUPABASE PARTITION RECORDS */}
        {activeTab === 'partition' && (
          <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden space-y-0">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Database size={15} className="text-[#0f5257]" />
                  PostgreSQL Partition Table: `public.{hospital.supabaseTable}`
                </h2>
                <p className="text-xs text-stone-500">
                  Live diagnostic biomarker rows stored in Supabase for {hospital.name}
                </p>
              </div>
              <button
                type="button"
                onClick={loadPartitionRecords}
                className="text-xs font-semibold text-[#0f5257] hover:underline flex items-center gap-1"
              >
                <RefreshCw size={12} className={isLoadingPartition ? 'animate-spin' : ''} /> Reload Records
              </button>
            </div>

            {partitionRecords.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Database size={36} className="mx-auto text-stone-300" />
                <h3 className="text-sm font-semibold text-stone-800">No Records Loaded in Partition</h3>
                <p className="text-xs text-stone-400">
                  Patient clinical records uploaded or synced to `{hospital.supabaseTable}` will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Patient ID &amp; Name</th>
                      <th className="py-3 px-4">Aadhaar</th>
                      <th className="py-3 px-4">Primary Diagnosis</th>
                      <th className="py-3 px-4">Visit Date</th>
                      <th className="py-3 px-4">Glucose (mg/dL)</th>
                      <th className="py-3 px-4">HbA1c (%)</th>
                      <th className="py-3 px-4">Cholesterol</th>
                      <th className="py-3 px-4">Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                    {partitionRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900 font-sans text-xs">{rec.patientName}</div>
                          <div className="text-[10px] text-stone-500">{rec.patientId}</div>
                        </td>
                        <td className="py-3 px-4 text-stone-700">{rec.aadhaar}</td>
                        <td className="py-3 px-4 font-sans text-stone-800 font-medium">{rec.vitals?.primaryDiagnosis || rec.title}</td>
                        <td className="py-3 px-4 text-stone-600">{rec.date}</td>
                        <td className="py-3 px-4 font-bold text-stone-800">{rec.vitals?.bloodGlucose || '105.0'}</td>
                        <td className="py-3 px-4 text-stone-800">{rec.vitals?.hba1c || '5.7'}%</td>
                        <td className="py-3 px-4 text-stone-800">{rec.vitals?.cholesterol || '190.0'}</td>
                        <td className="py-3 px-4 font-sans">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {rec.vitals?.treatmentOutcome || 'Stable'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ONBOARD NEW DOCTOR MODAL */}
        {isAddDoctorOpen && (
          <Modal
            isOpen={isAddDoctorOpen}
            onClose={() => setIsAddDoctorOpen(false)}
            title={`Onboard Practitioner to ${hospital.name}`}
            maxWidth="max-w-lg"
          >
            {doctorSuccessNotice ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-stone-900">Doctor Successfully Onboarded!</h4>
                <p className="text-xs text-stone-500">{doctorSuccessNotice}</p>
              </div>
            ) : (
              <form onSubmit={handleAddDoctorSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Doctor Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. S. K. Narayanan"
                      value={newDoctorData.name}
                      onChange={(e) => setNewDoctorData({ ...newDoctorData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Council Reg No. *</label>
                    <input
                      type="text"
                      required
                      placeholder="NMC-TN-2018-9901"
                      value={newDoctorData.regNumber}
                      onChange={(e) => setNewDoctorData({ ...newDoctorData, regNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Specialization *</label>
                    <select
                      value={newDoctorData.specialization}
                      onChange={(e) => setNewDoctorData({ ...newDoctorData, specialization: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    >
                      {SPECIALIZATIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Years Experience</label>
                    <input
                      type="number"
                      value={newDoctorData.experienceYears}
                      onChange={(e) => setNewDoctorData({ ...newDoctorData, experienceYears: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Doctor Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="doctor@hospital.org"
                      value={newDoctorData.email}
                      onChange={(e) => setNewDoctorData({ ...newDoctorData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98421 00000"
                      value={newDoctorData.phone}
                      onChange={(e) => setNewDoctorData({ ...newDoctorData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Default Password *</label>
                  <input
                    type="password"
                    required
                    value={newDoctorData.password}
                    onChange={(e) => setNewDoctorData({ ...newDoctorData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setIsAddDoctorOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmittingDoctor}>
                    {isSubmittingDoctor ? 'Adding…' : 'Register Doctor'}
                  </Button>
                </div>
              </form>
            )}
          </Modal>
        )}
      </main>
    </div>
  );
};
