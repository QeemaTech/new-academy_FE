import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Headphones, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Skeleton } from '../../components/ui/skeleton';
import { cn } from '../../lib/cn';

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  replies: Array<{ id: string; message: string; createdAt: string; user: { fullName: string; role: string } }>;
};

export default function ParentSupport() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['parent', 'tickets'],
    queryFn: async () => {
      const res = await api.get<{ data: { tickets: Ticket[] } }>('/parent/tickets');
      return res.data.data.tickets;
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      await api.post('/parent/tickets', { subject, message, priority: 'MEDIUM' });
    },
    onSuccess: async () => {
      toast.success(t('Parent.support.created'));
      setOpen(false);
      setSubject('');
      setMessage('');
      await qc.invalidateQueries({ queryKey: ['parent', 'tickets'] });
    },
    onError: () => {
      toast.error(t('Common.error'));
    },
  });

  if (isLoading) {
    return <Skeleton className="h-64 rounded-2xl" />;
  }

  const tickets = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">{t('Parent.support.title')}</h1>
          <p className="mt-1 font-medium text-slate-500">{t('Parent.support.subtitle')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-[#4178EF] font-bold shadow-lg shadow-[#4178EF]/25 hover:bg-[#3264D6]">
              <Plus className="me-2 h-4 w-4" />
              {t('Parent.support.newTicket')}
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-black">{t('Parent.support.dialogTitle')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="subj">{t('Parent.support.subject')}</Label>
                <Input
                  id="subj"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="msg">{t('Parent.support.message')}</Label>
                <Textarea
                  id="msg"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="rounded-xl"
                />
              </div>
              <Button
                className="w-full rounded-xl bg-[#4178EF] font-bold"
                disabled={createMut.isPending}
                onClick={() => createMut.mutate()}
              >
                {t('Parent.support.submit')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
              <Headphones className="h-12 w-12 text-[#4178EF]/40" />
              <p className="text-slate-600">{t('Parent.support.empty')}</p>
            </CardContent>
          </Card>
        ) : (
          tickets.map((tk) => (
            <Card key={tk.id} className="rounded-2xl border-slate-100 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <CardTitle className="text-lg font-black">{tk.subject}</CardTitle>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                      tk.status === 'OPEN'
                        ? 'bg-amber-50 text-amber-800'
                        : tk.status === 'CLOSED'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-sky-50 text-sky-800'
                    )}
                  >
                    {tk.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{new Date(tk.createdAt).toLocaleString()}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{tk.message}</p>
                {tk.replies.length > 0 && (
                  <div className="space-y-2 rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-black uppercase text-slate-400">{t('Parent.support.replies')}</p>
                    {tk.replies.map((r) => (
                      <div key={r.id} className="border-s border-[#4178EF]/30 ps-3 text-sm">
                        <p className="font-bold text-slate-800">{r.user.fullName}</p>
                        <p className="text-slate-600 whitespace-pre-wrap">{r.message}</p>
                        <p className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
