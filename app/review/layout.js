
export const metadata = {
  title: 'รีวิวติดตั้งโซลาร์เซลล์',
  description:
    'ชมรีวิวการติดตั้งโซลาร์เซลล์จริงจากลูกค้าบ้านพักอาศัย โรงงาน และธุรกิจทั่วประเทศ พร้อมวิดีโอรีวิว ผลลัพธ์หลังติดตั้ง และประสบการณ์ใช้งานจริง.',
  keywords: [
    'รีวิวติดตั้งโซลาร์เซลล์',
    'รีวิวโซลาร์รูฟ',
    'รีวิวโซลาร์จริง',
    'วิดีโอรีวิวโซลาร์เซลล์',
    'ลูกค้าจริงโซลาร์เซลล์',
    'ติดตั้งโซลาร์บ้าน',
    'โซลาร์เยอะไหม',
    'Solar Rooftop Reviews',
    'Solar Installation Review',
    'Saksiam Solar รีวิว',
    'ศักดิ์สยาม โซลาร์ รีวิว',
  ],
  openGraph: {
    title: 'รีวิวติดตั้งโซลาร์เซลล์',
    description:
      'ดูวิดีโอรีวิวและประสบการณ์การใช้งานโซลาร์เซลล์จากลูกค้าจริง ทั้งบ้านพักอาศัย โรงงาน และภาคธุรกิจ',
    url: 'https://www.saksiamsolar.com/review',
    type: 'website',
    siteName: 'Saksiam Solar',
    images: [
      {
        url: '/images/seo/review-cover.jpg', // แนะนำให้มีรูปจริง
        width: 1200,
        height: 630,
        alt: 'รีวิวติดตั้งโซลาร์เซลล์จากลูกค้าจริง',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'รีวิวติดตั้งโซลาร์เซลล์จากลูกค้า',
    description:
      'วิดีโอรีวิวการติดตั้งโซลาร์เซลล์จริงจากลูกค้าทั่วประเทศ พร้อมผลลัพธ์หลังใช้งาน',
    images: ['/images/seo/review-cover.jpg'],
  },
};

export default function ReviewLayout({ children }) {
  return <>{children}</>;
}
