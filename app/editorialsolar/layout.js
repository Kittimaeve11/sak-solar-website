// 📄 app/editorial/layout.js

export const metadata = {
  title: "บทความเกี่ยวกับโซลาร์เซลล์",
  description:
    "รวมบทความให้ความรู้เกี่ยวกับโซลาร์เซลล์ Solar Rooftop, Solar Hybrid, Solar Air, การติดตั้ง, วิธีเลือกอุปกรณ์, การขออนุญาต, ROI, และแนวทางประหยัดค่าไฟสำหรับบ้านและธุรกิจ.",
  keywords: [
    "บทความโซลาร์เซลล์",
    "สาระความรู้โซลาร์",
    "Solar Rooftop",
    "Solar Hybrid",
    "Solar Air",
    "โซลาร์เซลล์ บ้าน",
    "โซลาร์เซลล์ ธุรกิจ",
    "ROI โซลาร์",
    "วิธีเลือกแผงโซลาร์",
    "ความรู้โซลาร์",
    "Saksiam Solar",
    "โซลาร์รูฟท็อป",
    "พลังงานสะอาด",
    "ติดตั้งโซลาร์",
    "พลังงานทดแทน",
  ],

  openGraph: {
    title: "บทความและสาระความรู้เกี่ยวกับโซลาร์เซลล์",
    description:
      "แหล่งความรู้เกี่ยวกับระบบโซลาร์เซลล์สำหรับบ้านและธุรกิจ พร้อมเทคนิค การติดตั้ง การเลือกอุปกรณ์ และคำแนะนำจากผู้เชี่ยวชาญ.",
    url: "https://www.saksiamsolar.com/editorial",
    type: "website",
    siteName: "Saksiam Solar",
    images: ['/images/locationPhoto685cbc7c35ef8.jpg'], // รูปตัวอย่างตอนแชร์ลิงก์ (ควรเป็นขนาด 1200x630px)
  },

  twitter: {
    card: "summary_large_image",
    title: "บทความความรู้เกี่ยวกับโซลาร์เซลล์ | Saksiam Solar",
    description:
      "รวมบทความและสาระน่ารู้เกี่ยวกับระบบโซลาร์เซลล์ เทคนิคการติดตั้ง และการประหยัดไฟ",
    images: ["/images/seo/editorial-cover.jpg"],
  },

  alternates: {
    canonical: "https://www.saksiamsolar.com/editorial",
  },
};

export default function EditorialLayout({ children }) {
  return <>{children}</>;
}
