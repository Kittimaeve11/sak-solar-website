'use client';

import { useEffect, useState } from 'react';
import { useLocale } from './Context/LocaleContext';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// Components
import FreeServices from './components/Home/FreeServices';
import SolarFormnew from './components/Home/SolarFormnew';
import ContactForm from './components/Home/ContactForm';
import ProductCarousel from './components/Home/ProductCarousel';
import SlidePortfolio from './components/Home/SlidePortfolio';
import SlideEditorial from './components/Home/SlideEditorial';
import SlideReview from './components/Home/SlideReview';
import BannerSlider from './components/BannerSlider';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

function HomeContent() {
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const productFromUrl = searchParams?.get('product') || '';

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [productTypes, setProductTypes] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [provinces, setProvinces] = useState([]);
  const [amphures, setAmphures] = useState([]);
  const [tambons, setTambons] = useState([]);

  /* =========================================================
       Fetch API + Cache (Client-only)
  ========================================================= */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const API_ENABLED = false;
    const CACHE_KEY = 'HOME_CACHE';
    const cacheText = sessionStorage.getItem(CACHE_KEY);

    if (!API_ENABLED) {
      setLoadingServices(false);
      setLoadingProducts(false);
      return;
    }
    if (cacheText) {
      try {
        const c = JSON.parse(cacheText);
        setServices(c.services || []);
        setProductTypes(c.productTypes || []);
        setProvinces(c.provinces || []);
        setAmphures(c.amphures || []);
        setTambons(c.tambons || []);

        setLoadingServices(false);
        setLoadingProducts(false);
      } catch {
        sessionStorage.removeItem(CACHE_KEY);
      }
    }

    async function loadData() {
      try {
        const [serviceRes, provRes, amphRes, tambRes, headerRes, prodRes] =
          await Promise.all([
            fetch(`${baseUrl}/api/serviceapi`, { headers: { 'X-API-KEY': apiKey } }),
            fetch('/data/thai_provinces.json'),
            fetch('/data/thai_amphures.json'),
            fetch('/data/thai_tambons.json'),
            fetch(`${baseUrl}/api/productHeaderapi`, { headers: { 'X-API-KEY': apiKey } }),
            fetch(`${baseUrl}/api/productmainpageapi`, { headers: { 'X-API-KEY': apiKey } }),
          ]);

        const [serviceData, prov, amph, tamb, headerData, prodData] =
          await Promise.all([
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
            const ptype = products.find(
              (p) => p.producttypeID === h.producttypeID
            );
            if (!ptype) return null;

            const items =
              ptype.Products?.map((prod) => {
                const nameClean =
                  prod.modelname?.replace(/เฟส\s*/gi, '').replace(/Phase\s*/gi, '').trim() ||
                  prod.solarpanel?.replace(/เฟส\s*/gi, '').replace(/Phase\s*/gi, '').trim() ||
                  'ไม่พบข้อมูลชื่อสินค้า';

                const wattMatch = prod.solarpanel?.match(/\d+\s*W/i);
                const displayName = wattMatch
                  ? `${nameClean} (${wattMatch[0]})`
                  : nameClean;

                const brandObj = h.Brand?.find(
                  (b) => b.productbrandID === prod.productbrandID
                );

                return {
                  ...prod,
                  name: displayName,
                  size: prod.installationsize || null,
                  image: prod.gallery
                    ? `${baseUrl}/${JSON.parse(prod.gallery)[0]}`
                    : null,
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

        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            services: serviceList,
            productTypes: sortedProducts,
            provinces: prov,
            amphures: amph,
            tambons: tamb,
          })
        );

        setServices(serviceList);
        setProductTypes(sortedProducts);
        setProvinces(prov);
        setAmphures(amph);
        setTambons(tamb);
      } finally {
        setLoadingServices(false);
        setLoadingProducts(false);
      }
    }

    if (!cacheText) {
      loadData();
    }

    if (productFromUrl) {
      const el = document.getElementById('contact');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }, [productFromUrl]);

  /* =========================================================
       Render หน้า Home
  ========================================================= */
  return (
    <main className="fade-in">
      <BannerSlider />

      <h5 className="headline" style={{ marginTop: '-0.5px' }}>
        ติดตั้งโซลาร์เซลล์กับทีมช่างที่ได้มาตรฐาน <br />
        และได้รับการรับรองจากการไฟฟ้า (PEA)
      </h5>

      <FreeServices
        contacts={services}
        locale={locale}
        loading={loadingServices}
        baseUrl={baseUrl}
      />

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

      <div
        style={{
          borderBottom: '2.5px solid #e88534c7',
          width: '80%',
          margin: '20px auto',
        }}
      ></div>

      <SlideEditorial />
      <SlidePortfolio />
      <SlideReview />
    </main>
  );
}

export default function HomeClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
