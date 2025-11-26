// 📄 app/layout.js
import { LocaleProvider } from './Context/LocaleContext';
import './globals.css';
import localFont from 'next/font/local';
import { Suspense } from 'react';

// Components Layout
import Navbar from './components/Navbar';
import TabMenu from './components/TabMenu';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';
import FloatingButtons from './components/FloatingButtons';
import ToastProvider from './components/ToastProvider';
import CookieBanner from './components/CookieBanner';
import ThemeModeWrapper from './components/ThemeModeWrapper';
import GoogleAnalytics from './components/GoogleAnalytics';

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
// SEO Metadata หลักของเว็บไซต์
// ================================
export const metadata = {
  title: {
    default: 'บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด | SAKSIAM SOLAR ENERGY CO., LTD.',
    template: '%s | บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด | SAKSIAM SOLAR ENERGY CO., LTD.',
  },
  description:
    'บริการติดตั้งโซลาร์เซลล์ครบวงจร ออกแบบ ติดตั้ง ขออนุญาต การไฟฟ้า พร้อมบริการหลังการขายทั่วประเทศ.',
  keywords: [
    'บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด',
    'SAKSIAM SOLAR ENERGY CO., LTD.',
    'Saksiam Solar',
    'โซลาร์เซลล์',
    'โซล่ารูฟ',
    'Solar Rooftop',
    'Solar Rooftop Hybrid',
    'ไฮบริดโซลาร์',
    'โซลาร์รูฟท็อป',
    'โซลาร์รูฟท็อปไฮบริด',
    'Solar Hybrid',
    'Solar Air',
    'โซลาร์แอร์',
    'สินเชื่อ',
    'สินเชื่อโซล่ารูฟ',
    'ติดตั้งโซลาร์เซลล์',
    'แผงโซลาร์',
    'แผงโซลาร์เซลล์',
    'ติดตั้งโซลาร์',
  ],
  creator: 'Saksiam Solar',
  metadataBase: new URL('https://www.saksiamsolar.com'),
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: 'https://www.saksiamsolar.com',
    siteName: 'Saksiam Solar',
    title: 'บริการติดตั้งโซลาร์เซลล์ครบวงจร – พร้อมรับประกันและดูแลหลังการขาย',
    description:
      'ติดตั้งโซลาร์เซลล์คุณภาพสูง Huawei Growatt และ Deye พร้อมบริการขออนุญาตจากการไฟฟ้า.',
    images: ['/images/banner-default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
};

// ================================
// ฟังก์ชันดึง Theme จาก API (Server side)
// ================================
async function getThemeFromAPI() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL_API}/api/website/theme-mode`,
      {
        headers: { 'X-API-KEY': process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API },
        cache: 'no-store',
      }
    );

    const data = await res.json();
    return data.mode || 'normal';
  } catch (e) {
    return 'normal';
  }
}

// ================================
// Layout หลักของเว็บ (Server Component)
// ================================
export default async function RootLayout({ children }) {
  const themeMode = await getThemeFromAPI();

  return (
    <html
      lang="th"
      className={sukhumvitTadmai.variable}
      data-theme-mode={themeMode}
      suppressHydrationWarning
    >
      <body className="font-sukhumvit" suppressHydrationWarning>
        <ThemeModeWrapper initialMode={themeMode} />

        {/* ✅ ครอบ tree ฝั่ง client ทั้งหมดด้วย Suspense */}
        <Suspense fallback={null}>
          <LocaleProvider>
            <GoogleAnalytics GA_MEASUREMENT_ID="G-GRQS76P3XV" />
            <Navbar />
            <TabMenu />
            <main>{children}</main>
            <ToastProvider />
            <FloatingButtons />
            <BackToTopButton />
            <CookieBanner />
            <Footer />
          </LocaleProvider>
        </Suspense>
      </body>
    </html>
  );
}
