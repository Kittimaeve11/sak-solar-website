
export const metadata = {
  title: 'ผลงานติดตั้งโซลาร์เซลล์ | Saksiam Solar',
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
    title: 'ผลงานติดตั้งโซลาร์เซลล์ | Saksiam Solar',
    description:
      'ตัวอย่างผลงานติดตั้งโซลาร์เซลล์จริงจากทั่วประเทศ ครอบคลุมภาคบ้านพักอาศัย ธุรกิจ โรงงาน และภาครัฐ พร้อมข้อมูลขนาดระบบ และวันติดตั้ง.',
    url: 'https://www.saksiamsolar.com/portfolio',
    type: 'website',
    siteName: 'Saksiam Solar',
    images: [
      {
        url: '/images/seo/portfolio-cover.jpg', // ใส่รูป Banner หรือภาพรวม Portfolio
        width: 1200,
        height: 630,
        alt: 'ตัวอย่างผลงานติดตั้งโซลาร์เซลล์ของลูกค้า',
      },
    ],
  },
};

export default function PortfolioLayout({ children }) {
  return <>{children}</>;
}
