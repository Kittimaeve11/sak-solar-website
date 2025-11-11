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

// ================================
// ✅ ฟอนต์หลักของเว็บไซต์
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
// Metadata ทั่วไปของเว็บไซต์ (Global SEO)
// ================================
export const metadata = {
  title: {
    default: 'Saksiame Solar | ศักดิ์สยามโซลาร์ - พลังงานแสงอาทิตย์ครบวงจร',
    template: '%s | Saksiame Solar',
  },
  description:
    'เว็บไซต์ Saksiame Solar พลังงานแสงอาทิตย์ครบวงจร สำหรับบ้าน อาคาร และธุรกิจ พร้อมบริการติดตั้งโซลาร์เซลล์ โซลาร์รูฟท็อป โซลาร์แอร์ และสินเชื่อโซลาร์รูฟท็อป.',
  authors: [{ name: 'SAK Siam Solar Energy', url: 'https://saksiamsolar.co.th' }],
  creator: 'Saksiame Solar',
  publisher: 'Saksiame Solar',
  metadataBase: new URL('https://saksiamsolar.co.th'),
  openGraph: {
    title: 'Saksiame Solar | ศักดิ์สยามโซลาร์',
    description:
      'บริการติดตั้งโซลาร์เซลล์ครบวงจร พร้อมคำปรึกษาฟรี ทีมช่างมาตรฐานการไฟฟ้า PEA โซลาร์รูฟท็อป โซลาร์แอร์ และสินเชื่อพลังงานแสงอาทิตย์.',
    url: 'https://saksiamsolar.co.th',
    siteName: 'Saksiame Solar',
    locale: 'th_TH',
    type: 'website',
    images: [
      {
        url: 'https://saksiamsolar.co.th/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Saksiame Solar ศักดิ์สยามโซลาร์',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saksiame Solar | พลังงานแสงอาทิตย์ครบวงจร',
    description:
      'ติดตั้งโซลาร์เซลล์ โซลาร์รูฟท็อป โซลาร์แอร์ พร้อมสินเชื่อพลังงานสะอาดและคำปรึกษาฟรี',
    images: ['https://saksiamsolar.co.th/og-home.jpg'],
  },
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
      <head>
        {/* ✅ Meta พื้นฐานที่ควรมีในทุกหน้า */}
        <meta name="author" content="SAK Siam Solar Energy" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#ffffff" />
      </head>

      <body className={`${sukhumvitTadmai.variable} font-sukhumvit`} suppressHydrationWarning>
        <LocaleProvider>
          {/* ✅ ส่วนหัว */}
          <GoogleAnalytics GA_MEASUREMENT_ID="G-GRQS76P3XV" />
          <Navbar />
          <TabMenu />

          {/* ✅ เนื้อหาหลัก */}
          <main style={{ minHeight: '100vh' }}>{children}</main>

          {/* ✅ ส่วนท้าย */}
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
