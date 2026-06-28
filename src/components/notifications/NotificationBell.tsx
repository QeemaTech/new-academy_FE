import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { api } from '../../lib/axios';  
import { cn } from '../../lib/cn';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { arEG, enUS } from 'date-fns/locale';

export function NotificationBell() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      const data = res.data?.data?.notifications || res.data?.notifications || [];
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.isRead).length);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  useEffect(() => {
    void fetchNotifications();
    // In a REST-only scenario, we might poll, but to save resources we just fetch on mount.
    // Real updates happen on refresh or via manual actions.
  }, []);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      try {
        await api.patch(`/notifications/${notification.id}/read`);
        setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)));
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (e) {
        console.error('Failed to mark read', e);
      }
    }

    if (notification.link) {
      navigate(notification.link);
      setOpen(false);
    }
  };

  const locale = i18n.language === 'ar' ? arEG : enUS;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 rounded-lg relative"
          aria-label={t('Admin.shell.notifications', 'الإشعارات')}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 inset-e-2 w-2 h-2 rounded-full border-2 bg-rose-500 border-white/70" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0 rounded-2xl shadow-xl z-50 overflow-hidden border-slate-800 bg-white" align="end">
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-white">{t('Admin.shell.notifications', 'الإشعارات')}</span>
          {unreadCount > 0 && (
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount} {t('Common.new', 'جديد')}
            </span>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm font-medium">
              {t('Admin.shell.noNotifications', 'لا توجد إشعارات حتى الآن')}
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    'p-4 border-b border-slate-100 transition-colors cursor-pointer flex items-start gap-3 relative',
                    !n.isRead ? 'bg-emerald-50/30 hover:bg-emerald-50/50' : 'hover:bg-slate-50'
                  )}
                >
                  {/* Unread Indicator */}
                  {!n.isRead && (
                    <span className="absolute top-5 inset-s-2 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  )}
                  
                  <div className={cn("flex-1 min-w-0", !n.isRead ? "ms-3" : "")}>
                    <h4 className={cn("text-sm truncate", !n.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-700")}>
                      {n.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
