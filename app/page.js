'use client';

import SlideEditorial from './components/Home/SlideEditorial';
import BannerSlider from './components/BannerSlider';
import FreeServices from './components/Home/FreeServices';
import SolarFormnew from './components/Home/SolarFormnew';
import ContactForm from './components/Home/ContactForm';
import ProductCarousel from './components/Home/ProductCarousel';
import { useLocale } from './Context/LocaleContext';
import { useEffect, useState } from 'react';
import SlidePortfolio from './components/Home/SlidePortfolio';
import SlideReview from './components/Home/SlideReview';
import { useSearchParams } from 'next/navigation';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const { locale } = useLocale();
  const [productTypes, setProductTypes] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [amphures, setAmphures] = useState([]);
  const [tambons, setTambons] = useState([]);
  const searchParams = useSearchParams();
  const productFromUrl = searchParams.get('product') || '';

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch services + location
        const [serviceRes, provRes, amphRes, tambRes] = await Promise.all([
          fetch(`${baseUrl}/api/serviceapi`, { headers: { 'X-API-KEY': apiKey } }),
          fetch('/data/thai_provinces.json'),
          fetch('/data/thai_amphures.json'),
          fetch('/data/thai_tambons.json')
        ]);
        const [serviceData, prov, amph, tamb] = await Promise.all([
          serviceRes.json(),
          provRes.json(),
          amphRes.json(),
          tambRes.json()
        ]);
        setServices(serviceData.status && serviceData.result ? serviceData.result : []);
        setProvinces(prov);
        setAmphures(amph);
        setTambons(tamb);

        // Fetch product header
        const headerRes = await fetch(`${baseUrl}/api/productHeaderapi`, { headers: { 'X-API-KEY': apiKey } });
        const headerData = await headerRes.json();
        const headers = headerData.status ? headerData.result : [];

        // Fetch main products
        const prodRes = await fetch(`${baseUrl}/api/productmainpageapi`, { headers: { 'X-API-KEY': apiKey } });
        const prodData = await prodRes.json();
        const products = prodData.status ? prodData.result : [];

        // จัดเรียง products ตาม header และเพิ่มชื่อประเภท + แบรนด์
        const sortedProducts = headers.map(h => {
          const ptype = products.find(p => p.producttypeID === h.producttypeID);
          if (!ptype) return null;

          const items = ptype.Products?.map(prod => {
            const nameClean = prod.modelname
              ? prod.modelname.replace(/เฟส\s*/gi, '').replace(/Phase\s*/gi, '').trim()
              : prod.solarpanel?.replace(/เฟส\s*/gi, '').replace(/Phase\s*/gi, '').trim() || 'ไม่พบข้อมูลชื่อสินค้า';

            const wattMatch = prod.solarpanel?.match(/\d+\s*W/i);
            const displayName = wattMatch ? `${nameClean} (${wattMatch[0]})` : nameClean;

            // หา brand จาก header
            const brandObj = h.Brand?.find(b => b.productbrandID === prod.productbrandID);

            return {
              ...prod,
              name: displayName,
              size: prod.installationsize || null,
              image: prod.gallery ? `${baseUrl}/${JSON.parse(prod.gallery)[0]}` : null,
              producttypeID: h.producttypeID,
              producttypeNameTH: h.producttypenameTH,
              producttypeNameEN: h.producttypenameEN,
              productbrandID: prod.productbrandID,
              productbrandName: brandObj?.productbrandname || ''
            };
          }) || [];

          return {
            ...ptype,
            items
          };
        }).filter(Boolean);

        setProductTypes(sortedProducts);

      } catch (error) {
        console.error('Error loading data:', error);
        setServices([]);
        setProductTypes([]);
      } finally {
        setLoadingServices(false);
      }
    }

    loadData();
  }, []);

  // scroll ไปที่ contact ถ้า URL มี ?product=
  useEffect(() => {
    if (productFromUrl) {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    }
  }, [productFromUrl]);

  return (
    <>
      <div className="banner-wrapper">
        <BannerSlider />
      </div>

      <h5 className="headline" style={{ marginTop: '-0.5px' }}>
        ติดตั้งโซลาร์เซลล์กับทีมช่างที่ได้มารฐาน <br />
        และได้รับการรับรองจากการไฟฟ้า (PEA)
      </h5>

      <FreeServices
        contacts={services}
        locale={locale}
        loading={loadingServices}
        baseUrl={baseUrl}
      />

      <div>
        {productTypes.map(ptype => (
          <ProductCarousel
            key={ptype.producttypeID}
            title={locale === 'th' ? ptype.producttypenameTH : ptype.producttypenameEN}
            items={ptype.items}
            link={`/products/${ptype.producttypeID}`}
          />
        ))}
      </div>

      <SolarFormnew />

      <div id="contact">
        <ContactForm
          productOptions={productTypes}
          provinces={provinces}
          amphures={amphures}
          tambons={tambons}
          initialProduct={productFromUrl}
        />
      </div>
      
      {/* <SlideEditorial />
      <SlidePortfolio />
      <SlideReview /> */}

      <style jsx>{`
  .banner-wrapper {
    position: relative;
    width: 100%;
    height: auto; /*  ไม่ fix ด้วย aspect-ratio */
  }

  .banner-wrapper :global(img) {
    width: 100%;
    height: auto;     /*  ปรับตามสัดส่วนจริง */
    object-fit: cover;
    display: block;
  }
`}</style>
    </>
  );
}
