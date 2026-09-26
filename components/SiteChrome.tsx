'use client';

import { usePathname } from 'next/navigation';
import NavBar from './NavBar';
import Footer from './Footer';

// Public pages share one nav bar and footer (previously only the homepage had
// them, so /blog, /projects, /resume etc. had no way back). The admin area
// keeps its own chrome.
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if ((pathname?.startsWith('/admin') || pathname?.startsWith('/magic'))) return <>{children}</>;
  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  );
}
