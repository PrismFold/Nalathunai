// Organization Authentication Service for Nalathunai Healthcare Platform
// Handles organization/hospital login, session persistence, and logout.

import { mockOrganizations } from '../data/mockOrganizationData';

const ORG_AUTH_STORAGE_KEY = 'nalathunai_org_auth_user';
const ORG_TOKEN_KEY = 'nalathunai_org_auth_token';

export const organizationAuthService = {
  /**
   * Log in an organization using Org ID (or Hospital Email) and password
   * Demo default: HOSP-PSG-01 / password123
   */
  async login(identifier, password) {
    await new Promise((resolve) => setTimeout(resolve, 450));

    if (!identifier || !password) {
      throw new Error('Please enter Organization Facility ID / Email and Password.');
    }

    const cleanIdent = identifier.trim().toLowerCase();

    // Check against 5 predefined hospitals
    const org = mockOrganizations.find(
      (o) =>
        o.orgId.toLowerCase() === cleanIdent ||
        o.id.toLowerCase() === cleanIdent ||
        o.contactEmail.toLowerCase() === cleanIdent
    );

    if (org && (password === 'password123' || password === 'Password@123' || password === 'admin123')) {
      const orgUser = {
        ...org,
        role: 'organization',
        token: `mock-org-jwt-${org.orgId}-${Date.now()}`,
        loggedInAt: new Date().toISOString(),
      };

      localStorage.setItem(ORG_AUTH_STORAGE_KEY, JSON.stringify(orgUser));
      localStorage.setItem(ORG_TOKEN_KEY, orgUser.token);
      return orgUser;
    }

    throw new Error('Invalid organization credentials. Demo login: HOSP-PSG-01 / password123');
  },

  /**
   * Log out organization session
   */
  async logout() {
    localStorage.removeItem(ORG_AUTH_STORAGE_KEY);
    localStorage.removeItem(ORG_TOKEN_KEY);
    return true;
  },

  /**
   * Retrieve active organization session
   */
  getCurrentOrganization() {
    try {
      const stored = localStorage.getItem(ORG_AUTH_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore JSON parse error
    }
    return null;
  },

  /**
   * Check if organization is authenticated
   */
  isOrganizationAuthenticated() {
    return !!localStorage.getItem(ORG_TOKEN_KEY);
  },
};
