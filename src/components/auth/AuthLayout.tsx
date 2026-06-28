import React from 'react';
import { GraduationCap, Layers, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row" dir="rtl">
      
      {/* 💎 Right Side (Identity - 50%) */}
      <div className="hidden md:flex w-full md:w-1/2 bg-[#4178EF] text-white flex-col items-center justify-center relative overflow-hidden p-8">
        
        {/* Subtle Background Waves */}
        <div className="absolute inset-0 z-0 opacity-10">
          <svg className="absolute top-0 right-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 20 Q 25 10, 50 20 T 100 20 V 0 H 0 Z" fill="white" />
            <path d="M0 50 Q 25 40, 50 50 T 100 50 V 100 H 0 Z" fill="white" opacity="0.3" />
          </svg>
        </div>

        {/* Content Overlay - Centered and Spaced */}
        <div className="relative z-10 w-full max-w-md space-y-12 text-center">
          
          {/* Logo Branding */}
          <div className="space-y-4">
             <div className="flex items-center justify-center gap-2">
                <span className="text-5xl font-black tracking-tighter">New</span>
                <span className="text-5xl font-light tracking-tight opacity-90">Academy</span>
             </div>
             <p className="text-2xl font-bold leading-relaxed" style={{ fontFamily: 'var(--font-arabic)' }}>
               {title || "منصة تعليمية تفاعلية لتعليم الأطفال البرمجة ومهارات المستقبل"}
             </p>
          </div>

          {/* Stats Section with Pure White Icons */}
          <div className="flex flex-col gap-6 items-center">
            <div className="flex items-center gap-4 w-full max-w-[280px] p-5 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/10">
               <GraduationCap className="h-8 w-8 text-white" />
               <div className="text-right">
                  <div className="text-3xl font-black">+5000</div>
                  <div className="text-sm font-bold opacity-80">طالب</div>
               </div>
            </div>

            <div className="flex items-center gap-4 w-full max-w-[280px] p-5 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/10">
               <Layers className="h-8 w-8 text-white" />
               <div className="text-right">
                  <div className="text-3xl font-black">+6</div>
                  <div className="text-sm font-bold opacity-80">برامج</div>
               </div>
            </div>

            <div className="flex items-center gap-4 w-full max-w-[280px] p-5 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/10">
               <Star className="h-8 w-8 text-white" />
               <div className="text-right">
                  <div className="text-3xl font-black">98%</div>
                  <div className="text-sm font-bold opacity-80">رضا</div>
               </div>
            </div>
          </div>
        </div>

        {/* Decorative Swoosh */}
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] opacity-10 pointer-events-none">
           <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFFFFF" d="M47.5,-57.2C61.4,-49.2,72.4,-34,76.4,-17.1C80.3,-0.2,77.2,18.4,68.4,34.4C59.7,50.3,45.4,63.6,28.7,69.5C12,75.4,-7,73.9,-23.7,67C-40.4,60.1,-54.8,47.7,-63.4,32.3C-72,16.8,-74.8,-1.7,-69.5,-18.4C-64.2,-35.1,-50.8,-49.9,-35.9,-57.6C-21,-65.4,-4.5,-66.1,9.4,-59.5C23.3,-52.9,33.5,-65.3,47.5,-57.2Z" transform="translate(100 100)" />
           </svg>
        </div>
      </div>

      {/* 🚀 Left Side (Form - 50%) */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-4 lg:p-12">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </div>
    </div>
  );
}
