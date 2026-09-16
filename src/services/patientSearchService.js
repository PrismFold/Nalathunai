// Patient Search Service for Nalathunai Doctor Platform
// Allows verified doctors to search for patients by ID, Name, or Email
// RESTRICTION: Returns only basic permitted identifying metadata.
// Clinical records are NEVER returned via search.

import { mockSearchablePatients } from '../data/mockDoctorData';

export const patientSearchService = {
  /**
   * Search patients by query.
   * @param {string} query - Patient ID, Name, or Email
   * @returns {Promise<Array>} List of matching patients with permitted identifying info only
   */
  async searchPatients(query) {
    // Simulate lookup delay
    await new Promise((resolve) => setTimeout(resolve, 350));

    if (!query || query.trim().length === 0) {
      // Return all searchable patients if query is empty
      return mockSearchablePatients.map(this.stripClinicalRecords);
    }

    const clean = query.trim().toLowerCase();

    const matches = mockSearchablePatients.filter((p) => {
      const matchId = p.id.toLowerCase().includes(clean);
      const matchName = p.name.toLowerCase().includes(clean);
      const matchEmail = p.email.toLowerCase().includes(clean);
      const matchAbha = p.abhaId.replace(/-/g, '').includes(clean.replace(/-/g, ''));
      return matchId || matchName || matchEmail || matchAbha;
    });

    return matches.map(this.stripClinicalRecords);
  },

  /**
   * Get basic patient identifying info by ID.
   * Does NOT return clinical records.
   */
  async getPatientBasicInfo(patientId) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const p = mockSearchablePatients.find((patient) => patient.id === patientId);
    if (!p) return null;
    return this.stripClinicalRecords(p);
  },

  /**
   * Helper that removes clinical records from search results to ensure
   * strict privacy compliance before consent is established.
   */
  stripClinicalRecords(patient) {
    const { records, ...permittedInfo } = patient;
    return {
      ...permittedInfo,
      hasRecordsCount: records ? records.length : 0,
    };
  }
};
