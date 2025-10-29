'use client';

import BannerSlider from './components/BannerSlider'; // สไลด์แบนเนอร์ด้านบน
import FreeServices from './components/Home/FreeServices'; // ส่วนแสดงบริการฟรี เช่น ให้คำปรึกษา
import SolarFormnew from './components/Home/SolarFormnew'; // ฟอร์มคำนวณโซลาร์รูฟท็อป
import ContactForm from './components/Home/ContactForm'; // ฟอร์มติดต่อบริษัท
import ProductCarousel from './components/Home/ProductCarousel'; // สไลด์โชว์สินค้าแต่ละประเภท
import { useLocale } from './Context/LocaleContext'; // ใช้บริบทสำหรับตรวจสอบภาษาที่เลือก (th/en)
import { useEffect, useState } from 'react'; // hook สำหรับ state และ lifecycle
import SlidePortfolio from './components/Home/SlidePortfolio'; // สไลด์ผลงานติดตั้ง
import SlideEditorial from './components/Home/SlideEditorial'; // สไลด์บทความ
import SlideReview from './components/Home/SlideReview'; // สไลด์รีวิวจากลูกค้า
import { useSearchParams } from 'next/navigation'; // ใช้ดึง query string จาก URL

// URL ของ API และ Key (มาจากไฟล์ .env)
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* =========================================================
   Component หลักของหน้า HomePage
   ========================================================= */
