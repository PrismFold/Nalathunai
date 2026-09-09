import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { notificationService } from '../services/notificationService';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ShieldAlert, FileText, Clock, ExternalLink } from 'lucide-react';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotifications(); }, []);

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    await loadNotifications();
  };

  const handleItemClick = async (notif) => {
    await notificationService.markAsRead(notif.id);
    await loadNotifications();
    if (notif.link) navigate(notif.link);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const iconFor = (type) => {
    if (type === 'request') return ShieldAlert;
    if (type === 'warning') return Clock;
    return FileText;
  };

  const iconBg = (type) => {
    if (type === 'request') return 'bg-[#FBF1E2] text-[#865F1D]';
    if (type === 'warning') return 'bg-[#F7EBE8] text-[#933D33]';
    return 'bg-[#EFEAE2] text-[#4B4A3F]';
  };

  return (
    <div className="space-y-7 max-w-3xl">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5DDD0] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#5D6454]" />
            <p className="text-[11px] uppercase tracking-widest text-[#787469] font-mono font-medium">
              System Dispatches
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#2F2D29] tracking-tight flex items-center gap-2.5">
            Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 bg-[#A84236] text-[#F7F3EA] rounded-full text-[10px] font-mono font-bold">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-xs text-[#686358] mt-1 font-light">
            Updates on consent requests, record retrievals, and access events.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleMarkAllRead} icon={CheckCheck}>
          Mark All Read
        </Button>
      </div>

      <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(47,45,41,0.03)]">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#8C877C]">Loading notifications…</div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell size={28} className="mx-auto text-[#DED2C0] mb-3" strokeWidth={1.5} />
            <p className="text-sm font-serif font-normal text-[#2F2D29]">No notifications</p>
            <p className="text-xs text-[#8C877C] mt-1 font-light">You're all caught up with your dispatches.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#EFEAE0]">
            {notifications.map((n) => {
              const Icon = iconFor(n.type);
              const bgClass = iconBg(n.type);
              return (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-4 sm:p-5 hover:bg-[#F4EFE6] cursor-pointer transition-colors flex items-start gap-4 ${
                    !n.read ? 'border-l-2 border-[#2F2D29]' : ''
                  }`}
                >
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${bgClass}`}>
                    <Icon size={16} strokeWidth={1.75} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm font-serif font-semibold ${!n.read ? 'text-[#2F2D29]' : 'text-[#686358]'}`}>
                        {n.title}
                      </h3>
                      <span className="text-[10px] font-mono text-[#8C877C] whitespace-nowrap shrink-0">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-[#686358] font-light mt-1 leading-relaxed">{n.message}</p>
                    {n.link && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2F2D29] mt-2 underline underline-offset-4 decoration-[#DED2C0] hover:text-[#5D6454]">
                        Take action <ExternalLink size={11} />
                      </span>
                    )}
                  </div>

                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-[#A84236] mt-1.5 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
