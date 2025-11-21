import ProductsPage from '../page'; // ใช้หน้า Products หลัก

// 🟢 ฟังก์ชัน SEO สำหรับหน้า Category/Product Type
export async function generateMetadata({ params }) {
  const typeID = params.typeID;

  // แปลงชื่อให้สวย ถ้ามาจาก slug เช่น solar-rooftop → Solar Rooftop
  const displayName = decodeURIComponent(typeID)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${displayName} - ผลิตภัณฑ์โซลาร์เซลล์`,
    description: `สำรวจสินค้าในหมวด ${displayName} เช่น Solar Rooftop, Hybrid, Solar Air พร้อมบริการออกแบบ ติดตั้ง และสินเชื่อครบวงจรทั่วประเทศ โดยบริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด`,
    keywords: [
      displayName,
      'Solar Rooftop',
      'Solar Hybrid',
      'Solar Air',
      'ติดตั้งโซลาร์',
      'ศักดิ์สยาม โซลาร์',
      'Saksiam Solar',
    ],
    alternates: {
      canonical: `/products/${typeID}`,
    },
  };
}

// 🟢 Component หลักของ Dynamic Route
export default function TypePage({ params }) {
  const { typeID } = params;

  return <ProductsPage typeId={typeID} />;
}
