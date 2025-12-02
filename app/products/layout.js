
export const metadata = {
    title: 'บริการและผลิตภัณฑ์โซลาร์เซลล์',
    description:
        'เลือกชมผลิตภัณฑ์และบริการติดตั้งโซลาร์เซลล์คุณภาพสูง Huawei, Growatt, Deye, Solar Air และ Hybrid พร้อมบริการออกแบบ ขออนุญาต ติดตั้ง และสินเชื่อครบวงจร.',
    keywords: [
        'บริการติดตั้งโซลาร์เซลล์',
        'ผลิตภัณฑ์โซลาร์เซลล์',
        'Solar',
        'Solar Rooftop',
        'Solar Hybrid',
        'Solar Air',
        'โซลาร์รูฟท็อป',
        'โซลาร์แอร์',
        'Huawei',
        'Growatt',
        'Deye',
        'โซลาร์เซลล์',
        'โซลาร์รูฟ',
        'โซลาร์',
        'สินเชื่อโซล่ารูฟ',
        'บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด',
        'SAKSIAM SOLAR ENERGY CO., LTD.',
    ],
    openGraph: {
        title: 'บริการและผลิตภัณฑ์โซลาร์เซลล์ | บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด | SAKSIAM SOLAR ENERGY CO., LTD.',
        description:
            'เลือกชมผลิตภัณฑ์และบริการโซลาร์เซลล์ Solar Rooftop, Hybrid, Solar Air พร้อมติดตั้งครบวงจร โดยทีมวิศวกรมืออาชีพ.',
    images: ['/images/locationPhoto685cbc7c35ef8.jpg'], // รูปตัวอย่างตอนแชร์ลิงก์ (ควรเป็นขนาด 1200x630px)
        url: 'https://solar.saksiam.com/products',
        type: 'website',
        siteName: 'Saksiam Solar',
    },
};

export default function ProductsLayout({ children }) {
    return <>{children}</>;
}
