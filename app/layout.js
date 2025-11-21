import { LocaleProvider, useLocale } from './Context/LocaleContext';
import './globals.css';
import localFont from 'next/font/local';
import dynamic from "next/dynamic";

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
  // ตั้งค่าชื่อเว็บไซต์หลักและรูปแบบชื่อหน้าต่าง ๆ
  title: {
    // ชื่อเริ่มต้นของเว็บไซต์ สำหรับหน้าแรกหรือหน้าที่ไม่ได้กำหนด title เอง
    default: 'บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด | SAKSIAM SOLAR ENERGY CO., LTD.',
    // รูปแบบสำหรับสร้าง title ของแต่ละหน้า โดย %s คือข้อความ title ของหน้านั้น
    template: '%s | บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด | SAKSIAM SOLAR ENERGY CO., LTD.',
  },

  // คำอธิบายเว็บไซต์ ใช้สำหรับ SEO และแสดงในผลการค้นหา
  description:
    'บริการติดตั้งโซลาร์เซลล์ครบวงจร ออกแบบ ติดตั้ง ขออนุญาต การไฟฟ้า พร้อมบริการหลังการขายทั่วประเทศ.',

  // รายการคำค้นที่เกี่ยวข้องกับธุรกิจ ใช้ช่วยในการทำ SEO
  keywords: [
    // ชื่อบริษัท
    'บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด',
    'SAKSIAM SOLAR ENERGY CO., LTD.',
    'Saksiam Solar',

    // สินค้าและบริการ
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

    // บริการเสริม
    'สินเชื่อ',
    'สินเชื่อโซล่ารูฟ',
    'ติดตั้งโซลาร์เซลล์',
    'แผงโซลาร์',
    'แผงโซลาร์เซลล์',
    'ติดตั้งโซลาร์',

  ],

  // ระบุเจ้าของเว็บไซต์หรือผู้สร้าง
  creator: 'Saksiam Solar',

  // URL พื้นฐานของเว็บไซต์ ใช้เป็นฐานสำหรับสร้าง URL โดยอัตโนมัติ
  metadataBase: new URL('https://www.saksiamsolar.com'),

  // ข้อมูลสำหรับการแชร์ลิงก์ในโซเชียลมีเดีย เช่น Facebook, Line, LinkedIn
  openGraph: {
    // ประเภทเนื้อหา
    type: 'website',
    // รหัสภาษาและประเทศ
    locale: 'th_TH',
    // URL ของหน้าเว็บหลัก
    url: 'https://www.saksiamsolar.com',
    // ชื่อเว็บไซต์
    siteName: 'Saksiam Solar',
    // ชื่อที่แสดงเมื่อแชร์ลิงก์
    title: 'บริการติดตั้งโซลาร์เซลล์ครบวงจร – พร้อมรับประกันและดูแลหลังการขาย',
    // คำอธิบายที่แสดงเมื่อแชร์ลิงก์
    description:
      'ติดตั้งโซลาร์เซลล์คุณภาพสูง Huawei Growatt และ Deye พร้อมบริการขออนุญาตจากการไฟฟ้า.',
    // รูปภาพที่จะแสดงเมื่อแชร์ลิงก์ (แนะนำขนาดประมาณ 1200x630 px)
    images: ['/images/banner-default.jpg'],
  },

  // ตั้งค่าการให้ Search Engine จัดทำดัชนีและติดตามลิงก์
  robots: {
    // อนุญาตให้หน้าเว็บนี้ถูกจัดอันดับ
    index: true,
    // อนุญาตให้ติดตามลิงก์ในหน้านี้
    follow: true,
  },

  // ระบุ URL หลักของหน้านี้ เพื่อป้องกันเนื้อหาซ้ำ (duplicate content)
  alternates: {
    canonical: '/',
  },
};

// ================================
// Layout หลักของเว็บ (Server Component)
// ================================
async function getThemeFromAPI() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL_API}/api/website/theme-mode`, {
      headers: { 'X-API-KEY': process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API },
      cache: 'no-store',
    });

    const data = await res.json();
    return data.mode || 'normal';
  } catch (e) {
    return 'normal';
  }
}

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
      </body>
    </html>
  );
}
