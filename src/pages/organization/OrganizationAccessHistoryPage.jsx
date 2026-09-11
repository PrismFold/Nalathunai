import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { organizationAuditService } from '../../services/organizationAuditService';
import {
  History,
  Search,
  Filter,
  Download,
  Shield,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Activity,
} from 'lucide-react';

export const OrganizationAccessHistoryPage = () => {
  const { user } = useAuth();
  const orgId = user?.orgId || 'HOSP-PSG-01';
  const orgName = user?.name || 'PSG Institute of Medical Sciences & Research';

  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const all = await organizationAuditService.getAuditLogs(orgId, searchQuery, statusFilter);
      setLogs(all);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [orgId, searchQuery, statusFilter]);

  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert('No logs available to export.');
      return;
    }

    const headers = ['ID', 'Actor', 'Role', 'Patient', 'Action', 'Target Record', 'Timestamp', 'IP Address', 'Status'];
    const rows = logs.map((l) => [
      l.id,
      l.actorName,
      l.actorRole,
      l.patientName,
      l.action,
      l.targetItem,
      l.timestamp,
      l.ipAddress,
      l.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ABDM_Access_Audit_${orgId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2F2D29]">
            Access Audit & Compliance Logs
          </h1>
          <p className="text-xs text-[#787469] mt-0.5">
            Cryptographic access logs complying with ABDM and HIPAA healthcare data integrity principles.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#D5CDBD] text-[#2F2D29] hover:bg-[#EFEAE0] transition-colors text-xs font-medium flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
        >
          <Download size={14} />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-3 text-[#A8A296]" />
            <input
              type="text"
              placeholder="Search by clinician, patient, target item, or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#D5CDBD] rounded-lg text-xs text-[#2F2D29] placeholder-[#A8A296] focus:outline-none"
            />
          </div>

          <div className="w-full md:w-52">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-lg text-xs text-[#2F2D29] focus:outline-none"
            >
              <option value="all">All Access Outcomes</option>
              <option value="Authorized">Authorized Access</option>
              <option value="Pending">Pending Approval</option>
              <option value="Rejected">Rejected / Denied</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4EFE6] border-b border-[#E5DDD0] text-[#787469] uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Timestamp & IP</th>
                <th className="px-5 py-3">Actor / Clinician</th>
                <th className="px-5 py-3">Action & Record</th>
                <th className="px-5 py-3">Patient Context</th>
                <th className="px-5 py-3">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DDD0]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-xs text-[#8C877C]">
                    No audit records found matching the query.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F4EFE6] transition-colors">
                    <td className="px-5 py-4 text-[11px]">
                      <div className="font-semibold text-[#2F2D29]">{log.timestamp}</div>
                      <div className="text-[10px] text-[#8C877C] font-mono">{log.ipAddress}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#2F2D29]">{log.actorName}</div>
                      <div className="text-[10px] text-[#787469]">{log.actorRole}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-[#2F2D29]">{log.action}</div>
                      <div className="text-[11px] text-[#787469] flex items-center gap-1">
                        <FileText size={11} className="text-[#8C877C]" />
                        <span>{log.targetItem}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-[#2F2D29]">{log.patientName}</div>
                      <div className="text-[10px] text-[#8C877C] font-mono">{log.patientId}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          log.status.includes('Authorized') || log.status.includes('Verified')
                            ? 'bg-[#EFF4EA] border-[#C5D9B4] text-[#345124]'
                            : log.status.includes('Pending')
                            ? 'bg-[#FDF8E8] border-[#EADAA4] text-[#8C6D28]'
                            : 'bg-[#FBEBE8] border-[#E4BCB3] text-[#933D33]'
                        }`}
                      >
                        {log.status.includes('Authorized') || log.status.includes('Verified') ? (
                          <CheckCircle2 size={11} />
                        ) : (
                          <AlertTriangle size={11} />
                        )}
                        <span>{log.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
