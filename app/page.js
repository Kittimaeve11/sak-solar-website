'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useLocale } from './Context/LocaleContext';
import { useSearchParams } from 'next/navigation';

//  Components
import FreeServices from './components/Home/FreeServices';
import SolarFormnew from './components/Home/SolarFormnew';
import ContactForm from './components/Home/ContactForm';
import ProductCarousel from './components/Home/ProductCarousel';
import SlidePortfolio from './components/Home/SlidePortfolio';
import SlideEditorial from './components/Home/SlideEditorial';
import SlideReview from './components/Home/SlideReview';

//  โหลด BannerSlider แบบไม่ SSR
const BannerSlider = dynamic(() => import('./components/BannerSlider'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        aspectRatio: '3840/1191',
        minHeight: '400px',
        background: '#e0e0e0',
      }}
    />
  ),
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function HomePage() {
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const productFromUrl = searchParams?.get('product') || '';

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [productTypes, setProductTypes] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [amphures, setAmphures] = useState([]);
  const [tambons, setTambons] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  //  โหลดข้อมูลทั้งหมด
  useEffect(() => {
    if (typeof window === 'undefined') return;

// ดึงข้อมูล cache จาก sessionStorage โดยใช้ key ชื่อว่า 'HOME_CACHE'
const cacheText = sessionStorage.getItem('HOME_CACHE');

// ตรวจสอบว่ามีข้อมูล cache อยู่หรือไม่
if (cacheText) {
  try {
    // แปลงข้อความ JSON ที่เก็บไว้ใน sessionStorage ให้กลับมาเป็น object
    const c = JSON.parse(cacheText);

    // แสดงข้อความใน console เพื่อบอกว่ากำลังใช้ข้อมูลจาก cache (ไม่ต้องโหลดจาก API)
    console.log('ใช้ข้อมูลจาก cache');

    // ตั้งค่าข้อมูลใน state จาก cache ที่มีอยู่
    // เพื่อให้หน้าเว็บแสดงข้อมูลทันทีโดยไม่ต้องรอโหลดจาก API
    setServices(c.services || []);         // ตั้งค่าข้อมูลบริการ (FreeServices)
    setProductTypes(c.productTypes || []); // ตั้งค่าข้อมูลสินค้า
    setProvinces(c.provinces || []);       // ตั้งค่าข้อมูลจังหวัด
    setAmphures(c.amphures || []);         // ตั้งค่าข้อมูลอำเภอ
    setTambons(c.tambons || []);           // ตั้งค่าข้อมูลตำบล

    // อัปเดตสถานะการโหลดให้เสร็จสมบูรณ์
    setLoadingServices(false);
    setLoadingProducts(false);

    // ออกจากฟังก์ชันทันที (ไม่ต้องไปโหลดข้อมูลจาก API ด้านล่าง)
    return;
  } catch {
    // หากเกิดข้อผิดพลาดระหว่างแปลงข้อมูล (เช่น cache เสียหาย)
    // ให้ลบ cache ทิ้งและแสดงข้อความแจ้งเตือนใน console
    console.warn('Cache เสียหาย ลบออก');
    sessionStorage.removeItem('HOME_CACHE');
  }
}

    async function loadData() {
      try {
        console.log('🌞 โหลดข้อมูลจาก API...');
        const [serviceRes, provRes, amphRes, tambRes, headerRes, prodRes] = await Promise.all([
          fetch(`${baseUrl}/api/serviceapi`, { headers: { 'X-API-KEY': apiKey } }),
          fetch('/data/thai_provinces.json'),
          fetch('/data/thai_amphures.json'),
          fetch('/data/thai_tambons.json'),
          fetch(`${baseUrl}/api/productHeaderapi`, { headers: { 'X-API-KEY': apiKey } }),
          fetch(`${baseUrl}/api/productmainpageapi`, { headers: { 'X-API-KEY': apiKey } }),
        ]);

        const [serviceData, prov, amph, tamb, headerData, prodData] = await Promise.all([
          serviceRes.json(),
          provRes.json(),
          amphRes.json(),
          tambRes.json(),
          headerRes.json(),
          prodRes.json(),
        ]);

        const serviceList = serviceData?.result || [];
        const headers = headerData?.result || [];
        const products = prodData?.result || [];

        const sortedProducts = headers
          .map((h) => {
            const ptype = products.find((p) => p.producttypeID === h.producttypeID);
            if (!ptype) return null;

            const items =
              ptype.Products?.map((prod) => {
                const nameClean =
                  prod.modelname?.replace(/เฟส\s*/gi, '').replace(/Phase\s*/gi, '').trim() ||
                  prod.solarpanel?.replace(/เฟส\s*/gi, '').replace(/Phase\s*/gi, '').trim() ||
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

        const cacheData = {
          services: serviceList,
          productTypes: sortedProducts,
          provinces: prov,
          amphures: amph,
          tambons: tamb,
        };
        sessionStorage.setItem('HOME_CACHE', JSON.stringify(cacheData));

        setServices(serviceList);
        setProductTypes(sortedProducts);
        setProvinces(prov);
        setAmphures(amph);
        setTambons(tamb);
      } catch (error) {
        console.error('❌ Error loading data:', error);
      } finally {
        setLoadingServices(false);
        setLoadingProducts(false);
      }
    }

    loadData();

    if (productFromUrl) {
      const el = document.getElementById('contact');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }, [productFromUrl]);

  return (
    <>
      {/*  Banner Section */}
      <div className="banner-wrapperhome">
        <BannerSlider />
      </div>

      <h5 className="headline" style={{ marginTop: '-0.5px' }}>
        ติดตั้งโซลาร์เซลล์กับทีมช่างที่ได้มาตรฐาน <br />
        และได้รับการรับรองจากการไฟฟ้า (PEA)
      </h5>

      {/*  Free Services */}
      <FreeServices contacts={services} locale={locale} loading={loadingServices} baseUrl={baseUrl} />

      {/*  Product Section */}
      <div>
        {loadingProducts && productTypes.length === 0
          ? [1, 2, 3].map((i) => (
              <ProductCarousel
                key={`skeleton-${i}`}
                title="กำลังโหลดสินค้า..."
                items={[]}
                loading={true}
              />
            ))
          : productTypes.map((ptype) => (
              <ProductCarousel
                key={ptype.producttypeID}
                title={locale === 'th' ? ptype.producttypenameTH : ptype.producttypenameEN}
                items={ptype.items}
                link={`/products/${ptype.producttypeID}`}
                loading={false}
              />
            ))}
      </div>

      {/*  Solar Form */}
      <SolarFormnew />

      {/*  Contact Section */}
      <div id="contact">
        <ContactForm
          productOptions={productTypes}
          provinces={provinces}
          amphures={amphures}
          tambons={tambons}
          initialProduct={productFromUrl}
        />
      </div>

      <div
        style={{
          borderBottom: '2.5px solid #e88534c7',
          width: '80%',
          margin: '20px auto',
        }}
      ></div>

      {/*  Editorial / Portfolio / Review */}
      <SlideEditorial />
      <SlidePortfolio />
      <SlideReview />

      <style jsx>{`
        .banner-wrapperhome {
          position: relative;
          width: 100%;
          height: auto;
        }
        .banner-wrapperhome :global(img) {
          width: 100%;
          height: auto;
          object-fit: cover;
          display: block;
        }
      `}</style>
    </>
  );
}