export default function HomePage() {
  // State สำหรับจัดเก็บข้อมูลต่าง ๆ ที่ดึงจาก API
  const [services, setServices] = useState([]); // บริการฟรี เช่น ให้คำปรึกษา, ประเมินหน้างาน
  const [loadingServices, setLoadingServices] = useState(true); // สถานะกำลังโหลดข้อมูลบริการ
  const { locale } = useLocale(); // ภาษาปัจจุบัน (th หรือ en)
  const [productTypes, setProductTypes] = useState([]); // เก็บข้อมูลประเภทสินค้า (product type)
  const [provinces, setProvinces] = useState([]); // ข้อมูลจังหวัดทั้งหมด
  const [amphures, setAmphures] = useState([]); // ข้อมูลอำเภอ
  const [tambons, setTambons] = useState([]); // ข้อมูลตำบล
  const [loadingProducts, setLoadingProducts] = useState(true); // เพิ่มสถานะโหลดสินค้า

  const searchParams = useSearchParams(); // ใช้ดึง query string จาก URL
  const productFromUrl = searchParams.get('product') || ''; // ดึงค่า ?product= จาก URL ถ้ามี

  /* =========================================================
     useEffect: โหลดข้อมูลทั้งหมด (Services, Province, Products)
     ========================================================= */
  useEffect(() => {
    async function loadData() {
      try {
        // ดึงข้อมูลพร้อมกัน 4 อย่าง: บริการ, จังหวัด, อำเภอ, ตำบล
        const [serviceRes, provRes, amphRes, tambRes] = await Promise.all([
          fetch(`${baseUrl}/api/serviceapi`, { headers: { 'X-API-KEY': apiKey } }),
          fetch('/data/thai_provinces.json'),
          fetch('/data/thai_amphures.json'),
          fetch('/data/thai_tambons.json'),
        ]);

        // แปลงข้อมูลทั้งหมดเป็น JSON
        const [serviceData, prov, amph, tamb] = await Promise.all([
          serviceRes.json(),
          provRes.json(),
          amphRes.json(),
          tambRes.json(),
        ]);

        // ตั้งค่าข้อมูลบริการฟรี และข้อมูลจังหวัด/อำเภอ/ตำบล
        setServices(serviceData.status && serviceData.result ? serviceData.result : []);
        setProvinces(prov);
        setAmphures(amph);
        setTambons(tamb);

        /* -------- โหลด Header ของสินค้า (ชื่อประเภทสินค้า + แบรนด์) -------- */
        const headerRes = await fetch(`${baseUrl}/api/productHeaderapi`, {
          headers: { 'X-API-KEY': apiKey },
        });
        const headerData = await headerRes.json();
        const headers = headerData.status ? headerData.result : [];

        /* -------- โหลดข้อมูลสินค้าหลักทั้งหมด -------- */
        const prodRes = await fetch(`${baseUrl}/api/productmainpageapi`, {
          headers: { 'X-API-KEY': apiKey },
        });
        const prodData = await prodRes.json();
        const products = prodData.status ? prodData.result : [];

        /* -------- จัดเรียงสินค้าให้ตรงกับ Header -------- */
        const sortedProducts = headers
          .map((h) => {
            const ptype = products.find((p) => p.producttypeID === h.producttypeID);
            if (!ptype) return null;

            const items =
              ptype.Products?.map((prod) => {
                const nameClean = prod.modelname
                  ? prod.modelname.replace(/เฟส\s*/gi, '').replace(/Phase\s*/gi, '').trim()
                  : prod.solarpanel?.replace(/เฟส\s*/gi, '').replace(/Phase\s*/gi, '').trim() ||
                  'ไม่พบข้อมูลชื่อสินค้า';

                const wattMatch = prod.solarpanel?.match(/\d+\s*W/i);
                const displayName = wattMatch ? `${nameClean} (${wattMatch[0]})` : nameClean;

                const brandObj = h.Brand?.find((b) => b.productbrandID === prod.productbrandID);

                return {
                  ...prod,
                  name: displayName,
                  size: prod.installationsize || null,
                  image: prod.gallery ? `${baseUrl}/${JSON.parse(prod.gallery)[0]}` : null,
                  producttypeID: h.producttypeID,
                  producttypeNameTH: h.producttypenameTH,
                  producttypeNameEN: h.producttypenameEN,
                  productbrandID: prod.productbrandID,
                  productbrandName: brandObj?.productbrandname || '',
                };
              }) || [];

            return { ...ptype, items };
          })
          .filter(Boolean);

        setProductTypes(sortedProducts);
      } catch (error) {
        console.error('Error loading data:', error);
        setServices([]);
        setProductTypes([]);
      } finally {
        setLoadingServices(false);
        setLoadingProducts(false); // เมื่อโหลดสินค้าจบ
      }
    }

    loadData();

    // Scroll ไปที่ส่วนติดต่อ ถ้ามี query ?product
    if (productFromUrl) {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    }
  }, [productFromUrl]);

  /* =========================================================
     ส่วนแสดงผลหลัก (Render)
     ========================================================= */
  return (
    <>
      {/* ส่วนแบนเนอร์ด้านบน */}
      <div className="banner-wrapper">
        <BannerSlider />
      </div>

      {/* หัวข้อหลักของหน้า */}
      <h5 className="headline" style={{ marginTop: '-0.5px' }}>
        ติดตั้งโซลาร์เซลล์กับทีมช่างที่ได้มารฐาน <br />
        และได้รับการรับรองจากการไฟฟ้า (PEA)
      </h5>

      {/* ส่วนบริการฟรี */}
      <FreeServices contacts={services} locale={locale} loading={loadingServices} baseUrl={baseUrl} />

      {/* ส่วนสินค้า (แสดงเป็น Carousel แยกตามประเภท) */}
      <div>
        {loadingProducts && productTypes.length === 0 ? (
          <>
            {[1, 2, 3].map((i) => (
              <ProductCarousel
                key={`skeleton-${i}`}
                title="กำลังโหลดสินค้า..."
                items={[]}
                loading={true}
              />
            ))}
          </>
        ) : (
          productTypes.map((ptype) => (
            <ProductCarousel
              key={ptype.producttypeID}
              title={locale === 'th' ? ptype.producttypenameTH : ptype.producttypenameEN}
              items={ptype.items}
              link={`/products/${ptype.producttypeID}`}
              loading={false}
            />
          ))
        )}
      </div>

      {/* ฟอร์มคำนวณโซลาร์ */}
      <SolarFormnew />

      {/* ฟอร์มติดต่อ */}
      <div id="contact">
        <ContactForm
          productOptions={productTypes}
          provinces={provinces}
          amphures={amphures}
          tambons={tambons}
          initialProduct={productFromUrl}
        />
      </div> 

      {/* เส้นคั่นระหว่าง section */}
      <div style={{ borderBottom: '2.5px solid #e88534c7', width: '80%', margin: '20px auto' }}></div>

      {/* ส่วนบทความ / ผลงาน / รีวิว */}
      <SlideEditorial />
      <SlidePortfolio />
      <SlideReview />

      {/* สไตล์เฉพาะสำหรับแบนเนอร์ */}
      <style jsx>{`
        .banner-wrapper {
          position: relative;
          width: 100%;
          height: auto; /* ไม่ fix ด้วย aspect-ratio เพื่อให้ responsive */
        }

        .banner-wrapper :global(img) {
          width: 100%;
          height: auto;
          object-fit: cover;
          display: block;
        }
      `}</style>
    </>
  );
}
