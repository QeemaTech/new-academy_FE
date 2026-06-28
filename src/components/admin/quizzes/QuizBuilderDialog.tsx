import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Trash2, 
  Settings2, 
  Layout, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  GripVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../ui/select';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Card, CardContent } from '../../ui/card';
import { api } from '../../../lib/axios';

// Validation Schema based on Backend
const OptionSchema = z.object({
  text: z.string().min(1, 'Required'),
  isCorrect: z.boolean().default(false),
});

const QuestionSchema = z.object({
  text: z.string().min(3, 'Question is too short'),
  type: z.enum(['MCQ', 'TRUE_FALSE']),
  points: z.number().min(1),
  order: z.number(),
  options: z.array(OptionSchema).min(1),
});

const QuizFormSchema = z.object({
  title: z.string().min(3, 'Title is too short'),
  type: z.enum(['LESSON_QUIZ', 'TRACK_FINAL', 'COMPETITION']),
  passingScore: z.number().min(0).max(100),
  timeLimit: z.number().nullable().optional(),
  maxAttempts: z.number().min(1),
  sessionId: z.string().uuid().nullable().optional(),
  trackId: z.string().uuid().nullable().optional(),
  questions: z.array(QuestionSchema).min(1),
});

type QuizFormValues = z.infer<typeof QuizFormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz?: any;
  onSuccess: () => void;
}

