// 📄 app/contact/layout.js

export const metadata = {
  title:
    "ติดต่อเรา",
  description:
    "ติดต่อบริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด เพื่อสอบถามข้อมูล การติดตั้งโซลาร์เซลล์ Solar Rooftop, Solar Air, Hybrid, ออกแบบ ขออนุญาต และบริการสินเชื่อโซลาร์ ครบวงจร.",
  
  keywords: [
    "ติดต่อโซลาร์เซลล์",
    "ติดต่อบริษัทโซลาร์",
    "สอบถามติดตั้งโซลาร์",
    "โซลาร์รูฟ ติดต่อ",
    "Solar Rooftop ติดต่อ",
    "บริษัทติดตั้งโซลาร์เซลล์",
    "Saksiam Solar ติดต่อ",
    "ขอใบเสนอราคาโซลาร์เซลล์",
    "Solar Air ติดต่อ",
    "Hybrid Solar ติดต่อ",
    "บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด",
    "SAKSIAM SOLAR ENERGY CO., LTD.",
  ],

  openGraph: {
    title:
      "ติดต่อบริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด | Saksiam Solar",
    description:
      "สอบถามบริการติดตั้งระบบโซลาร์เซลล์ ออกแบบ ขออนุญาต พร้อมให้คำปรึกษาโดยทีมงานผู้เชี่ยวชาญ",
    url: "https://solar.saksiam.com/contact",
    type: "website",
    siteName: "Saksiam Solar",
    images: ['/images/locationPhoto685cbc7c35ef8.jpg'], // รูปตัวอย่างตอนแชร์ลิงก์ (ควรเป็นขนาด 1200x630px)
   
  },

  twitter: {
    card: "summary_large_image",
    title: "ติดต่อเรา | บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด | SAKSIAM SOLAR ENERGY CO., LTD.",
    description:
      "ติดต่อสอบถามข้อมูลโซลาร์ ขอใบเสนอราคา ติดตั้ง Solar Rooftop สำหรับบ้านและธุรกิจ",
    images: ["/images/seo/contact-cover.jpg"],
  },

  alternates: {
    canonical: "https://solar.saksiam.com/contact",
  },
};

export default function ContactLayout({ children }) {
  return <>{children}</>;
}
