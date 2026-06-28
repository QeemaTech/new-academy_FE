import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { AxiosError } from 'axios';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  ShieldAlert,
  Key,
  User as UserIcon,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Loader2,
  ShieldCheck,
  Lock as LockIcon,
  Shield,
  UserPlus,
  Route,
  FileDown,
} from 'lucide-react';

import { api } from '../../lib/axios';
import type { StoredUser } from '../../types/academy';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { ArticleDialog } from '../../components/admin/cms/ArticleDialog';
import { TeacherTracksDialog } from '../../components/admin/users/TeacherTracksDialog';
import { TeacherPerformanceDialog } from '../../components/admin/users/TeacherPerformanceDialog';
import { Skeleton } from '../../components/ui/skeleton';

// --- Types ---

type UserRole = 'ADMIN' | 'STAFF' | 'PARENT' | 'CHILD' | 'TEACHER';
type ParentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

interface CustomRoleRef {
  id: string;
  name: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  parent?: {
    id: string;
    status: ParentStatus;
  } | null;
  customRole?: CustomRoleRef | null;
}

const MotionTableRow = motion(TableRow);

function readApiError(e: unknown): string {
  const ax = e as AxiosError<{ error?: string; message?: string }>;
  const d = ax.response?.data;
  return d?.error || d?.message || (e instanceof Error ? e.message : 'Request failed');
}

function normalizeParentStatus(s: string | undefined): ParentStatus {
  const u = String(s ?? 'APPROVED').toUpperCase();
  if (u === 'PENDING' || u === 'APPROVED' || u === 'REJECTED' || u === 'SUSPENDED') return u;
  return 'APPROVED';
}

function normalizeApiUser(raw: Record<string, unknown>): AdminUser {
  const r = String(raw.role ?? '').toUpperCase();
  let role: UserRole;
  if (r === 'ADMIN' || r === 'SUPER_ADMIN') role = 'ADMIN';
  else if (r === 'STAFF') role = 'STAFF';
  else if (r === 'PARENT' || r === 'VENDOR') role = 'PARENT';
  else if (r === 'CHILD' || r === 'STUDENT' || r === 'CUSTOMER') role = 'CHILD';
  else {
    const lr = String(raw.role ?? '').toLowerCase();
    if (lr === 'admin' || lr === 'super_admin') role = 'ADMIN';
    else if (lr === 'staff') role = 'STAFF';
    else if (lr === 'parent') role = 'PARENT';
    else if (lr === 'teacher') role = 'TEACHER';
    else role = 'CHILD';
  }

  const parentRaw = (raw.parent ?? raw.vendor) as Record<string, unknown> | null | undefined;
  const parentBlock =
    parentRaw && typeof parentRaw === 'object'
      ? { id: String(parentRaw.id ?? ''), status: normalizeParentStatus(String(parentRaw.status)) }
      : null;

  const custom = raw.customRole as Record<string, unknown> | null | undefined;
  const customRole =
    custom && typeof custom === 'object'
      ? { id: String(custom.id ?? ''), name: String(custom.name ?? '') }
      : null;

  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    email: String(raw.email ?? ''),
    role,
    createdAt: raw.createdAt ? String(raw.createdAt) : new Date().toISOString(),
    parent:
      role === 'PARENT'
        ? parentBlock ?? { id: `pe-${String(raw.id)}`, status: 'APPROVED' as ParentStatus }
        : null,
    customRole,
  };
}

function pageRoleToStoreRole(r: UserRole): StoredUser['role'] {
  switch (r) {
    case 'ADMIN':
      return 'admin';
    case 'STAFF':
      return 'staff';
    case 'PARENT':
      return 'parent';
    case 'CHILD':
      return 'student';
    case 'TEACHER':
      return 'teacher';
  }
}

// --- Sub-components ---

const StatusBadge: React.FC<{ status?: ParentStatus; role: UserRole }> = ({ status, role }) => {
  const { t } = useTranslation();
  if (role !== 'PARENT' || !status) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-100 bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
        <CheckCircle size={12} />
        {t('Admin.usersPage.statuses.APPROVED')}
      </span>
    );
  }

  const styles: Record<ParentStatus, string> = {
    PENDING: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    APPROVED: 'bg-green-50 text-green-600 border-green-100',
    REJECTED: 'bg-red-50 text-red-600 border-red-100',
    SUSPENDED: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const icons: Record<ParentStatus, React.ReactNode> = {
    PENDING: <Clock size={12} />,
    APPROVED: <CheckCircle size={12} />,
    REJECTED: <XCircle size={12} />,
    SUSPENDED: <Ban size={12} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}
    >
      {icons[status]}
      {t(`Admin.usersPage.statuses.${status}`)}
    </span>
  );
};

