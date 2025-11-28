import { LocaleProvider } from './Context/LocaleContext';  
import './globals.css';                                   
import localFont from 'next/font/local';                 
import { Suspense } from 'react';                       

/* ================================
   Import Layout Components
   ================================ */
import Navbar from './components/Navbar';               
import TabMenu from './components/TabMenu';             
import Footer from './components/Footer';                
import BackToTopButton from './components/BackToTopButton'; 
import FloatingButtons from './components/FloatingButtons'; 
import ToastProvider from './components/ToastProvider';     
import CookieBanner from './components/CookieBanner';      
import ThemeModeWrapper from './components/ThemeModeWrapper'; 
import GoogleAnalytics from './components/GoogleAnalytics';   

/* ================================
   ฟอนต์หลัก Sukhumvit Tadmai (Local Font)
   ================================ */
const sukhumvitTadmai = localFont({
  src: [
    { path: './fonts/SukhumvitTadmai-UltraLight.otf', weight: '200', style: 'normal' },
    { path: './fonts/SukhumvitTadmai-Text.otf', weight: '400', style: 'normal' },
    { path: './fonts/SukhumvitTadmai-SemiBold.otf', weight: '600', style: 'normal' },
    { path: './fonts/SukhumvitTadmai-ExtraBold.otf', weight: '800', style: 'normal' },
  ],
  variable: '--font-sukhumvit', // ใช้เป็น CSS custom property (.font-sukhumvit)
  display: 'swap',              // โหลดฟอนต์แบบไม่ทำให้ตัวหนังสือหาย
});

/* ================================
   SEO Metadata หลักของเว็บไซต์
   ================================ */
export const metadata = {
  title: {
    default: 'บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด | SAKSIAM SOLAR ENERGY CO., LTD.', // Title หลัก
    template: '%s | บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด | SAKSIAM SOLAR ENERGY CO., LTD.', // Title ของแต่ละหน้า
  },
  description:
    'บริการติดตั้งโซลาร์เซลล์ครบวงจร ออกแบบ ติดตั้ง ขออนุญาต การไฟฟ้า พร้อมบริการหลังการขายทั่วประเทศ.',
  keywords: [
    'โซลาร์เซลล์',
    'Solar Rooftop',
    'Solar Hybrid',
    'Solar Air',
    'ติดตั้งโซลาร์',
  ],
  creator: 'Saksiam Solar',
  metadataBase: new URL('https://www.saksiamsolar.com'), // กำหนด Base URL ของเว็บ
  openGraph: {
    type: 'website',                     // ประเภทเนื้อหา ใช้ website (ไม่ใช่ blog หรือ product)
    locale: 'th_TH',                     // ภาษาของเว็บ (ไทยประเทศไทย)
    url: 'https://www.saksiamsolar.com', // ลิงก์จริงของหน้า ใช้สำหรับแชร์และ canonical
    siteName: 'Saksiam Solar',           // ชื่อเว็บไซต์ที่จะแสดงเวลาแชร์บนโซเชียล
    title: 'บริการติดตั้งโซลาร์เซลล์ครบวงจร – พร้อมรับประกันและดูแลหลังการขาย', // หัวข้อหลักตอนแชร์ลิงก์
    description:
      'บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด | SAKSIAM SOLAR ENERGY CO., LTD.', // คำอธิบายใต้หัวข้อ
    images: ['/images/locationPhoto685cbc7c35ef8.jpg'], // รูปตัวอย่างตอนแชร์ลิงก์ (ควรเป็นขนาด 1200x630px)
  },
  robots: {
    index: true,  // อนุญาตให้ Google index
    follow: true, // อนุญาตให้ Google ติดตามลิงก์ในหน้า
  },
  alternates: {
    canonical: 'https://www.saksiamsolar.com', // ป้องกันปัญหา Duplicate URL
  },
};

/* ================================
   ดึงค่า Theme Mode จาก API
   ใช้ฝั่ง Server Component
   ================================ */
async function getThemeFromAPI() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL_API}/api/website/theme-mode`,
      {
        headers: { 'X-API-KEY': process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API },
        cache: 'no-store', // ไม่ให้ Cache เพื่อให้ได้ค่าล่าสุด
      }
    );

    const data = await res.json();
    return data.mode || 'normal'; // ถ้าไม่เจอข้อมูล ใช้ normal เป็นค่ามาตรฐาน
  } catch (e) {
    return 'normal'; // กรณี API ล่ม หรือ Error ให้ใช้ normal
  }
}

/* ================================
   Root Layout: Layout หลักของเว็บ
   ครอบทุกหน้าของเว็บไซต์
   ================================ */
export default async function RootLayout({ children }) {
  const themeMode = await getThemeFromAPI(); // ดึงโหมดธีมตอนโหลดหน้า

  return (
    <html
      lang="th"                            // กำหนดภาษาหลักของเว็บให้ SEO เข้าใจ
      className={sukhumvitTadmai.variable} // ใส่ฟอนต์ให้ html ทั้งเว็บ
      data-theme-mode={themeMode}          // ส่งค่า Theme ให้ front-end
      suppressHydrationWarning             // ป้องกัน Error เวลา hydration
    >
      <body className="font-sukhumvit" suppressHydrationWarning>
        <ThemeModeWrapper initialMode={themeMode} /> {/* สลับธีมแบบ Client Side */}

        {/* ใช้ Suspense ครอบ Component ฝั่ง Client */}
        <Suspense fallback={null}>
          <LocaleProvider> {/* ใช้ Context ภาษาและข้อความให้ทั้งเว็บ */}
            <GoogleAnalytics GA_MEASUREMENT_ID="G-GRQS76P3XV" />
            <Navbar />
            <TabMenu />

            {/* ส่วนกลางของเว็บ เปลี่ยนตามแต่ละหน้า */}
            <main>{children}</main>

            {/* Component ที่อยู่ท้ายเว็บ */}
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
