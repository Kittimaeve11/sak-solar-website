import { LocaleProvider } from './Context/LocaleContext';
import './globals.css';
import localFont from 'next/font/local';

//  Components Layout
import Navbar from './components/Navbar';
import TabMenu from './components/TabMenu';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';
import FloatingButtons from './components/FloatingButtons';
import ToastProvider from './components/ToastProvider';
import CookieBanner from './components/CookieBanner';
import GoogleAnalytics from './components/GoogleAnalytics';

// ================================
// ตั้งค่าฟอนต์
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
// Metadata (ใช้ใน App Router)
// ================================
export const metadata = {
  title: 'Saksiame Solar ศักดิ์สยามโซลาร์',
  description: 'เว็บไซต์ Saksiame Solar พลังงานแสงอาทิตย์สำหรับบ้านและธุรกิจ',
  icons: {
    icon: '/Logosaksolar.ico',
  },
};

// ================================
// Layout หลักของเว็บ (Server Component)
// ================================
export default function RootLayout({ children }) {
  return (
    <html lang="th" className={sukhumvitTadmai.variable} suppressHydrationWarning>
      <body className={`${sukhumvitTadmai.variable} font-sukhumvit`} suppressHydrationWarning>
        {/* Provider สำหรับ Locale และข้อมูลหลัก */}
        <LocaleProvider>
            {/* ส่วนประกอบของ Layout */}
            <GoogleAnalytics GA_MEASUREMENT_ID="G-GRQS76P3XV" />
            <Navbar />
            <TabMenu />

            {/* เนื้อหาหลัก */}
            <main style={{ minHeight: '100vh' }}>{children}</main>

            {/* ส่วนท้าย */}
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
