import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/cn';

type ParentTabEmptyProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function ParentTabEmpty({ icon: Icon, title, description, action, className }: ParentTabEmptyProps) {
  return (
    <Card
      className={cn(
        'rounded-2xl border-dashed border-slate-200 bg-linear-to-b from-slate-50/80 to-white',
        className
      )}
    >
      <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4178EF]/10 shadow-inner shadow-[#4178EF]/5">
          <Icon className="h-7 w-7 text-[#4178EF]" strokeWidth={1.75} />
        </div>
        <p className="font-black text-slate-900">{title}</p>
        <p className="max-w-md text-sm font-medium leading-relaxed text-slate-500">{description}</p>
        {action ? <div className="mt-1">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
