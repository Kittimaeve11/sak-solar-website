//  app/about/layout.js
import '@/styles/about.css';

export const metadata = {
  title:
    'เกี่ยวกับเรา',
  description:
    'บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด ผู้นำด้านการติดตั้งโซลาร์เซลล์ Solar Rooftop, Hybrid และ Solar Air ครบวงจร พร้อมบริการออกแบบ ขออนุญาต และติดตั้งโดยทีมวิศวกรมืออาชีพ.',
  keywords: [
    'เกี่ยวกับศักดิ์สยามโซลาร์',
    'ประวัติบริษัทโซลาร์',
    'บริษัท ศักดิ์สยาม โซลาร์',
    'SAKSIAM SOLAR ENERGY',
    'Solar Rooftop',
    'บริการติดตั้งโซลาร์',
    'ผู้เชี่ยวชาญโซลาร์',
    'โซลาร์รูฟท็อป',
    'Solar Energy Company Thailand',
  ],
  openGraph: {
    title:
      'เกี่ยวกับเรา | Saksiam Solar Energy Co., Ltd. | ศักดิ์สยาม โซลาร์',
    description:
      'ผู้นำด้านเทคโนโลยีพลังงานแสงอาทิตย์ครบวงจร พร้อมทีมวิศวกรและบริการหลังการขายที่มั่นใจได้',
    url: 'https://www.saksiamsolar.com/about',
    type: 'website',
    siteName: 'Saksiam Solar',
    images: ['/images/locationPhoto685cbc7c35ef8.jpg'], // รูปตัวอย่างตอนแชร์ลิงก์ (ควรเป็นขนาด 1200x630px)
  },
  twitter: {
    card: 'summary_large_image',
    title: 'เกี่ยวกับเรา | Saksiam Solar Energy Co., Ltd.',
    description:
      'ข้อมูลบริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด พร้อมวิสัยทัศน์ พันธกิจ และทีมงานผู้เชี่ยวชาญ',
    images: ['/images/seo/about-cover.jpg'],
  },
  alternates: {
    canonical: 'https://www.saksiamsolar.com/about',
  },
};

// ขาดส่วนนี้ไม่ได้
export default function AboutLayout({ children }) {
  return <>{children}</>;
}
