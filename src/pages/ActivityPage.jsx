import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { activityService } from '../services/activityService';
import {
  History,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  Eye,
  DownloadCloud,
} from 'lucide-react';

const typeIcons = {
  consent: ShieldCheck,
  record:  FileCheck,
  view:    Eye,
  request: DownloadCloud,
};

const typeColors = {
  consent: 'bg-[#ECEFE6] text-[#425938]',
  record:  'bg-[#EAF1F0] text-[#305F63]',
  view:    'bg-[#EFEAE2] text-[#686358]',
  request: 'bg-[#FBF1E2] text-[#865F1D]',
};

const dotColors = {
  consent: 'bg-[#425938]',
  record:  'bg-[#305F63]',
  view:    'bg-[#A7AA91]',
  request: 'bg-[#865F1D]',
};

export const ActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await activityService.getActivityLog();
        setActivities(data);
      } catch (err) {
        console.error('Failed to load activity log:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filters = ['All', 'Consent', 'Record', 'View', 'Request'];

  const filteredActivities = activities.filter((act) => {
    if (filterType === 'All') return true;
    return act.type === filterType.toLowerCase();
  });

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5DDD0] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#5D6454]" />
            <p className="text-[11px] uppercase tracking-widest text-[#787469] font-mono font-medium">
              Audit &amp; Security Trail
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#2F2D29] tracking-tight">Audit &amp; Activity Trail</h1>
          <p className="text-xs text-[#686358] mt-1 font-light">
            A tamper-evident log of every record view, consent grant, and access event.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex gap-1 bg-[#F4EFE6] border border-[#DED2C0] p-1 rounded-xl self-start sm:self-auto">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filterType === f
                  ? 'bg-[#2F2D29] text-[#F7F3EA] shadow-xs'
                  : 'text-[#686358] hover:text-[#2F2D29]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <Card className="p-6">
        {loading ? (
          <div className="py-10 text-center text-xs text-[#8C877C]">Loading audit history…</div>
        ) : filteredActivities.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#8C877C]">No events found for this filter.</div>
        ) : (
          <div className="relative pl-8 space-y-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-px before:bg-[#E5DDD0]">
            {filteredActivities.map((act) => {
              const IconComp = typeIcons[act.type] || History;
              const iconColor = typeColors[act.type] || 'bg-[#EFEAE2] text-[#686358]';
              const dotColor = dotColors[act.type] || 'bg-[#A7AA91]';
              return (
                <div key={act.id} className="relative">
                  {/* Timeline dot */}
                  <div className={`absolute -left-8 top-1.5 w-7 h-7 rounded-full ${iconColor} border-2 border-[#FAF7F2] flex items-center justify-center shadow-xs`}>
                    <IconComp size={12} strokeWidth={1.75} />
                  </div>

                  <div className="bg-[#F4EFE6] hover:bg-[#EFE9DC] p-4.5 rounded-xl border border-[#E8E1D4] transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <h3 className="font-serif font-semibold text-[#2F2D29] text-sm">{act.title}</h3>
                      <span className="text-[11px] font-mono text-[#8C877C]">{act.timestamp}</span>
                    </div>
                    <p className="text-xs text-[#686358] font-light leading-relaxed">{act.description}</p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                      <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#787469]">
                        {act.type}
                      </span>
                      <span className="text-[10px] text-[#A7AA91] font-mono">#{act.id}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
