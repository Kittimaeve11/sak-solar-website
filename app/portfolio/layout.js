
export const metadata = {
  title: 'ผลงานติดตั้งโซลาร์เซลล์',
  description:
    'รวมผลงานการติดตั้งโซลาร์เซลล์จริงจากลูกค้าบ้านพักอาศัย โรงงาน ธุรกิจ และภาครัฐ พร้อมรายละเอียดขนาดระบบ จำนวนแผง และวันที่ติดตั้ง โดยบริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด.',
  keywords: [
    'ผลงานติดตั้งโซลาร์เซลล์',
    'Portfolio Solar',
    'ตัวอย่างงานติดตั้งโซลาร์',
    'โซลาร์รูฟท็อป บ้าน',
    'ติดตั้งโซลาร์เซลล์ โรงงาน',
    'Solar Installation',
    'Solar Rooftop',
    'Solar Hybrid',
    'Solar Air',
    'ศักดิ์สยาม โซลาร์',
    'Saksiam Solar',
    'บริษัทรับติดตั้งโซลาร์',
    'รีวิวติดตั้งโซลาร์เซลล์',
    'ผลงานลูกค้าโซลาร์',
  ],
  openGraph: {
    title: 'ผลงานติดตั้งโซลาร์เซลล์ | บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด | SAKSIAM SOLAR ENERGY CO., LTD.',
    description:
      'ตัวอย่างผลงานติดตั้งโซลาร์เซลล์จริงจากทั่วประเทศ ครอบคลุมภาคบ้านพักอาศัย ธุรกิจ โรงงาน และภาครัฐ พร้อมข้อมูลขนาดระบบ และวันติดตั้ง.',
    url: 'https://solar.saksiam.com/portfolio',
    type: 'website',
    siteName: 'Saksiam Solar',
    images: ['/images/locationPhoto685cbc7c35ef8.jpg'], // รูปตัวอย่างตอนแชร์ลิงก์ (ควรเป็นขนาด 1200x630px)
  },
};

export default function PortfolioLayout({ children }) {
  return <>{children}</>;
}
