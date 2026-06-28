import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Search,
  RefreshCcw,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
  MoreVertical,
  Filter,
  Send,
  User,
  Shield,
  CornerDownRight,
  ArrowUpRight,
  Lock,
  MessageCircle
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';

import { api } from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';

const MotionTableRow = motion(TableRow as any);

interface TicketReply {
  id: string;
  message: string;
  userId: string;
  createdAt: string;
  user: { fullName: string; role: string };
}

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  userId: string;
  user: { fullName: string; email: string };
  replies: TicketReply[];
}

export default function AdminTicketsPage() {
  const { t, i18n } = useTranslation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const fetchTickets = useCallback(async (silent = false) => {
    if (silent) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/admin/tickets');
      setTickets(res.data?.data || []);
    } catch {
      toast.error(t('Admin.ticketsPage.toast.fetchError'));
      setTickets([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const term = searchTerm.toLowerCase();
      return t.subject.toLowerCase().includes(term) || t.user.fullName.toLowerCase().includes(term) || t.id.toLowerCase().includes(term);
    });
  }, [tickets, searchTerm]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge className="bg-blue-50 text-blue-600 border-blue-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{t(`Admin.ticketsPage.status.${status}`)}</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-amber-50 text-amber-600 border-amber-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{t(`Admin.ticketsPage.status.${status}`)}</Badge>;
      case 'CLOSED':
        return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{t(`Admin.ticketsPage.status.${status}`)}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <Badge className="bg-red-500 text-white border-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">{t(`Admin.ticketsPage.priority.${priority}`)}</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-amber-400 text-white border-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">{t(`Admin.ticketsPage.priority.${priority}`)}</Badge>;
      case 'LOW':
        return <Badge className="bg-gray-100 text-gray-500 border-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">{t(`Admin.ticketsPage.priority.${priority}`)}</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in space-y-6 duration-500">
      {/* Search & Actions Panel */}
      <div className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="group relative flex-1">
          <Search className="pointer-events-none absolute start-4 top-1/2 size-[18px] -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[color:var(--color-primary)]" />
          <Input
            type="search"
            placeholder={t('Admin.common.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 rounded-2xl border-gray-100 bg-gray-50/50 ps-11 pe-4 text-sm focus:ring-2 focus:ring-[color:var(--color-primary-soft)] transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-12 w-12 rounded-2xl border-gray-100 bg-gray-50/50 text-gray-500"
            onClick={() => void fetchTickets(true)}
          >
            <RefreshCcw className={isRefreshing ? 'animate-spin' : ''} size={18} />
          </Button>
          <Button variant="outline" className="h-12 rounded-2xl border-gray-100 bg-gray-50/50 px-5 text-gray-600 font-bold">
            <Filter size={16} className="me-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Tickets Table */}
      <section className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 border-none hover:bg-gray-50/50">
              <TableHead className="px-6 py-5 uppercase tracking-widest text-[10px] font-bold text-gray-400">
                {t('Admin.ticketsPage.table.id')}
              </TableHead>
              <TableHead className="px-6 py-5 uppercase tracking-widest text-[10px] font-bold text-gray-400">
                {t('Admin.ticketsPage.table.user')}
              </TableHead>
              <TableHead className="px-6 py-5 uppercase tracking-widest text-[10px] font-bold text-gray-400">
                {t('Admin.ticketsPage.table.subject')}
              </TableHead>
              <TableHead className="px-6 py-5 uppercase tracking-widest text-[10px] font-bold text-gray-400">
                {t('Admin.ticketsPage.table.priority')}
              </TableHead>
              <TableHead className="px-6 py-5 text-center uppercase tracking-widest text-[10px] font-bold text-gray-400">
                {t('Admin.ticketsPage.table.status')}
              </TableHead>
              <TableHead className="px-6 py-5 text-end uppercase tracking-widest text-[10px] font-bold text-gray-400">
                {t('Admin.ticketsPage.table.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {filteredTickets.map((ticket) => (
                <MotionTableRow
                  key={ticket.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="group hover:bg-gray-50/40 transition-colors"
                >
                  <TableCell className="px-6 py-5 font-mono text-[10px] text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-blue-500 transition-colors">
                        <MessageSquare size={14} />
                      </div>
                      #{ticket.id.split('-')[0]}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                          {ticket.user.fullName.charAt(0).toUpperCase()}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 line-clamp-1">{ticket.user.fullName}</span>
                          <span className="text-[10px] font-medium text-gray-400">{ticket.user.email}</span>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5 max-w-[200px]">
                    <div className="flex flex-col gap-1">
                       <span className="text-sm font-semibold text-gray-700 line-clamp-1">{ticket.subject}</span>
                       <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock size={10} />
                          {(() => {
                            const d = parseISO(ticket.createdAt);
                            return isValid(d) ? format(d, 'dd MMM, HH:mm') : 'N/A';
                          })()}
                       </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    {getPriorityBadge(ticket.priority)}
                  </TableCell>
                  <TableCell className="px-6 py-5 text-center">
                    {getStatusBadge(ticket.status)}
                  </TableCell>
                  <TableCell className="px-6 py-5 text-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 rounded-xl px-4 text-xs font-bold text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      {t('Admin.common.view')}
                      <ArrowUpRight size={14} className="ms-1.5" />
                    </Button>
                  </TableCell>
                </MotionTableRow>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </section>

      {/* Ticket Support View Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-4xl overflow-hidden rounded-[2.5rem] border-none p-0 shadow-2xl h-[85vh] flex flex-col">
          {selectedTicket && (
            <TicketSupportView 
              ticket={selectedTicket} 
              onClose={() => setSelectedTicket(null)} 
              onRefresh={() => void fetchTickets(true)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * 💬 Ticket Support View (Conversation UI)
 */
function TicketSupportView({ ticket, onClose, onRefresh }: { ticket: Ticket, onClose: () => void, onRefresh: () => void }) {
  const { t, i18n } = useTranslation();
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [ticket.replies]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || sending) return;

    setSending(true);
    try {
      await api.post(`/admin/tickets/${ticket.id}/reply`, { message: reply });
      toast.success(t('Admin.ticketsPage.toast.replySuccess'));
      setReply('');
      onRefresh();
    } catch {
      toast.error(t('Admin.ticketsPage.toast.error'));
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.patch(`/admin/tickets/${ticket.id}/status`, { status: newStatus });
      toast.success(t('Admin.ticketsPage.toast.updateSuccess'));
      onRefresh();
    } catch {
      toast.error(t('Admin.ticketsPage.toast.error'));
    }
  };

  const isClosed = ticket.status === 'CLOSED';

  return (
    <>
      <DialogHeader className="shrink-0 border-b border-gray-100 bg-gray-50/50 px-8 py-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <MessageCircle size={26} />
              </div>
              <div className="max-w-md">
                <DialogTitle className="text-xl font-bold line-clamp-1">{ticket.subject}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                   {ticket.priority === 'HIGH' && <AlertCircle size={10} className="text-red-500 animate-pulse" />}
                   <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ref: #{ticket.id.split('-')[0]}</p>
                </div>
              </div>
           </div>
           <div className="flex items-center gap-3 me-6">
              <Select value={ticket.status} onValueChange={handleStatusChange}>
                 <SelectTrigger className="h-10 w-40 rounded-xl border-gray-100 bg-white font-bold text-xs shadow-sm">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                    <SelectItem value="OPEN" className="text-blue-600 font-bold">{t('Admin.ticketsPage.status.OPEN')}</SelectItem>
                    <SelectItem value="IN_PROGRESS" className="text-amber-600 font-bold">{t('Admin.ticketsPage.status.IN_PROGRESS')}</SelectItem>
                    <SelectItem value="CLOSED" className="text-emerald-600 font-bold">{t('Admin.ticketsPage.status.CLOSED')}</SelectItem>
                 </SelectContent>
              </Select>
           </div>
        </div>
      </DialogHeader>

      {/* Conversation Thread */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-white"
      >
         {/* Initial Message */}
         <div className="flex gap-4 group">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 shrink-0 flex items-center justify-center border border-gray-100">
               <User size={18} className="text-gray-400" />
            </div>
            <div className="space-y-2 max-w-[80%]">
               <div className="flex items-baseline gap-2">
                  <span className="text-xs font-black text-gray-900">{ticket.user.fullName}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter italic">@{ticket.user.email.split('@')[0]}</span>
               </div>
               <div className="p-5 rounded-3xl rounded-tl-none bg-gray-50 border border-gray-100 text-sm text-gray-700 leading-relaxed shadow-sm">
                  {ticket.message}
               </div>
               <span className="text-[10px] font-bold text-gray-300 ps-1">
                  {(() => {
                    const d = parseISO(ticket.createdAt);
                    return isValid(d) ? format(d, 'dd MMM, HH:mm') : 'N/A';
                  })()}
               </span>
            </div>
         </div>

         {/* Replies Loop */}
         {ticket.replies.map((reply) => {
           const isAdmin = reply.user.role === 'ADMIN' || reply.user.role === 'SUPER_ADMIN';
           return (
             <div key={reply.id} className={`flex gap-4 ${isAdmin ? 'flex-row-reverse' : ''} animate-slide-up`}>
                <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center border ${isAdmin ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                   {isAdmin ? <Shield size={18} className="text-blue-500" /> : <User size={18} className="text-gray-400" />}
                </div>
                <div className={`space-y-2 max-w-[80%] ${isAdmin ? 'items-end flex flex-col' : ''}`}>
                   <div className="flex items-baseline gap-2">
                      <span className="text-xs font-black text-gray-900">{reply.user.fullName}</span>
                      {isAdmin && <Badge variant="outline" className="text-[8px] h-4 py-0 border-blue-200 text-blue-500 font-black">STAFF</Badge>}
                   </div>
                   <div className={`p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${
                     isAdmin 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-gray-50 text-gray-700 border border-gray-100 rounded-tl-none'
                   }`}>
                      {reply.message}
                   </div>
                   <span className="text-[10px] font-bold text-gray-300 px-1">
                      {(() => {
                        const d = parseISO(reply.createdAt);
                        return isValid(d) ? format(d, 'dd MMM, HH:mm') : 'N/A';
                      })()}
                   </span>
                </div>
             </div>
           );
         })}
      </div>

      {/* Reply Action Area */}
      <div className="shrink-0 border-t border-gray-100 bg-gray-50/50 p-6 lg:p-8">
         <form onSubmit={handleSend} className="relative">
            {isClosed && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-sm">
                 <div className="flex items-center gap-2 text-gray-400 font-bold italic text-sm">
                    <Lock size={16} />
                    {t('Admin.ticketsPage.detail.closedMessage')}
                 </div>
              </div>
            )}
            <Textarea 
              disabled={isClosed || sending}
              placeholder={t('Admin.ticketsPage.detail.replyPlaceholder')}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="min-h-[100px] resize-none rounded-3xl border-none bg-white p-5 pr-16 shadow-inner text-sm focus-visible:ring-blue-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend(e as any);
                }
              }}
            />
            <Button 
              disabled={isClosed || sending || !reply.trim()}
              type="submit" 
              className="absolute end-4 bottom-4 h-11 w-11 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200"
            >
               {sending ? <RefreshCcw className="animate-spin" size={18} /> : <Send size={18} />}
            </Button>
         </form>
         <div className="mt-3 flex items-center gap-4 ms-2">
             <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <CornerDownRight size={12} className="text-blue-500" />
                Press Enter to Send
             </div>
         </div>
      </div>
    </>
  );
}
