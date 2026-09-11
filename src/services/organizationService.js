// Organization Profile and Statistics Service
// Handles hospital profile details, overview dashboard metrics, and profile updates.

import { mockOrganizations } from '../data/mockOrganizationData';
import { organizationDoctorService } from './organizationDoctorService';
import { organizationRequestService } from './organizationRequestService';
import { organizationRecordService } from './organizationRecordService';

const ORG_PROFILES_KEY = 'nalathunai_org_profiles_custom';

const getCustomProfiles = () => {
  try {
    const raw = localStorage.getItem(ORG_PROFILES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const organizationService = {
  /**
   * Get organization profile by Org ID or Hospital ID
   */
  async getOrganizationProfile(orgId = 'HOSP-PSG-01') {
    await new Promise((r) => setTimeout(r, 200));
    const custom = getCustomProfiles();
    const base = mockOrganizations.find(
      (o) => o.orgId.toUpperCase() === orgId.toUpperCase() || o.id.toUpperCase() === orgId.toUpperCase()
    ) || mockOrganizations[1]; // default PSG

    return {
      ...base,
      ...(custom[base.orgId] || {}),
    };
  },

  /**
   * Update organization profile fields
   */
  async updateOrganizationProfile(orgId, updateData) {
    await new Promise((r) => setTimeout(r, 300));
    const custom = getCustomProfiles();
    custom[orgId] = {
      ...(custom[orgId] || {}),
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(ORG_PROFILES_KEY, JSON.stringify(custom));
    return this.getOrganizationProfile(orgId);
  },

  /**
   * Get summary dashboard statistics for the organization
   */
  async getOrganizationStats(orgId = 'HOSP-PSG-01') {
    const [doctors, requests, records] = await Promise.all([
      organizationDoctorService.getDoctors(orgId),
      organizationRequestService.getRequests(orgId),
      organizationRecordService.getRecords(orgId),
    ]);

    const activeConsents = requests.filter((r) => r.status === 'Accepted').length;
    const pendingRequests = requests.filter((r) => r.status === 'Pending').length;
    const activeDoctors = doctors.filter((d) => d.organization_access_status === 'Active').length;

    return {
      totalDoctors: doctors.length,
      activeDoctors,
      activeConsents,
      pendingRequests,
      totalRecords: records.length,
      departmentsCount: new Set(doctors.map((d) => d.department || d.specialization)).size,
    };
  },
};
