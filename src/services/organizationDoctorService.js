// Organization Doctor Directory & Access Management Service
// Manages the doctors affiliated with an organization, their access status, and department filtering.

import { mockOrganizationDoctors } from '../data/mockOrganizationData';

const ORG_DOCTORS_STORAGE_KEY = 'nalathunai_org_doctors_data';

const getStoredDoctors = () => {
  try {
    const raw = localStorage.getItem(ORG_DOCTORS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : mockOrganizationDoctors;
  } catch {
    return mockOrganizationDoctors;
  }
};

const saveStoredDoctors = (docs) => {
  localStorage.setItem(ORG_DOCTORS_STORAGE_KEY, JSON.stringify(docs));
};

export const organizationDoctorService = {
  /**
   * Get all doctors affiliated with an organization
   */
  async getDoctors(orgId = 'HOSP-PSG-01', query = '', department = 'all', status = 'all') {
    await new Promise((r) => setTimeout(r, 250));
    const all = getStoredDoctors();
    
    // Filter by organization (support matching by orgId or hospitalId)
    let filtered = all.filter(
      (d) =>
        d.hospitalOrgId?.toUpperCase() === orgId?.toUpperCase() ||
        d.hospitalId?.toUpperCase() === orgId?.toUpperCase()
    );

    // Filter by query (name, specialization, regNumber)
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          d.registrationNumber.toLowerCase().includes(q) ||
          d.department?.toLowerCase().includes(q)
      );
    }

    // Filter by department
    if (department && department !== 'all') {
      filtered = filtered.filter((d) => d.department === department || d.specialization === department);
    }

    // Filter by status (Active, Suspended, etc.)
    if (status && status !== 'all') {
      filtered = filtered.filter((d) => d.organization_access_status === status);
    }

    return filtered;
  },

  /**
   * Get doctor by ID within organization
   */
  async getDoctorById(doctorId, orgId = 'HOSP-PSG-01') {
    await new Promise((r) => setTimeout(r, 150));
    const all = getStoredDoctors();
    const doc = all.find(
      (d) =>
        d.id === doctorId &&
        (d.hospitalOrgId?.toUpperCase() === orgId?.toUpperCase() ||
          d.hospitalId?.toUpperCase() === orgId?.toUpperCase())
    );
    if (!doc) {
      throw new Error(`Doctor with ID ${doctorId} not found in this organization.`);
    }
    return doc;
  },

  /**
   * Update doctor organization access status (e.g. Active <-> Suspended)
   */
  async updateDoctorAccessStatus(doctorId, newStatus, reason = '') {
    await new Promise((r) => setTimeout(r, 300));
    const all = getStoredDoctors();
    const index = all.findIndex((d) => d.id === doctorId);
    if (index === -1) {
      throw new Error('Doctor not found.');
    }

    all[index] = {
      ...all[index],
      organization_access_status: newStatus,
      statusNote: reason || `Status updated to ${newStatus} by Hospital Administration`,
      statusUpdatedAt: new Date().toISOString(),
    };

    saveStoredDoctors(all);
    return all[index];
  },

  /**
   * Add / Register new doctor to hospital roster
   */
  async addDoctorToOrganization(orgId, doctorData) {
    await new Promise((r) => setTimeout(r, 400));
    const all = getStoredDoctors();

    // Check duplicate reg number
    const existing = all.find(
      (d) => d.registrationNumber.toUpperCase() === doctorData.registrationNumber.trim().toUpperCase()
    );
    if (existing) {
      throw new Error(`Doctor with registration number ${doctorData.registrationNumber} is already registered.`);
    }

    const newDoc = {
      id: `D${String(all.length + 1).padStart(3, '0')}`,
      name: doctorData.name,
      qualification: doctorData.qualification || 'MBBS, MD',
      specialization: doctorData.specialization || 'General Medicine',
      registrationNumber: doctorData.registrationNumber,
      council: doctorData.council || 'Tamil Nadu Medical Council',
      role: 'Doctor',
      status: 'Verified',
      hospitalId: orgId.includes('PSG') ? 'H002' : 'H001',
      hospitalOrgId: orgId,
      hospitalName: doctorData.hospitalName || 'PSG Institute of Medical Sciences & Research',
      organization_access_status: 'Active',
      email: doctorData.email,
      phone: doctorData.phone || '+91 98765 00000',
      experienceYears: Number(doctorData.experienceYears) || 5,
      joiningDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      department: doctorData.department || doctorData.specialization,
      designation: doctorData.designation || 'Consultant Specialist',
      roomNo: doctorData.roomNo || 'OPD Suite',
    };

    all.push(newDoc);
    saveStoredDoctors(all);
    return newDoc;
  },
};
