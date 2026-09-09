import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, ExternalLink, ShieldAlert, FileText, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';

export const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    const data = await notificationService.getNotifications();
    setNotifications(data);
  };

  useEffect(() => { loadNotifications(); }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notification) => {
    await notificationService.markAsRead(notification.id);
    await loadNotifications();
    setIsOpen(false);
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    await loadNotifications();
  };

  const iconFor = (type) => {
    if (type === 'request') return <ShieldAlert size={14} strokeWidth={1.75} />;
    if (type === 'warning') return <Clock size={14} strokeWidth={1.75} />;
    return <FileText size={14} strokeWidth={1.75} />;
  };

  const iconBg = (type) => {
    if (type === 'request') return 'bg-[#FBF1E2] text-[#865F1D]';
    if (type === 'warning') return 'bg-[#F7EBE8] text-[#933D33]';
    return 'bg-[#EFEAE2] text-[#4B4A3F]';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className="relative p-2 text-[#686358] hover:text-[#2F2D29] hover:bg-[#EFEAE0] rounded-lg transition-colors"
      >
        <Bell size={18} strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#A84236] rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#FAF7F2] rounded-xl shadow-lg border border-[#E5DDD0] z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAE3D5]">
            <div className="flex items-center gap-2">
              <span className="font-serif font-semibold text-[#2F2D29] text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold text-[#5D6454] bg-[#ECEFE6] border border-[#CFDCB8] px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#787469] hover:text-[#2F2D29] font-medium flex items-center gap-1 transition-colors"
              >
                <CheckCheck size={13} strokeWidth={1.75} />
                Mark read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-[#EFEAE0]">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8C877C]">No notifications.</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`px-4 py-3 hover:bg-[#F2ECE0] cursor-pointer transition-colors flex items-start gap-3 ${
                    !n.read ? 'border-l-2 border-[#2F2D29]' : ''
                  }`}
                >
                  <div className={`p-1.5 rounded-md shrink-0 ${iconBg(n.type)}`}>
                    {iconFor(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-xs font-semibold truncate ${!n.read ? 'text-[#2F2D29]' : 'text-[#686358]'}`}>
                        {n.title}
                      </h4>
                      {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-[#A84236] mt-1 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-[#787469] line-clamp-2 mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-[#A39E92] mt-0.5 block">{n.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-[#EAE3D5] bg-[#F4EFE6]">
            <button
              onClick={() => { setIsOpen(false); navigate('/notifications'); }}
              className="text-xs font-medium text-[#2F2D29] hover:underline inline-flex items-center gap-1"
            >
              View all <ExternalLink size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
