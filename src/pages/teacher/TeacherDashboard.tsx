import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTeacherTracksQuery, useTeacherPerformanceQuery } from '../../modules/teacher/hooks/useTeacherQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Users, GraduationCap, CheckCircle2, MoreHorizontal, Route, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import type { TrackLifecycle } from '../../modules/teacher/types';

function countByLifecycle(tracks: { lifecycle: TrackLifecycle }[]) {
  return tracks.reduce(
    (acc, t) => {
      acc[t.lifecycle] = (acc[t.lifecycle] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<TrackLifecycle, number>>
  );
}

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const { data: tracks, isLoading: tracksLoading, isError } = useTeacherTracksQuery();
  const { data: perf, isLoading: perfLoading } = useTeacherPerformanceQuery({ range: '30d' });

  const totalSessions = tracks?.reduce((s, x) => s + (x._count?.sessions ?? 0), 0) ?? 0;
  const byLife = tracks ? countByLifecycle(tracks) : {};

  const StatCard = ({ title, value, icon: Icon, color, percent }: any) => (
    <Card className="group relative overflow-hidden border-none glass-card transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
      <div className={`absolute top-0 right-0 h-24 w-24 -translate-y-12 translate-x-12 rounded-full opacity-10 transition-transform duration-700 group-hover:scale-150 ${
        color === 'mint' ? 'bg-teal-500' : 'bg-indigo-500'
      }`} />
      <CardContent className="p-6 flex flex-col gap-5 relative z-10">
        <div className="flex items-center justify-between">
          <div className={`rounded-2xl p-3 shadow-sm transition-transform duration-500 group-hover:rotate-12 ${
            color === 'mint' ? 'bg-teal-500/10 text-teal-600' : 'bg-indigo-500/10 text-indigo-600'
          }`}>
            <Icon size={22} />
          </div>
          {percent !== undefined && (
            <Badge variant="secondary" className={`px-2.5 py-0.5 rounded-full border-none font-bold ${
              percent > 70 ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"
            }`}>
              {percent}%
            </Badge>
          )}
        </div>
        <div>
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{title}</h4>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-800 tracking-tight" style={{ direction: 'ltr' }}>{value}</span>
            {percent !== undefined && <span className="text-sm font-bold text-slate-400">%</span>}
          </div>
        </div>
        {percent !== undefined && (
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${percent > 70 ? 'bg-teal-500' : 'bg-amber-500'}`} 
              style={{ width: `${percent}%` }} 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="relative mx-auto max-w-6xl space-y-10 p-4 md:p-10 min-h-[calc(100vh-120px)]">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/20 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-float" />

      <header className="space-y-3 relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-1 w-12 bg-teal-500 rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600/80">
            {t('Teacher.dashboard.portal', 'Instructor Portal')}
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl drop-shadow-sm">
          {t('Teacher.dashboard.title', 'Teacher Dashboard')}
        </h1>
        <p className="max-w-2xl text-base text-slate-500 leading-relaxed font-medium">
          {t(
            'Teacher.dashboard.subtitle',
            'Welcome back! Manage your assigned tracks, monitor student progress, and oversee live curriculum sessions.'
          )}
        </p>
      </header>

      {isError && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 backdrop-blur-md p-5 text-sm text-destructive flex items-center gap-3 animate-fade-in">
          <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
          <p className="font-bold">{t('Teacher.dashboard.loadError', 'Could not load tracks. Please refresh.')}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-card border-none shadow-sm hover:shadow-xl transition-all duration-500 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">
              {t('Teacher.dashboard.assignedTracks', 'Active Tracks')}
            </CardTitle>
            <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-teal-50 transition-colors">
              <Route className="h-5 w-5 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent>
            {tracksLoading ? (
              <Skeleton className="h-10 w-20 rounded-lg" />
            ) : (
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-slate-900 tracking-tighter">{tracks?.length ?? 0}</p>
                <span className="text-xs font-bold text-slate-400">{t('Teacher.dashboard.tracks', 'Tracks')}</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="glass-card border-none shadow-sm hover:shadow-xl transition-all duration-500 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">
              {t('Teacher.dashboard.totalLessons', 'Course Content')}
            </CardTitle>
            <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
              <BookOpen className="h-5 w-5 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            {tracksLoading ? (
              <Skeleton className="h-10 w-20 rounded-lg" />
            ) : (
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-slate-900 tracking-tighter">{totalSessions}</p>
                <span className="text-xs font-bold text-slate-400">{t('Teacher.dashboard.sessions', 'Sessions')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">
              {t('Teacher.dashboard.lifecycleMix', 'Curriculum Status')}
            </CardTitle>
            <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-amber-50 transition-colors">
              <Sparkles className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            {tracksLoading ? (
              <Skeleton className="h-12 w-full rounded-lg" />
            ) : (
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <span className="text-lg font-black text-slate-800">{byLife.LIVE_ENROLLMENT ?? 0}</span>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Live</span>
                </div>
                <div className="w-[1px] h-8 bg-slate-100 self-center" />
                <div className="flex flex-col">
                  <span className="text-lg font-black text-slate-800">{byLife.SELF_PACED ?? 0}</span>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Recorded</span>
                </div>
                <div className="w-[1px] h-8 bg-slate-100 self-center" />
                <div className="flex flex-col">
                  <span className="text-lg font-black text-slate-800">{byLife.CLOSED ?? 0}</span>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Archived</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-8 relative">
        <div className="flex items-end justify-between border-b border-slate-200/60 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
              <h2 className="text-2xl font-black text-slate-900">{t('Teacher.dashboard.performanceTitle', 'Impact & Analytics')}</h2>
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-4">
              {t('Teacher.dashboard.last30Days', 'Global Engagement Metrics')}
            </p>
          </div>
          <Badge className="bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/20 cursor-default px-5 h-9 rounded-2xl border-none font-bold text-xs">
            <Sparkles size={14} className="mr-2 inline" />
            {t('Teacher.dashboard.realTime', 'Live Data Feed')}
          </Badge>
        </div>

        {perfLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-40 rounded-3xl" />
          </div>
        ) : perf ? (
          <div className="grid gap-6 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <StatCard 
              title={t('Admin.usersPage.performance.totalStudents', 'Registered Students')} 
              value={perf.totalStudents} 
              icon={Users} 
              color="sapphire" 
            />
            <StatCard 
              title={t('Admin.usersPage.performance.avgScore', 'Avg Quiz Score')} 
              value={perf.avgQuizScore} 
              icon={GraduationCap} 
              color="mint" 
              percent={perf.avgQuizScore}
            />
            <StatCard 
              title={t('Admin.usersPage.performance.completion', 'Syllabus Mastery')} 
              value={perf.completionRate} 
              icon={CheckCircle2} 
              color="mint" 
              percent={perf.completionRate}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white/40 backdrop-blur-sm">
            <div className="p-4 bg-slate-50 rounded-full mb-4">
              <Sparkles size={40} className="text-slate-200" />
            </div>
            <p className="text-slate-400 text-base font-bold tracking-tight">{t('common.noData', 'Performance metrics pending...')}</p>
          </div>
        )}
      </section>

      <div className="flex justify-start pt-4">
        <Button variant="primary" size="lg" className="h-14 px-10 rounded-2xl shadow-xl shadow-teal-600/20 hover:shadow-2xl hover:shadow-teal-600/30 transition-all duration-300 font-bold group" asChild>
          <Link to="/teacher/tracks" className="flex items-center gap-3">
            {t('Teacher.dashboard.goTracks', 'Access Full Tracks')}
            <Route className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  );

}
