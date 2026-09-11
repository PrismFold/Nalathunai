// Mock Medical Registration Verification Service for Nalathunai Doctor Platform
// Simulates verification agent query against the dummy state medical registry

import { mockMedicalRegistry } from '../data/mockDoctorData';

export const doctorVerificationService = {
  /**
   * Verify Doctor against mock medical registry.
   * NOTE: The verification agent performs purely lookup/matching against the
   * dummy medical council registry. It does NOT grant authorization, consent, or authentication.
   * 
   * @param {string} doctorName 
   * @param {string} registrationNumber 
   */
  async verifyRegistration(doctorName, registrationNumber) {
    // Simulate agent registry verification lookup latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!doctorName || !registrationNumber) {
      return {
        verified: false,
        message: 'Please provide both full name and medical registration number.',
      };
    }

    const cleanName = doctorName.trim().toLowerCase().replace(/^dr\.?\s*/i, '');
    const cleanReg = registrationNumber.trim().toUpperCase().replace(/\s+/g, '');

    const record = mockMedicalRegistry.find((doc) => {
      const regMatch = doc.registrationNumber.toUpperCase().replace(/\s+/g, '') === cleanReg;
      const docCleanName = doc.doctorName.toLowerCase().replace(/^dr\.?\s*/i, '');
      const nameMatch = docCleanName.includes(cleanName) || cleanName.includes(docCleanName);
      return regMatch && nameMatch;
    });

    if (record) {
      return {
        verified: true,
        message: 'Medical registration verified',
        data: {
          doctorName: record.doctorName,
          registrationNumber: record.registrationNumber,
          council: record.council,
          qualification: record.qualification,
          specialty: record.specialty,
          hospitalAffiliation: record.hospitalAffiliation,
          registrationYear: record.registrationYear,
          statusNote: record.statusNote,
        },
      };
    }

    return {
      verified: false,
      message: 'Registration details could not be verified',
      details: 'No record matching this name and medical registration number was found in the dummy state medical council registry.',
    };
  },

  /**
   * Get list of sample registry doctors for demo reference.
   */
  getSampleDoctors() {
    return mockMedicalRegistry.map((d) => ({
      name: d.doctorName,
      regNo: d.registrationNumber,
      specialty: d.specialty,
    }));
  }
};
