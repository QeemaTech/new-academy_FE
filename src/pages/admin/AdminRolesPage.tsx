import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield, Plus, Edit2, Trash2, Users, Save, X, Loader2, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/axios';
import {
  PERMISSION_GROUPS, ALL_PERMISSIONS, buildPermission, type PermissionKey
} from '../../lib/permissions';
// ─── Types ──────────────────────────────────────────────────────────────────

interface CustomRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
}

// ─── Permission Matrix Component ────────────────────────────────────────────

const AdminRolesPage: React.FC = () => {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get('/admin/roles');
      // The backend now returns { success: true, data: { roles: [] } }
      const rolesData = res.data?.data?.roles || res.data?.data;
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch {
      toast.error(t('Admin.rolesPage.fetchError'));
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Local Components ──────────────────────────────────────────────────────

  const InternalPermissionMatrix: React.FC = () => {
    const handleToggle = (permission: string) => {
      setSelectedPermissions((prev) => {
        const next = new Set(prev);
        next.has(permission) ? next.delete(permission) : next.add(permission);
        return next;
      });
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Object.entries(PERMISSION_GROUPS).map(([groupId, group]) => (
          <div 
            key={groupId} 
            className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-blue-200 transition-colors"
          >
            {/* Group Header */}
            <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {group.label}
              </h3>
              <div className="flex gap-2">
                 <button
                   type="button"
                   onClick={() => {
                     const next = new Set(selectedPermissions);
                     group.permissions.forEach(p => next.add(p.key));
                     setSelectedPermissions(next);
                   }}
                   className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                 >
                   {t('Admin.rolesPage.selectAll', 'الكل')}
                 </button>
              </div>
            </div>

            {/* Permissions List */}
            <div className="p-8 grid gap-4">
              {group.permissions.map((perm) => {
                const isChecked = selectedPermissions.has(perm.key);
                return (
                  <label 
                    key={perm.key} 
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${
                      isChecked 
                        ? 'bg-emerald-50/30 border-emerald-100' 
                        : 'bg-white border-slate-50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                       <span className={`text-sm font-bold transition-colors ${isChecked ? 'text-slate-900' : 'text-slate-600'}`}>
                         {perm.label}
                       </span>
                       <span className="text-[10px] font-medium text-slate-400">
                         {perm.key}
                       </span>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(perm.key)}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${
                        isChecked
                          ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20'
                          : 'border-slate-200 bg-white group-hover:border-emerald-400'
                      }`}>
                        {isChecked && (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {/* Legacy Permissions Handling (Graceful display if any exist in the role but not in our current groups) */}
        {Array.from(selectedPermissions).some(p => !ALL_PERMISSIONS.includes(p as any)) && (
          <div className="lg:col-span-2 bg-amber-50/50 border border-amber-100 rounded-[2rem] p-8">
            <h3 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertCircle size={14} />
              صلاحيات قديمة (Legacy Permissions)
            </h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedPermissions)
                .filter(p => !ALL_PERMISSIONS.includes(p as any))
                .map(p => (
                  <div key={p} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-[10px] font-bold text-amber-700">
                    {p}
                    <button type="button" onClick={() => handleToggle(p)} className="hover:text-red-500 transition-colors">
                      <X size={12} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const resetForm = () => {
    setRoleName('');
    setRoleDescription('');
    setSelectedPermissions(new Set());
    setEditingRole(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (role: CustomRole) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || '');
    setSelectedPermissions(new Set(role.permissions));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) { toast.error(t('Admin.rolesPage.roleNameRequired')); return; }
    if (selectedPermissions.size === 0) { toast.error(t('Admin.rolesPage.selectPermission')); return; }

    setSaving(true);
    try {
      const payload = {
        name: roleName.trim(),
        description: roleDescription.trim() || undefined,
        permissions: Array.from(selectedPermissions),
      };

      if (editingRole) {
        await api.patch(`/admin/roles/${editingRole.id}`, payload);
        toast.success(t('Admin.rolesPage.updateSuccess', { name: roleName }));
      } else {
        await api.post('/admin/roles', payload);
        toast.success(t('Admin.rolesPage.createSuccess', { name: roleName }));
      }

      resetForm();
      fetchRoles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('Admin.rolesPage.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role: CustomRole) => {
    if (!window.confirm(t('Admin.rolesPage.deleteConfirm', { name: role.name }))) return;
    try {
      await api.delete(`/admin/roles/${role.id}`);
      toast.success(t('Admin.rolesPage.deleteSuccess', { name: role.name }));
      fetchRoles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('Admin.rolesPage.deleteFailed'));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">{t('Admin.rolesPage.loading')}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl flex items-center gap-4">
            <span className="p-3 bg-blue-50 text-blue-600 rounded-[1.5rem] border border-blue-100">
               <Shield size={32} />
            </span>
            {t('Admin.rolesPage.title')}
          </h1>
          <p className="mt-3 font-medium text-gray-400 max-w-lg">
            {t('Admin.rolesPage.subtitle')}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={openCreateForm}
            className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white font-black text-sm rounded-[1.5rem] hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 active:scale-95"
          >
            <Plus size={20} />
            {t('Admin.rolesPage.newRole')}
          </button>
        )}
      </div>

      {/* Role Form (Create / Edit) */}
      {showForm && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-500/5 overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white text-blue-600 rounded-2xl shadow-sm border border-gray-100">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 leading-none">
                  {editingRole ? t('Admin.rolesPage.editTitle', { name: editingRole.name }) : t('Admin.rolesPage.createTitle')}
                </h2>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1.5">
                  {t('Admin.rolesPage.formSubtitle')}
                </p>
              </div>
            </div>
            <button onClick={resetForm} className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all active:scale-90 border border-transparent hover:border-gray-100">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-10 py-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 group-focus-within:text-blue-600 transition-colors">
                  {t('Admin.rolesPage.roleName')}
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder={t('Admin.rolesPage.roleNamePlaceholder')}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.25rem] text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all placeholder:text-gray-300"
                  required
                />
              </div>
              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 group-focus-within:text-blue-600 transition-colors">
                  {t('Admin.rolesPage.description')}
                </label>
                <input
                  type="text"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder={t('Admin.rolesPage.descriptionPlaceholder')}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.25rem] text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Permission Matrix Area */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <AlertCircle size={14} className="text-blue-500" />
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                   {t('Admin.rolesPage.permissionMatrix')}
                 </label>
              </div>
              <InternalPermissionMatrix />
            </div>

            <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-50">
              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-4 text-sm font-black text-gray-400 bg-gray-50 rounded-[1.25rem] hover:bg-gray-100 transition-all active:scale-95"
              >
                {t('Common.cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-3 px-10 py-4 bg-blue-600 text-white font-black text-sm rounded-[1.25rem] hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl shadow-blue-200 active:scale-95"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {editingRole ? t('Admin.rolesPage.updateRole') : t('Admin.rolesPage.createRole')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {(Array.isArray(roles) && roles.length > 0) ? (
          roles.map((role) => (
            <div 
              key={role.id} 
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute -bottom-10 -right-10 text-gray-50 opacity-10 group-hover:text-blue-50 group-hover:opacity-100 transition-all duration-700">
                 <Shield size={180} />
              </div>

              <div className="flex items-start justify-between relative z-10">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm border border-blue-100 group-hover:border-blue-500">
                  <Shield size={24} />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditForm(role)}
                    className="p-3 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(role)}
                    disabled={role.userCount > 0}
                    className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90 disabled:opacity-10"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-8 relative z-10">
                <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{role.name}</h3>
                <p className="text-gray-400 font-medium text-sm mt-2 line-clamp-2 h-10 italic">
                  {role.description || '—'}
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between relative z-10">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('Admin.rolesPage.tablePermissions')}</p>
                    <span className="flex items-center gap-2 text-sm font-black text-gray-900">
                       <Shield size={14} className="text-blue-400" />
                       {role.permissions?.length || 0}
                    </span>
                 </div>
                 <div className="space-y-1 text-end">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('Admin.rolesPage.tableAssignedUsers')}</p>
                    <span className="flex items-center justify-end gap-2 text-sm font-black text-gray-900">
                       <Users size={14} className="text-blue-400" />
                       {role.userCount}
                    </span>
                 </div>
              </div>
              
              {role.userCount > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-50 flex items-center gap-2 text-[10px] font-bold text-gray-400 relative z-10">
                   <div className="flex -space-x-2">
                      {Array.from({ length: Math.min(role.userCount, 3) }).map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[8px] font-black text-blue-600">
                           {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                   </div>
                   {role.userCount > 3 && <span>{t('Admin.rolesPage.moreUsers', { count: role.userCount - 3 })}</span>}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="md:col-span-2 xl:col-span-3 py-20 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
            <Shield className="text-gray-200 mb-6" size={80} />
            <h3 className="text-xl font-black text-gray-900">{t('Admin.rolesPage.emptyTitle')}</h3>
            <p className="text-gray-400 font-medium max-w-xs mt-2">{t('Admin.rolesPage.emptyDesc')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRolesPage;
