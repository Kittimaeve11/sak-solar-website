import { LocaleProvider } from './Context/LocaleContext';
import './globals.css';
import localFont from 'next/font/local';

// Components Layout
import Navbar from './components/Navbar';
import TabMenu from './components/TabMenu';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';
import FloatingButtons from './components/FloatingButtons';
import ToastProvider from './components/ToastProvider';
import CookieBanner from './components/CookieBanner';
import GoogleAnalytics from './components/GoogleAnalytics';

import ThemeModeWrapper from './components/ThemeModeWrapper';

// ================================
// ฟอนต์หลักของเว็บไซต์
// ================================
const sukhumvitTadmai = localFont({
  src: [
    { path: './fonts/SukhumvitTadmai-UltraLight.otf', weight: '200', style: 'normal' },
    { path: './fonts/SukhumvitTadmai-Text.otf', weight: '400', style: 'normal' },
    { path: './fonts/SukhumvitTadmai-SemiBold.otf', weight: '600', style: 'normal' },
    { path: './fonts/SukhumvitTadmai-ExtraBold.otf', weight: '800', style: 'normal' },
  ],
  variable: '--font-sukhumvit',
  display: 'swap',
});

// ================================
// โหลดโหมดธีมจาก API แบบ SSR (แก้กระพริบ)
// ================================
async function getThemeFromAPI() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
    const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

    const res = await fetch(`${baseUrl}/api/website/theme-mode`, {
      headers: { 'X-API-KEY': apiKey },
      cache: 'no-store',
    });

    const data = await res.json();
    return data.mode || 'normal';
  } catch (e) {
    return 'normal';
  }
}

export const metadata = {
  title: 'บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด | SAKSIAM SOLAR ENERGY CO., LTD.',
  description: 'บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด ให้บริการติดตั้งโซลาร์เซลล์ครบวงจร',
};



// ================================
// Layout หลักของเว็บ (Server Component)
// ================================
export default async function RootLayout({ children }) {
  // 🔥 โหลดโหมดล่วงหน้าแบบ SSR
  const themeMode = await getThemeFromAPI();

  return (
    <html
      lang="th"
      className={sukhumvitTadmai.variable}
      data-theme-mode={themeMode}  // ⭐ แสดงโหมดตั้งแต่ HTML เฟรมแรก
      suppressHydrationWarning
    >
      <head>
        <meta name="author" content="SAK Siam Solar Energy" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#ffffff" />
      </head>

      

      <body
        className={`${sukhumvitTadmai.variable} font-sukhumvit`}
        suppressHydrationWarning
      >
        {/** ⭐ ให้ ThemeModeWrapper อัปเดตค่า Live ฝั่ง Client */}
        <ThemeModeWrapper initialMode={themeMode} />

        <LocaleProvider>
          <GoogleAnalytics GA_MEASUREMENT_ID="G-GRQS76P3XV" />
          <Navbar />
          <TabMenu />

          <main style={{ minHeight: '100vh' }}>{children}</main>

          <ToastProvider />
          <FloatingButtons />
          <BackToTopButton />
          <CookieBanner />
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
