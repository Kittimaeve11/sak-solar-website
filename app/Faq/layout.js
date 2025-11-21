
export const metadata = {
    title: 'คำถามที่พบบ่อยเกี่ยวกับโซลาร์เซลล์',
    description:
        'รวมคำถามที่พบบ่อยเกี่ยวกับระบบโซลาร์เซลล์ การติดตั้ง การคำนวณคุ้มทุน การเลือกขนาดที่เหมาะสม การดูแล และประโยชน์ต่อบ้านและธุรกิจ จาก Saksiam Solar.',
    keywords: [
        'คำถามที่พบบ่อย โซลาร์เซลล์',
        'คำถามที่พบบ่อย',

        'FAQ Solar',
        'โซลาร์รูฟ ถามตอบ',
        'ติดตั้งโซลาร์เซลล์ ต้องรู้อะไรบ้าง',
        'โซลาร์เซลล์คุ้มไหม',
        'ศักดิ์สยาม โซลาร์',
        'Saksiam Solar',
        'Solar Rooftop FAQ',
        'Solar Air FAQ',
        'Solar Hybrid',
        'ติดตั้งโซลาร์',
        'ทำไมต้องโซลาร์เซลล์',
        'สินเชื่อโซล่ารูฟ',
        'สินเชื่อโซล่ารูฟ',
        'บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด',
        'SAKSIAM SOLAR ENERGY CO., LTD.',
    ],
    openGraph: {
        title: 'คำถามที่พบบ่อยเกี่ยวกับโซลาร์เซลล์ | Saksiam Solar',
        description:
            'ตอบคำถามเกี่ยวกับโซลาร์เซลล์ ตั้งแต่เริ่มต้น จนถึงการติดตั้งจริง ครอบคลุมทั้งบ้านพักอาศัยและธุรกิจ พร้อมคำแนะนำจากผู้เชี่ยวชาญ.',
        url: 'https://www.saksiamsolar.com/faq',
        images: ['/images/seo/faq-cover.jpg'],
        type: 'website',
        siteName: 'Saksiam Solar',
    },
};

export default function FAQLayout({ children }) {
    return <>{children}</>;
}
