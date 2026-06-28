import { useTranslation } from 'react-i18next';
import { useTeacherTracksQuery } from '../../modules/teacher/hooks/useTeacherQueries';
import { TeacherTrackCard } from '../../modules/teacher/components/TeacherTrackCard';
import { Skeleton } from '../../components/ui/skeleton';

export default function TeacherTracksPage() {
  const { t } = useTranslation();
  const { data: tracks, isLoading, isError, refetch, isFetching } = useTeacherTracksQuery();

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground md:text-3xl">
            {t('Teacher.tracks.title', 'My tracks')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('Teacher.tracks.subtitle', 'Tracks you are assigned to teach. Open a roadmap to edit the linear curriculum.')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
          disabled={isFetching}
        >
          {isFetching ? t('Teacher.tracks.refreshing', 'Refreshing…') : t('Teacher.tracks.refresh', 'Refresh')}
        </button>
      </div>

      {isError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {t('Teacher.tracks.loadError', 'Could not load tracks.')}
        </p>
      )}

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      )}

      {!isLoading && tracks && tracks.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {t('Teacher.tracks.empty', 'You have no assigned tracks yet. Contact an administrator.')}
        </p>
      )}

      {!isLoading && tracks && tracks.length > 0 && (
        <div className="grid gap-5">
          {tracks.map((track) => (
            <TeacherTrackCard key={track.id} track={track} />
          ))}
        </div>
      )}
    </div>
  );
}
