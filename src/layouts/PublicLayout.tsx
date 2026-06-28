import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import AppFooter from '../components/layout/AppFooter';
import WhatsAppButton from '../components/ui/WhatsAppButton';

export default function PublicLayout() {
  return (
    <div dir="rtl" lang="ar" className="relative flex min-h-screen flex-col bg-white">
      <PublicNavbar />
      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 bg-grid-slate-100" aria-hidden />
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
      <AppFooter />
      <WhatsAppButton />
    </div>
  );
}




