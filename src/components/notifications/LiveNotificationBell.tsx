import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Bell, CheckCheck, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { api } from '../../lib/axios';
import { cn } from '../../lib/cn';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { arEG, enUS } from 'date-fns/locale';

export function LiveNotificationBell({ isStudentView = false }: { isStudentView?: boolean }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const socketRef = useRef<Socket | null>(null);

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

    if (!token) return;

    // Connect to Socket.io
    const baseURL = import.meta.env.VITE_API_URL || window.location.origin;
    const socket = io(baseURL, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('new_notification', (newNotification: any) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((c) => c + 1);

      // Deep Sapphire & Mint Premium Toast
      toast.custom((t) => (
        <div
          className={cn(
            'flex max-w-sm w-full bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl pointer-events-auto ring-1 ring-black/5 overflow-hidden',
            t.visible ? 'animate-enter' : 'animate-leave'
          )}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
              <div className="ms-3 flex-1">
                <p className="text-sm font-bold text-white">
                  {newNotification.title}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {newNotification.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-s border-slate-800">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-e-2xl p-4 flex items-center justify-center text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 focus:outline-none"
            >
              إغلاق
            </button>
          </div>
        </div>
      ));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token]);

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

  const bellClass = isStudentView
    ? 'text-slate-600 bg-white/60 hover:bg-white border-transparent'
    : 'text-white hover:bg-white/10 relative';

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('rounded-[1rem] relative', bellClass)}
          aria-label={t('Admin.shell.notifications', 'الإشعارات')}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 inset-e-1 w-2.5 h-2.5 rounded-full border-2 bg-emerald-500 border-slate-900" />
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
