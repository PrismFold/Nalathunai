import React, { useState, useEffect } from 'react';
import { auditService } from '../../services/auditService';
import {
  History,
  ShieldCheck,
  ShieldAlert,
  Search,
  Lock,
  Building2,
  Calendar,
  Filter,
} from 'lucide-react';

export const DoctorAccessHistoryPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const history = await auditService.getAccessHistory();
        setLogs(history);
      } catch (e) {
        console.error('Failed to load audit history:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (!searchTerm) return true;
    const clean = searchTerm.toLowerCase();
    return (
      l.patientName?.toLowerCase().includes(clean) ||
      l.patientId?.toLowerCase().includes(clean) ||
      l.recordTitle?.toLowerCase().includes(clean) ||
      l.hospital?.toLowerCase().includes(clean)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-[#E5DDD0] pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-[#5D6454]" />
          <p className="text-[11px] uppercase tracking-widest text-[#787469] font-mono font-medium">
            Compliance &amp; Audit Trail
          </p>
        </div>
        <h1 className="text-3xl font-serif font-normal text-[#2F2D29] tracking-tight">
          Access History
        </h1>
        <p className="text-xs text-[#686358] mt-1">
          Complete transparent audit trail of all patient clinical record accesses, consent references, and queries performed by your practitioner account.
        </p>
      </div>

      {/* Security note banner */}
      <div className="p-4 bg-[#EFF4EA] border border-[#C5D9B4] rounded-xl flex items-center gap-3 text-xs text-[#345124]">
        <Lock size={18} className="text-[#4E7737] shrink-0" strokeWidth={1.75} />
        <div>
          <span className="font-semibold">Immutable Access Record: </span>
          <span>
            Every record view is cryptographically tracked and accessible to both doctor and patient to prevent unauthorized access.
          </span>
        </div>
      </div>

      {/* Search / Filter */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-3 text-[#A0988A]" />
        <input
          type="text"
          placeholder="Filter by patient, record, or hospital..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2 bg-[#FAF7F2] border border-[#DED2C0] rounded-lg text-xs text-[#2F2D29] placeholder-[#A0988A] focus:outline-none focus:ring-2 focus:ring-[#5D6454]/25 focus:border-[#5D6454]"
        />
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#8C877C]">
            Loading audit trail…
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#787469]">
            No access history records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4EFE6] border-b border-[#E5DDD0] text-[10px] font-mono uppercase text-[#7D786D] tracking-wider">
                  <th className="py-3 px-4 font-semibold">Patient</th>
                  <th className="py-3 px-4 font-semibold">Record Accessed</th>
                  <th className="py-3 px-4 font-semibold">Hospital / Facility</th>
                  <th className="py-3 px-4 font-semibold">Date &amp; Time</th>
                  <th className="py-3 px-4 font-semibold">Access Status</th>
                  <th className="py-3 px-4 font-semibold">Consent Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DDD0]">
                {filteredLogs.map((entry) => {
                  const isBlocked = entry.accessStatus?.toLowerCase().includes('denied') || entry.accessStatus?.toLowerCase().includes('restricted');

                  return (
                    <tr key={entry.id} className="hover:bg-[#F9F6F0] transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#2F2D29]">
                        <div>{entry.patientName}</div>
                        <span className="font-mono text-[10px] text-[#787469]">{entry.patientId}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#2F2D29]">
                        <div className="font-medium">{entry.recordTitle}</div>
                        <span className="text-[10px] text-[#787469]">{entry.reason}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#686358]">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={13} className="text-[#8C877C]" />
                          <span>{entry.hospital}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#787469] font-mono text-[11px] whitespace-nowrap">
                        {entry.timestamp}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            isBlocked
                              ? 'bg-[#FDF2F0] text-[#9A2D23] border border-[#F3C4BE]'
                              : 'bg-[#EFF4EA] text-[#345124] border border-[#C5D9B4]'
                          }`}
                        >
                          {isBlocked ? <ShieldAlert size={10} /> : <ShieldCheck size={10} />}
                          <span>{entry.accessStatus}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#5D6454]">
                        {entry.consentId || 'NONE'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