export default function QuizBuilderDialog({ open, onOpenChange, quiz, onSuccess }: Props) {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loadingContext, setLoadingContext] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuizFormValues>({
    resolver: zodResolver(QuizFormSchema) as any,
    defaultValues: {
      title: '',
      type: 'LESSON_QUIZ',
      passingScore: 60,
      timeLimit: null,
      maxAttempts: 3,
      questions: [{ text: '', type: 'MCQ', points: 1, order: 0, options: [{ text: '', isCorrect: true }] }],
    },
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: 'questions',
  });

  useEffect(() => {
    if (open) {
      if (quiz) {
        // Transform backend data to form values
        reset({
          title: quiz.title,
          type: quiz.type,
          passingScore: quiz.passingScore,
          timeLimit: quiz.timeLimit,
          maxAttempts: quiz.maxAttempts,
          sessionId: quiz.sessionId,
          trackId: quiz.trackId,
          questions: quiz.questions.map((q: any) => ({
            text: q.text,
            type: q.type,
            points: q.points,
            order: q.order,
            options: q.options.map((o: any) => ({
              text: o.text,
              isCorrect: o.isCorrect
            })),
          })),
        });
      } else {
        reset({
           title: '',
           type: 'LESSON_QUIZ',
           passingScore: 60,
           timeLimit: null,
           maxAttempts: 3,
           questions: [{ text: '', type: 'MCQ', points: 1, order: 0, options: [{ text: '', isCorrect: true }] }],
        });
      }
      fetchContext();
    }
  }, [open, quiz, reset]);

  const fetchContext = async () => {
    setLoadingContext(true);
    try {
      const [sessionsRes, tracksRes] = await Promise.all([
        api.get('/admin/sessions'),
        api.get('/admin/programs'),
      ]);
      
      const sessionData = sessionsRes.data?.data?.sessions ?? sessionsRes.data?.sessions ?? sessionsRes.data?.data ?? sessionsRes.data ?? [];
      setSessions(Array.isArray(sessionData) ? sessionData : []);

      const trackData = tracksRes.data?.data?.programs ?? tracksRes.data?.programs ?? tracksRes.data?.data ?? tracksRes.data ?? [];
      setTracks(Array.isArray(trackData) ? trackData : []);
    } catch {
      // Fallback
    } finally {
      setLoadingContext(false);
    }
  };

  const onSubmit = async (values: QuizFormValues) => {
    // Audit: Ensure each question has at least one correct answer
    const invalidQuestions = values.questions.filter(q => !q.options.some(o => o.isCorrect));
    if (invalidQuestions.length > 0) {
      toast.error(t('Admin.quizzes.validationAtLeastOneCorrect'));
      return;
    }

    try {
      if (quiz) {
        await api.put(`/admin/quizzes/${quiz.id}`, values);
      } else {
        await api.post('/admin/quizzes', values);
      }
      toast.success(t('Admin.quizzes.saveSuccess'));
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('Common.error'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] p-0 border-none bg-gray-50 flex flex-col">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
          {/* 🏔️ Header */}
          <div className="shrink-0 bg-white px-8 py-6 border-b border-gray-100">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">
                {quiz ? t('Admin.quizzes.editQuiz') : t('Admin.quizzes.addQuiz')}
              </DialogTitle>
              <p className="text-[10px] uppercase font-bold tracking-widest text-blue-500 mt-1">
                {quiz ? `${t('Admin.quizzes.engineSubtitle')} · ID: ${quiz.id}` : t('Admin.quizzes.engineSubtitle')}
              </p>
            </DialogHeader>
          </div>

          {/* 📝 Scrollable Form content */}
          <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-10 custom-scrollbar">
            {/* ⚙️ Basic Configuration */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="md:col-span-2">
                <Label className="mb-2 block">{t('Admin.quizzes.title')}</Label>
                <Input 
                  {...register('title')} 
                  placeholder={t('Admin.quizzes.titlePlaceholder')} 
                  className="h-14 w-full rounded-2xl border-gray-200 focus:ring-blue-500 font-bold text-lg truncate" 
                />
                {errors.title && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase italic">{errors.title.message}</p>}
              </div>

              <div className="space-y-6">
                <div>
                   <Label className="mb-2 block">{t('Admin.quizzes.type')}</Label>
                   <Controller
                      control={control}
                      name="type"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                           <SelectTrigger className="h-12 w-full rounded-xl border-gray-200 font-bold truncate">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl border-gray-100 p-1">
                              <SelectItem value="LESSON_QUIZ" className="rounded-lg font-bold">{t('Admin.quizzes.status.LESSON_QUIZ')}</SelectItem>
                              <SelectItem value="TRACK_FINAL" className="rounded-lg font-bold">{t('Admin.quizzes.status.TRACK_FINAL')}</SelectItem>
                           </SelectContent>
                        </Select>
                      )}
                   />
                </div>
                <div>
                  <Label className="mb-2 block">{t('Admin.quizzes.passingScore')}</Label>
                  <Input 
                    type="number" 
                    {...register('passingScore', { valueAsNumber: true })} 
                    className="h-12 w-full rounded-xl border-gray-200 font-bold" 
                  />
                </div>
              </div>

              <div className="space-y-6">
                 <div>
                    <Label className="mb-2 block text-gray-400">{t('Admin.quizzes.linkToSession')}</Label>
                    <Controller
                      control={control}
                      name="sessionId"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                           <SelectTrigger className="h-12 w-full rounded-xl border-gray-200 font-bold truncate">
                              <SelectValue placeholder={t('Admin.quizzes.linkToSession')} />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl border-gray-100 p-1">
                              {sessions.map(s => <SelectItem key={s.id} value={s.id} className="rounded-lg font-bold">{s.title}</SelectItem>)}
                           </SelectContent>
                        </Select>
                      )}
                    />
                 </div>
                 <div>
                    <Label className="mb-2 block text-gray-400">{t('Admin.quizzes.linkToTrack')}</Label>
                    <Controller
                      control={control}
                      name="trackId"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                           <SelectTrigger className="h-12 w-full rounded-xl border-gray-200 font-bold truncate">
                              <SelectValue placeholder={t('Admin.quizzes.linkToTrack')} />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl border-gray-100 p-1">
                              {tracks.map(t => <SelectItem key={t.id} value={t.id} className="rounded-lg font-bold">{t.title}</SelectItem>)}
                           </SelectContent>
                        </Select>
                      )}
                    />
                 </div>
              </div>
            </section>

            {/* ❓ Question Management */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <CheckCircle2 size={24} className="text-blue-600" />
                    {t('Admin.quizzes.questions')}
                 </h3>
                 <Button 
                    type="button" 
                    onClick={() => appendQuestion({ text: '', type: 'MCQ', points: 1, order: questionFields.length, options: [{ text: '', isCorrect: true }] })} 
                    variant="outline" 
                    className="rounded-xl font-bold border-blue-100 text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="me-2 h-4 w-4" />
                    {t('Admin.quizzes.addQuestion')}
                 </Button>
              </div>

              {questionFields.map((qField, qIdx) => (
                <QuestionItem 
                  key={qField.id} 
                  qIdx={qIdx} 
                  control={control} 
                  register={register} 
                  removeQuestion={removeQuestion} 
                  t={t}
                  watch={watch}
                  setValue={setValue}
                />
              ))}
              
              {errors.questions && <p className="text-red-500 font-bold text-center uppercase tracking-widest text-xs mt-4">{errors.questions.message}</p>}
            </div>
          </div>

          {/* 🏁 Footer Sticky */}
          <div className="shrink-0 bg-white px-8 py-5 border-t border-gray-100">
             <DialogFooter className="flex !flex-row items-center justify-end gap-3 sm:gap-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => onOpenChange(false)} 
                  className="rounded-xl font-bold h-12 px-6 hover:bg-gray-100"
                >
                   {t('Common.cancel')}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-10 shadow-lg shadow-blue-100 active:scale-95 transition-all"
                >
                   {isSubmitting ? t('Common.saving') : t('Common.save')}
                </Button>
             </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function QuestionItem({ qIdx, control, register, removeQuestion, t, watch, setValue }: any) {
  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: `questions.${qIdx}.options`,
  });

  const qType = watch(`questions.${qIdx}.type`);

  // Auto-handle TRUE_FALSE toggle
  useEffect(() => {
    if (qType === 'TRUE_FALSE') {
       setValue(`questions.${qIdx}.options`, [
         { text: t('Admin.quizzes.trueLabel'), isCorrect: true },
         { text: t('Admin.quizzes.falseLabel'), isCorrect: false }
       ]);
    }
  }, [qType, qIdx, setValue, t]);

  return (
    <Card className="rounded-3xl border-gray-100 bg-white shadow-sm overflow-hidden group mb-6">
      <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-100">
         <div className="flex items-center gap-2">
            <GripVertical size={16} className="text-gray-300" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {t('Admin.quizzes.questionNumber', { n: qIdx + 1 })}
            </span>
         </div>
         <Button type="button" variant="ghost" onClick={() => removeQuestion(qIdx)} className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 p-0">
            <Trash2 size={16} />
         </Button>
      </div>
      <CardContent className="p-6 lg:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2">
              <Label className="mb-2 block">{t('Admin.quizzes.questionText')}</Label>
              <Input 
                {...register(`questions.${qIdx}.text`)} 
                className="h-12 w-full rounded-xl border-gray-200 font-bold" 
                placeholder={t('Admin.quizzes.questionPlaceholder')}
              />
           </div>
           <div>
              <Label className="mb-2 block">{t('Admin.quizzes.questionType')}</Label>
              <Controller
                control={control}
                name={`questions.${qIdx}.type`}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-12 w-full rounded-xl border-gray-200 font-bold truncate">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl p-1">
                       <SelectItem value="MCQ" className="rounded-lg font-bold">{t('Admin.quizzes.mcq')}</SelectItem>
                       <SelectItem value="TRUE_FALSE" className="rounded-lg font-bold">{t('Admin.quizzes.trueFalse')}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
           </div>
        </div>

        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <Label className="text-gray-500 font-black uppercase text-[10px] tracking-widest">{t('Admin.quizzes.options')}</Label>
              {qType === 'MCQ' && (
                <Button type="button" size="sm" onClick={() => appendOption({ text: '', isCorrect: false })} variant="ghost" className="text-blue-600 font-bold text-[10px] uppercase tracking-widest hover:bg-blue-50 h-7 rounded-lg">
                  <Plus className="me-1 h-3 w-3" />
                  {t('Admin.quizzes.addOption')}
                </Button>
              )}
           </div>

           <div className="space-y-3">
              <Controller
                control={control}
                name={`questions.${qIdx}.options`}
                render={({ field }) => (
                  <RadioGroup 
                    onValueChange={(val) => {
                       const currentOptions = watch(`questions.${qIdx}.options`);
                       const updated = currentOptions.map((o: any, i: number) => ({
                         ...o,
                         isCorrect: String(i) === val
                       }));
                       setValue(`questions.${qIdx}.options`, updated);
                    }}
                    value={String(field.value.findIndex((o: any) => o.isCorrect))}
                    className="space-y-3"
                  >
                    {optionFields.map((oField, oIdx) => (
                      <div key={oField.id} className="group/opt flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                        <RadioGroupItem value={String(oIdx)} id={`q-${qIdx}-o-${oIdx}`} className="shrink-0" />
                        <Input 
                          {...register(`questions.${qIdx}.options.${oIdx}.text`)} 
                          className="flex-1 h-10 border-none bg-transparent font-bold text-sm focus-visible:ring-0 truncate" 
                          placeholder={
                            qType === 'TRUE_FALSE'
                              ? oIdx === 0
                                ? t('Admin.quizzes.trueLabel')
                                : t('Admin.quizzes.falseLabel')
                              : t('Admin.quizzes.optionPlaceholder', { n: oIdx + 1 })
                          }
                          readOnly={qType === 'TRUE_FALSE'}
                        />
                        {qType === 'MCQ' && optionFields.length > 1 && (
                          <Button type="button" variant="ghost" onClick={() => removeOption(oIdx)} className="h-8 w-8 text-gray-300 hover:text-red-500 p-0 opacity-0 group-hover/opt:opacity-100 transition-opacity">
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
