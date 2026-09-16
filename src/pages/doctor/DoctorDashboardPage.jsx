import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorConsentService } from '../../services/doctorConsentService';
import { patientSearchService } from '../../services/patientSearchService';
import { auditService } from '../../services/auditService';
import { RequestConsentModal } from '../../components/RequestConsentModal';
import { Button } from '../../components/Button';
import {
  Search,
  ShieldCheck,
  Clock,
  CheckCircle2,
  FileText,
  UserCheck,
  ArrowRight,
  Stethoscope,
  Building2,
  AlertCircle,
  History,
} from 'lucide-react';

export const DoctorDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const doctorName = user?.name || 'Dr. Ananya Kumar';
  const regNumber = user?.registrationNumber || 'TN-MED-00123';
  const specialty = user?.specialty || 'Internal Medicine & Chronic Disease Care';
  const hospitalAffiliation = user?.hospital || 'PSG Institute of Medical Sciences';

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [activeConsents, setActiveConsents] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [recentAccess, setRecentAccess] = useState([]);
  const [loading, setLoading] = useState(true);

  const [consentModalPatient, setConsentModalPatient] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [allRequests, accessLogs] = await Promise.all([
        doctorConsentService.getAllDoctorRequests(regNumber),
        auditService.getAccessHistory(),
      ]);

      const active = allRequests.filter((r) => r.status === 'Accepted');
      const pending = allRequests.filter((r) => r.status === 'Pending');

      setActiveConsents(active);
      setPendingRequests(pending);
      setRecentAccess(accessLogs.slice(0, 4));
    } catch (e) {
      console.error('Error loading doctor dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [regNumber]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setHasSearched(true);
    try {
      const results = await patientSearchService.searchPatients(searchQuery);
      // Fetch consent status for each patient
      const enriched = await Promise.all(
        results.map(async (p) => {
          const { status } = await doctorConsentService.getPatientConsentStatus(p.id, regNumber);
          return { ...p, consentStatus: status };
        })
      );
      setSearchResults(enriched);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleConsentRequested = () => {
    loadDashboardData();
    if (hasSearched && searchQuery) {
      handleSearch({ preventDefault: () => {} });
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Practitioner Banner */}
      <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF4EA] border border-[#C5D9B4] text-[#345124] text-[11px] font-mono font-semibold">
                <CheckCircle2 size={12} className="text-[#4E7737]" />
                <span>TNMC Verified Practitioner</span>
              </span>
              <span className="text-xs text-[#8C877C] font-mono">Reg: {regNumber}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#2F2D29] font-medium tracking-tight">
              Welcome, {doctorName}
            </h1>
            <p className="text-xs text-[#686358] max-w-xl leading-relaxed">
              {specialty} • {hospitalAffiliation}. Access patient health records governed by explicit patient consent under the Nalathunai security architecture.
            </p>
          </div>

          <Button
            size="md"
            variant="secondary"
            onClick={() => navigate('/doctor/patients')}
            icon={Search}
            className="self-start sm:self-auto"
          >
            Find Patient
          </Button>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#E5DDD0]">
          <div className="p-3 bg-[#F4EFE6] rounded-xl border border-[#E5DDD0]">
            <div className="flex items-center justify-between text-[#787469] mb-1">
              <span className="text-[11px] font-medium">Active Consents</span>
              <ShieldCheck size={14} className="text-[#5D6454]" />
            </div>
            <p className="text-2xl font-serif text-[#2F2D29] font-semibold">
              {activeConsents.length}
            </p>
            <span className="text-[10px] text-[#787469]">Patients with full record access</span>
          </div>

          <div className="p-3 bg-[#F4EFE6] rounded-xl border border-[#E5DDD0]">
            <div className="flex items-center justify-between text-[#787469] mb-1">
              <span className="text-[11px] font-medium">Pending Requests</span>
              <Clock size={14} className="text-[#865F1D]" />
            </div>
            <p className="text-2xl font-serif text-[#865F1D] font-semibold">
              {pendingRequests.length}
            </p>
            <span className="text-[10px] text-[#787469]">Awaiting patient approval</span>
          </div>

          <div className="p-3 bg-[#F4EFE6] rounded-xl border border-[#E5DDD0]">
            <div className="flex items-center justify-between text-[#787469] mb-1">
              <span className="text-[11px] font-medium">Audit History</span>
              <History size={14} className="text-[#5D6454]" />
            </div>
            <p className="text-2xl font-serif text-[#2F2D29] font-semibold">
              {recentAccess.length}
            </p>
            <span className="text-[10px] text-[#787469]">Recent access events</span>
          </div>

          <div className="p-3 bg-[#F4EFE6] rounded-xl border border-[#E5DDD0]">
            <div className="flex items-center justify-between text-[#787469] mb-1">
              <span className="text-[11px] font-medium">Registry Status</span>
              <CheckCircle2 size={14} className="text-[#4E7737]" />
            </div>
            <p className="text-sm font-semibold text-[#2F2D29] mt-2">Active</p>
            <span className="text-[10px] text-[#4E7737]">Good standing (TNMC)</span>
          </div>
        </div>
      </div>

      {/* Prominent Action: Find Patient */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-semibold text-[#2F2D29] flex items-center gap-2">
              <Search size={18} className="text-[#5D6454]" />
              Find Patient
            </h2>
            <p className="text-xs text-[#787469]">
              Search by Patient ID, Full Name, or Registered Email.
            </p>
          </div>
          <span className="text-[11px] text-[#8C877C] hidden sm:inline font-mono">
            Demo query: "PAT-9082" or "Ananya"
          </span>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3.5 text-[#A0988A]" />
            <input
              type="text"
              placeholder="Search patient by ID (e.g. PAT-9082), Name, or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#DED2C0] rounded-xl text-sm text-[#2F2D29] placeholder-[#A0988A] focus:outline-none focus:ring-2 focus:ring-[#5D6454]/25 focus:border-[#5D6454] transition-colors"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            variant="primary"
            disabled={searching || !searchQuery.trim()}
            className="shrink-0"
          >
            {searching ? 'Searching…' : 'Search Patient'}
          </Button>
        </form>

        {/* Search Results Display */}
        {hasSearched && (
          <div className="mt-4 space-y-3">
            {searchResults.length === 0 ? (
              <div className="p-6 bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl text-center text-xs text-[#787469]">
                No patients found matching "{searchQuery}". Try searching for <strong className="text-[#2F2D29]">PAT-9082</strong> or <strong className="text-[#2F2D29]">Ananya</strong>.
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-[#787469] font-medium">
                  Found {searchResults.length} matching patient{searchResults.length > 1 ? 's' : ''}:
                </p>
                {searchResults.map((patient) => {
                  const isAccepted = patient.consentStatus === 'Accepted';
                  const isPending = patient.consentStatus === 'Pending';
                  const isRejected = patient.consentStatus === 'Rejected';
                  const isRevoked = patient.consentStatus === 'Revoked';

                  return (
                    <div
                      key={patient.id}
                      className="p-5 bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-serif font-semibold text-[#2F2D29] text-base">
                            {patient.name}
                          </h3>
                          <span className="font-mono text-xs text-[#787469]">
                            {patient.id}
                          </span>
                          {/* Consent Status Badge */}
                          {isAccepted ? (
                            <span className="px-2 py-0.5 bg-[#EFF4EA] border border-[#C5D9B4] text-[#345124] rounded text-[10px] font-semibold">
                              Access Granted
                            </span>
                          ) : isPending ? (
                            <span className="px-2 py-0.5 bg-[#FBF1E2] border border-[#EAD7B0] text-[#865F1D] rounded text-[10px] font-semibold">
                              Pending Patient Approval
                            </span>
                          ) : isRejected ? (
                            <span className="px-2 py-0.5 bg-[#FDF2F0] border border-[#F3C4BE] text-[#9A2D23] rounded text-[10px] font-semibold">
                              Access Denied
                            </span>
                          ) : isRevoked ? (
                            <span className="px-2 py-0.5 bg-[#FDF2F0] border border-[#F3C4BE] text-[#9A2D23] rounded text-[10px] font-semibold">
                              Consent Revoked
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-[#EEE8DC] border border-[#DED2C0] text-[#787469] rounded text-[10px] font-semibold">
                              Consent Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#686358]">
                          {patient.gender}, {patient.age} yrs • DOB: {patient.dob} • {patient.city} • ABHA: {patient.abhaId || '—'}
                        </p>
                        <p className="text-[11px] text-[#8C877C]">
                          Primary Hospital: {patient.primaryHospital} • Last visit: {patient.lastVisit}
                        </p>
                      </div>

                      {/* Action Button: Strictly Enforced */}
                      <div className="shrink-0">
                        {isAccepted ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                            icon={FileText}
                          >
                            View Records
                          </Button>
                        ) : isPending ? (
                          <div className="flex items-center gap-2 text-xs text-[#865F1D] bg-[#FBF1E2] border border-[#EAD7B0] px-3 py-1.5 rounded-lg">
                            <Clock size={14} />
                            <span>Pending Patient Approval</span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => setConsentModalPatient(patient)}
                            icon={ShieldCheck}
                          >
                            Request Access
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Two Column Layout: Active Consents & Pending Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Active Patients with Access */}
        <section className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DDD0] mb-4">
              <h2 className="text-base font-serif font-semibold text-[#2F2D29] flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#5D6454]" />
                Active Patient Access ({activeConsents.length})
              </h2>
              <button
                onClick={() => navigate('/doctor/consent-requests')}
                className="text-xs text-[#5D6454] hover:underline font-medium"
              >
                View all
              </button>
            </div>

            {loading ? (
              <p className="text-xs text-[#8C877C] py-4 text-center">Loading active permissions…</p>
            ) : activeConsents.length === 0 ? (
              <div className="p-4 bg-[#F4EFE6] rounded-xl border border-[#E5DDD0] text-xs text-[#787469] text-center">
                No active patient consents right now. Use "Find Patient" to request record access.
              </div>
            ) : (
              <div className="space-y-3">
                {activeConsents.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-white border border-[#E5DDD0] rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#2F2D29]">{item.patientName}</span>
                        <span className="font-mono text-[10px] text-[#787469]">{item.patientId}</span>
                      </div>
                      <p className="text-[11px] text-[#686358] mt-0.5">{item.purpose}</p>
                      <span className="text-[10px] text-[#5D6454] font-medium block mt-1">
                        Valid till {item.expiryDate || '30 Days'}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => navigate(`/doctor/patients/${item.patientId}`)}
                      icon={FileText}
                    >
                      View Records
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Pending Consent Requests */}
        <section className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DDD0] mb-4">
              <h2 className="text-base font-serif font-semibold text-[#2F2D29] flex items-center gap-2">
                <Clock size={16} className="text-[#865F1D]" />
                Pending Patient Requests ({pendingRequests.length})
              </h2>
              <button
                onClick={() => navigate('/doctor/consent-requests')}
                className="text-xs text-[#865F1D] hover:underline font-medium"
              >
                View all
              </button>
            </div>

            {loading ? (
              <p className="text-xs text-[#8C877C] py-4 text-center">Checking pending requests…</p>
            ) : pendingRequests.length === 0 ? (
              <div className="p-4 bg-[#F4EFE6] rounded-xl border border-[#E5DDD0] text-xs text-[#787469] text-center">
                No requests currently awaiting patient approval.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-white border border-[#EAD7B0] rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#2F2D29]">{item.patientName}</span>
                        <span className="font-mono text-[10px] text-[#787469]">{item.patientId}</span>
                      </div>
                      <p className="text-[11px] text-[#686358] mt-0.5">{item.purpose}</p>
                      <span className="text-[10px] text-[#865F1D] font-mono mt-1 block">
                        Status: Pending Patient Approval
                      </span>
                    </div>

                    <div className="px-2.5 py-1 bg-[#FBF1E2] text-[#865F1D] text-[10px] font-semibold rounded border border-[#EAD7B0]">
                      Awaiting Patient
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Recent Access History Snapshot */}
      <section className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DDD0] mb-4">
          <div>
            <h2 className="text-base font-serif font-semibold text-[#2F2D29] flex items-center gap-2">
              <History size={16} className="text-[#5D6454]" />
              Recent Record Accesses
            </h2>
            <p className="text-xs text-[#787469]">Logged for compliance and patient audit access.</p>
          </div>
          <button
            onClick={() => navigate('/doctor/access-history')}
            className="text-xs text-[#5D6454] hover:underline font-medium"
          >
            Full History →
          </button>
        </div>

        {recentAccess.length === 0 ? (
          <p className="text-xs text-[#8C877C] py-4 text-center">No record access events logged yet.</p>
        ) : (
          <div className="divide-y divide-[#E5DDD0] text-xs">
            {recentAccess.map((entry) => (
              <div key={entry.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#2F2D29]">{entry.patientName}</span>
                  <span className="text-[#787469] ml-2">({entry.recordTitle})</span>
                  <span className="text-[10px] text-[#8C877C] block">{entry.hospital} • {entry.reason}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-[#5D6454] font-medium bg-[#EFF4EA] px-2 py-0.5 rounded border border-[#C5D9B4]">
                    {entry.accessStatus}
                  </span>
                  <span className="text-[10px] text-[#8C877C] block mt-0.5">{entry.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Request Consent Modal */}
      <RequestConsentModal
        isOpen={!!consentModalPatient}
        onClose={() => setConsentModalPatient(null)}
        patient={consentModalPatient}
        onConsentRequested={handleConsentRequested}
      />
    </div>
  );
};