const RoleBadge: React.FC<{ role: UserRole; customRoleName?: string }> = ({ role, customRoleName }) => {
  const { t } = useTranslation();
  const styles: Record<UserRole, string> = {
    CHILD: 'border-blue-100 bg-blue-50 text-blue-600',
    TEACHER: 'border-emerald-100 bg-emerald-50 text-emerald-600',
  };

  if (role === 'STAFF' && customRoleName) {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter ${styles.STAFF}`}
        >
          <Shield size={10} />
          {t('Admin.usersPage.roles.STAFF')}
        </span>
        <span className="inline-flex items-center rounded border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
          {customRoleName}
        </span>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter ${styles[role]}`}
    >
      {t(`Admin.usersPage.roles.${role}`)}
    </span>
  );
};

const UsersTableSkeleton = () => (
  <div className="animate-fade-in space-y-6">
    <Skeleton className="h-16 w-full rounded-2xl" />
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-8 border-b border-gray-50 px-6 py-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-3 flex-1 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
      ))}
    </div>
  </div>
);

function RowActions({
  onEdit,
  onPassword,
  manageLabel,
  passwordLabel,
  role,
  onTracks,
  onPerformance,
}: {
  onEdit: () => void;
  onPassword: () => void;
  manageLabel: string;
  passwordLabel: string;
  role: UserRole;
  onTracks?: () => void;
  onPerformance?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:bg-gray-100 hover:text-gray-600 data-[state=open]:bg-[color:var(--color-primary-soft)] data-[state=open]:text-[color:var(--color-primary)]"
          aria-label={manageLabel}
        >
          <MoreVertical size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={onEdit}
          className="text-gray-600 focus:bg-[color:var(--color-primary-soft)] focus:text-[color:var(--color-primary)]"
        >
          <Edit2 size={14} className="text-gray-400" />
          <span className="font-semibold">{manageLabel}</span>
        </DropdownMenuItem>

        {role === 'TEACHER' && (
          <>
            <DropdownMenuItem
              onClick={onTracks}
              className="text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
            >
              <Route size={14} className="text-emerald-400" />
              <span className="font-semibold">{t('Admin.usersPage.manageTracks')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onPerformance}
              className="text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
            >
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="font-semibold">{t('Admin.usersPage.viewPerformance')}</span>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuItem onClick={onPassword} className="text-gray-600 focus:bg-yellow-50 focus:text-yellow-800">
          <Key size={14} className="text-gray-400" />
          <span className="font-semibold">{passwordLabel}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// --- Page ---

export default function AdminUsersPage() {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ParentStatus>('all');

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTracksDialogOpen, setIsTracksDialogOpen] = useState(false);
  const [isPerformanceDialogOpen, setIsPerformanceDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      const raw = response.data?.data?.users ?? response.data?.users ?? response.data?.data ?? response.data;
      const arr = Array.isArray(raw) ? raw : [];
      setUsers(arr.map((row: Record<string, unknown>) => normalizeApiUser(row)));
    } catch {
      toast.error(t('Admin.usersPage.toast.fetchError'));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await api.get('/admin/users/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `users-export-${date}.xlsx`;
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(t('Admin.usersPage.toast.exportSuccess', { defaultValue: 'تم تصدير البيانات بنجاح' }));
    } catch (e) {
      toast.error(t('Admin.usersPage.toast.exportError', { defaultValue: 'حدث خطأ أثناء التصدير' }));
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus =
        statusFilter === 'all' || (user.role === 'PARENT' && user.parent?.status === statusFilter);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const avatarRing = (role: UserRole) =>
    role === 'ADMIN'
      ? 'border-red-100 bg-red-50 text-red-600'
      : role === 'STAFF'
        ? 'border-amber-100 bg-amber-50 text-amber-700'
        : role === 'PARENT'
          ? 'border-purple-100 bg-purple-50 text-purple-600'
          : role === 'TEACHER'
            ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
            : 'border-blue-100 bg-blue-50 text-blue-600';

  if (loading) return <UsersTableSkeleton />;

  return (
    <div className="animate-fade-in space-y-6 duration-500">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="group relative flex-1">
          <label className="sr-only">{t('Admin.usersPage.search')}</label>
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[color:var(--color-primary)]"
            aria-hidden
          />
          <Input
            type="search"
            placeholder={t('Admin.usersPage.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 rounded-xl border-gray-200 bg-gray-50 ps-10 pe-3 text-sm focus-visible:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" aria-hidden />
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as 'all' | UserRole)}>
              <SelectTrigger className="h-11 w-[min(100%,200px)] rounded-xl border-gray-200 bg-gray-50 text-sm font-medium lg:w-[200px]">
                <SelectValue placeholder={t('Admin.usersPage.allRoles')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('Admin.usersPage.allRoles')}</SelectItem>
                <SelectItem value="ADMIN">{t('Admin.usersPage.adminsOnly')}</SelectItem>
                <SelectItem value="STAFF">{t('Admin.usersPage.staffOnly')}</SelectItem>
                <SelectItem value="PARENT">{t('Admin.usersPage.parentsOnly')}</SelectItem>
                <SelectItem value="TEACHER">{t('Admin.usersPage.teachersOnly')}</SelectItem>
                <SelectItem value="CHILD">{t('Admin.usersPage.childrenOnly')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | ParentStatus)}>
            <SelectTrigger className="h-11 w-[min(100%,200px)] rounded-xl border-gray-200 bg-gray-50 text-sm font-medium lg:w-[200px]">
              <SelectValue placeholder={t('Admin.usersPage.allStatuses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('Admin.usersPage.allStatuses')}</SelectItem>
              <SelectItem value="PENDING">{t('Admin.usersPage.statuses.PENDING')}</SelectItem>
              <SelectItem value="APPROVED">{t('Admin.usersPage.statuses.APPROVED')}</SelectItem>
              <SelectItem value="SUSPENDED">{t('Admin.usersPage.statuses.SUSPENDED')}</SelectItem>
              <SelectItem value="REJECTED">{t('Admin.usersPage.statuses.REJECTED')}</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl border-gray-200 bg-gray-50 text-gray-500 hover:text-gray-900"
            title={t('Admin.usersPage.refresh')}
            onClick={() => void fetchUsers()}
          >
            <Loader2 className={loading ? 'animate-spin' : ''} size={18} />
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl px-4 font-bold border-gray-200 bg-gray-50 text-gray-700 hover:bg-white"
            onClick={() => void handleExport()}
            disabled={exporting}
          >
            {exporting ? <Loader2 className="animate-spin" size={16} /> : <FileDown size={16} />}
            {t('Admin.usersPage.exportExcel', { defaultValue: 'تصدير إلى إكسيل' })}
          </Button>

          <Button
            type="button"
            variant="primary"
            className="h-11 rounded-xl px-4 font-bold shadow-md shadow-[color:var(--color-primary-soft)]"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <UserPlus size={16} />
            {t('Admin.usersPage.createUser')}
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table className="rounded-none border-0 bg-transparent shadow-none">
            <TableHeader>
              <TableRow className="border-b border-gray-100 bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.tables.name')}
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.tables.role')}
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.tables.status')}
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.tables.date')}
                </TableHead>
                <TableHead className="px-6 py-4 text-end text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.tables.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50">
              <AnimatePresence>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                          <Users size={28} />
                        </div>
                        <p className="text-base font-bold text-gray-900">{t('Admin.usersPage.emptyTitle')}</p>
                        <p className="text-sm text-gray-500">{t('Admin.usersPage.emptyMessage')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <MotionTableRow
                      key={user.id}
                      layout={false}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group border-gray-50 hover:bg-gray-50/50"
                    >
                      <TableCell className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold shadow-sm ${avatarRing(user.role)}`}
                          >
                            {user.name?.charAt(0) || user.email.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold leading-none text-gray-900">
                              {user.name || '—'}
                            </span>
                            <span className="mt-1 text-xs font-medium text-gray-400">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-6 py-4">
                        <RoleBadge role={user.role} customRoleName={user.customRole?.name} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-6 py-4">
                        <StatusBadge status={user.parent?.status} role={user.role} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString(
                          i18n.language === 'ar' ? 'ar-EG' : 'en-US',
                          { year: 'numeric', month: 'short', day: 'numeric' }
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-6 py-4 text-end">
                        <div className="flex justify-end">
                          <RowActions
                            role={user.role}
                            manageLabel={t('Admin.usersPage.manageProfile')}
                            passwordLabel={t('Admin.usersPage.forcePassword')}
                            onEdit={() => {
                              setSelectedUser(user);
                              setIsEditModalOpen(true);
                            }}
                            onPassword={() => {
                              setSelectedUser(user);
                              setIsPasswordModalOpen(true);
                            }}
                            onTracks={() => {
                              setSelectedUser(user);
                              setIsTracksDialogOpen(true);
                            }}
                            onPerformance={() => {
                              setSelectedUser(user);
                              setIsPerformanceDialogOpen(true);
                            }}
                          />
                        </div>
                      </TableCell>
                    </MotionTableRow>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/30 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            {t('Admin.usersPage.totalPersonnel', { count: filteredUsers.length })}
          </p>
        </div>
      </section>

      <EditUserModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        user={selectedUser}
        onSuccess={fetchUsers}
      />
      <ResetPasswordModal
        open={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
        user={selectedUser}
      />
      <CreateUserModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={fetchUsers}
      />

      {selectedUser && (
        <>
          <TeacherTracksDialog
            open={isTracksDialogOpen}
            onOpenChange={setIsTracksDialogOpen}
            userId={selectedUser.id}
            userName={selectedUser.name}
          />
          <TeacherPerformanceDialog
            open={isPerformanceDialogOpen}
            onOpenChange={setIsPerformanceDialogOpen}
            userId={selectedUser.id}
            userName={selectedUser.name}
          />
        </>
      )}
    </div>
  );
}

// --- Modals ---

function CreateUserModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSuccess: () => void | Promise<void>;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CHILD' as UserRole,
    customRoleId: '',
  });

  useEffect(() => {
    if (!open) {
      setFormData({ name: '', email: '', password: '', role: 'CHILD', customRoleId: '' });
      return;
    }
    if (formData.role === 'STAFF') {
      void (async () => {
        try {
          const res = await api.get('/admin/roles');
          setAvailableRoles(res.data?.data?.roles ?? res.data?.roles ?? []);
        } catch {
          toast.error(t('Admin.usersPage.toast.rolesError'));
          setAvailableRoles([]);
        }
      })();
    }
  }, [formData.role, open, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error(t('Admin.usersPage.create.required'));
      return;
    }
    if (formData.role === 'STAFF' && !formData.customRoleId) {
      toast.error(t('Admin.usersPage.create.staffRoleRequired'));
      return;
    }

    const storeRole = pageRoleToStoreRole(formData.role);
    const roleName = availableRoles.find((r) => r.id === formData.customRoleId)?.name;

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };
      if (formData.role === 'STAFF') payload.customRoleId = formData.customRoleId;

      await api.post('/admin/users', payload);
      toast.success(t('Admin.usersPage.toast.createSuccess', { name: formData.name }));
      onOpenChange(false);
      await onSuccess();
    } catch (e1) {
      toast.error(readApiError(e1) || t('Admin.usersPage.toast.createError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-3xl border-gray-100 p-0 sm:max-w-lg">
        <div className="flex items-center justify-between border-b border-gray-50 bg-[color:var(--color-primary-soft)]/40 px-6 py-5 pe-12">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[color:var(--color-primary-soft)] p-2 text-[color:var(--color-primary)]">
              <UserPlus size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold leading-tight text-gray-900">
                {t('Admin.usersPage.create.title')}
              </DialogTitle>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {t('Admin.usersPage.create.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5 p-8">
          <div className="group space-y-1.5">
            <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-[color:var(--color-primary)]">
              {t('Admin.usersPage.create.fullName')} *
            </label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Smith"
                className="h-12 rounded-2xl border-gray-200 bg-gray-50 ps-10 text-sm focus-visible:bg-white"
                required
              />
            </div>
          </div>

          <div className="group space-y-1.5">
            <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-[color:var(--color-primary)]">
              {t('Admin.usersPage.create.email')} *
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
                className="h-12 rounded-2xl border-gray-200 bg-gray-50 ps-10 text-sm font-medium focus-visible:bg-white"
                required
              />
            </div>
          </div>

          <div className="group space-y-1.5">
            <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-[color:var(--color-primary)]">
              {t('Admin.usersPage.create.password')} *
            </label>
            <div className="relative">
              <LockIcon className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-gray-400" />
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                minLength={8}
                className="h-12 rounded-2xl border-gray-200 bg-gray-50 ps-10 font-mono text-sm focus-visible:bg-white"
                required
              />
            </div>
            <p className="ms-1 text-[10px] font-medium text-gray-400">{t('Admin.usersPage.create.passwordHint')}</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                {t('Admin.usersPage.create.platformRole')} *
              </label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v as UserRole, customRoleId: '' })}
              >
                <SelectTrigger className="h-12 rounded-2xl border-gray-200 bg-gray-50 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHILD">{t('Admin.usersPage.roles.CHILD')}</SelectItem>
                  <SelectItem value="PARENT">{t('Admin.usersPage.roles.PARENT')}</SelectItem>
                  <SelectItem value="TEACHER">{t('Admin.usersPage.roles.TEACHER')}</SelectItem>
                  <SelectItem value="STAFF">{t('Admin.usersPage.roles.STAFF')}</SelectItem>
                  <SelectItem value="ADMIN">{t('Admin.usersPage.roles.ADMIN')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <AnimatePresence>
              {formData.role === 'STAFF' && (
                <motion.div
                  key="staff-role"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-1.5"
                >
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-600">
                    <Shield size={12} />
                    {t('Admin.usersPage.create.assignCustomRole')} *
                  </label>
                  {availableRoles.length === 0 ? (
                    <div className="flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-xs font-medium text-amber-700">
                      <Loader2 className="animate-spin" size={14} />
                      {t('Admin.usersPage.create.loadingRoles')}
                    </div>
                  ) : (
                    <Select
                      value={formData.customRoleId}
                      onValueChange={(v) => setFormData({ ...formData, customRoleId: v })}
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-amber-200 bg-amber-50 font-bold text-amber-800">
                        <SelectValue placeholder={t('Admin.usersPage.create.selectRole')} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <p className="ms-1 text-[10px] font-bold text-amber-500">{t('Admin.usersPage.create.staffRoleHint')}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {formData.role === 'ADMIN' && (
                <motion.div
                  key="admin-warn"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
                    <ShieldAlert className="mt-0.5 shrink-0 text-red-500" size={16} />
                    <p className="text-xs font-medium leading-relaxed text-red-700">{t('Admin.usersPage.create.adminWarning')}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            type="submit"
            disabled={loading}
            variant="default"
            className="h-12 w-full rounded-2xl font-bold shadow-xl shadow-gray-200"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
            {t('Admin.usersPage.create.submit')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditUserModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  user: AdminUser | null;
  onSuccess: () => void | Promise<void>;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'CHILD' as UserRole,
    status: 'PENDING' as ParentStatus,
    customRoleId: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role,
        status: user.parent?.status || 'PENDING',
        customRoleId: user.customRole?.id || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (!open || formData.role !== 'STAFF') return;
    void (async () => {
      try {
        const res = await api.get('/admin/roles');
        setAvailableRoles(res.data?.data?.roles ?? res.data?.roles ?? []);
      } catch {
        setAvailableRoles([]);
      }
    })();
  }, [formData.role, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (formData.role === 'STAFF' && !formData.customRoleId) {
      toast.error(t('Admin.usersPage.create.staffRoleRequired'));
      return;
    }

    const storeRole = pageRoleToStoreRole(formData.role);
    const roleName = availableRoles.find((r) => r.id === formData.customRoleId)?.name ?? user.customRole?.name;

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };
      
      if (formData.role === 'STAFF') {
        payload.customRoleId = formData.customRoleId;
      }

      // AUD-03: Atomic update - include status in the primary payload
      if (formData.role === 'PARENT') {
        payload.status = formData.status;
      }

      await api.patch(`/admin/users/${user.id}`, payload);

      toast.success(t('Admin.usersPage.toast.updateSuccess'));
      onOpenChange(false);
      await onSuccess();
    } catch (e1) {
      toast.error(readApiError(e1) || t('Admin.usersPage.toast.updateError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-3xl border-gray-100 p-0 sm:max-w-md">
        <DialogHeader className="border-b border-gray-50 bg-gray-50/50 px-6 py-5 pe-12">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[color:var(--color-primary-soft)] p-2 text-[color:var(--color-primary)]">
              <Edit2 size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold leading-tight text-gray-900">
                {t('Admin.usersPage.edit.title')}
              </DialogTitle>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{t('Admin.usersPage.edit.subtitle')}</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6 p-8">
          <div className="space-y-4">
            <div className="group space-y-1.5">
              <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                {t('Admin.usersPage.edit.name')}
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-gray-400" />
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 rounded-2xl border-gray-200 bg-gray-50 ps-10 text-sm focus-visible:bg-white"
                />
              </div>
            </div>

            <div className="group space-y-1.5">
              <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                {t('Admin.usersPage.edit.email')}
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 rounded-2xl border-gray-200 bg-gray-50 ps-10 text-sm font-medium focus-visible:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.usersPage.edit.ecosystemRole')}
                </label>
                <Select
                  value={formData.role}
                  onValueChange={(v) => setFormData({ ...formData, role: v as UserRole, customRoleId: '' })}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-gray-200 bg-gray-50 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHILD">{t('Admin.usersPage.roles.CHILD')}</SelectItem>
                    <SelectItem value="PARENT">{t('Admin.usersPage.roles.PARENT')}</SelectItem>
                    <SelectItem value="STAFF">{t('Admin.usersPage.roles.STAFF')}</SelectItem>
                    <SelectItem value="ADMIN">{t('Admin.usersPage.roles.ADMIN')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <AnimatePresence>
                {formData.role === 'PARENT' && (
                  <motion.div
                    key="parent-status"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-1.5"
                  >
                    <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                      {t('Admin.usersPage.edit.statusState')}
                    </label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v as ParentStatus })}
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-gray-200 bg-gray-50 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">{t('Admin.usersPage.statuses.PENDING')}</SelectItem>
                        <SelectItem value="APPROVED">{t('Admin.usersPage.statuses.APPROVED')}</SelectItem>
                        <SelectItem value="SUSPENDED">{t('Admin.usersPage.statuses.SUSPENDED')}</SelectItem>
                        <SelectItem value="REJECTED">{t('Admin.usersPage.statuses.REJECTED')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {formData.role === 'STAFF' && (
                <motion.div
                  key="edit-staff"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-1.5"
                >
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-600">
                    <Shield size={12} />
                    {t('Admin.usersPage.edit.customRole')}
                  </label>
                  {availableRoles.length === 0 ? (
                    <div className="flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-xs font-medium text-amber-700">
                      <Loader2 className="animate-spin" size={14} />
                      {t('Admin.usersPage.edit.loadingRoles')}
                    </div>
                  ) : (
                    <Select
                      value={formData.customRoleId}
                      onValueChange={(v) => setFormData({ ...formData, customRoleId: v })}
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-amber-200 bg-amber-50 font-bold text-amber-800">
                        <SelectValue placeholder={t('Admin.usersPage.create.selectRole')} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            type="submit"
            disabled={loading || !user}
            variant="default"
            className="h-12 w-full rounded-2xl font-bold shadow-xl shadow-gray-200"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
            {t('Admin.usersPage.edit.submit')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordModal({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  user: AdminUser | null;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (!open) setNewPassword('');
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPassword) return;

    setLoading(true);
    try {
      await api.patch(`/admin/users/${user.id}/password`, { password: newPassword });
      toast.success(t('Admin.usersPage.toast.passwordSuccess'));
      setNewPassword('');
      onOpenChange(false);
    } catch (e1) {
      toast.error(readApiError(e1) || t('Admin.usersPage.toast.passwordError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 overflow-hidden rounded-3xl border-gray-100 p-0 sm:max-w-sm">
        <div className="flex items-center justify-between border-b border-gray-50 bg-red-50/40 px-6 py-5 pe-12">
          <div className="flex items-center gap-3 text-red-600">
            <div className="rounded-xl bg-red-100 p-2">
              <Key size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold uppercase tracking-tight">
                {t('Admin.usersPage.password.title')}
              </DialogTitle>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                {t('Admin.usersPage.password.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6 p-8">
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 shadow-inner">
            <ShieldAlert className="mt-0.5 shrink-0 text-red-500" size={16} />
            <p className="text-xs font-medium leading-relaxed text-red-700">
              {t('Admin.usersPage.password.warning', { name: user?.name || user?.email || '—' })}
            </p>
          </div>

          <div className="group space-y-2">
            <label className="ms-1 text-xs font-black uppercase tracking-[0.1em] text-gray-400">
              {t('Admin.usersPage.password.newPassword')}
            </label>
            <div className="relative">
              <LockIcon className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-gray-400" />
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className="h-12 rounded-2xl border-gray-200 bg-gray-50 ps-10 font-mono text-sm focus-visible:bg-white focus-visible:ring-red-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            variant="destructive"
            className="h-12 w-full rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-200"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldAlert size={20} />}
            {t('Admin.usersPage.password.submit')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
