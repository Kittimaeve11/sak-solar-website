'use client';

import { useEffect, useState } from 'react';
import '../../styles/faq.css';
import { useLocale } from '../Context/LocaleContext';

import FaqBanner from './components/FaqBanner';
import FaqList from './components/FaqList';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

// Banner Cache กันกระพริบ
let bannerCache = null;

export default function FAQPageClient() {
  const { locale } = useLocale();

  const [faqs, setFaqs] = useState([]);
  const [banners, setBanners] = useState([]);

  const [loadingFaq, setLoadingFaq] = useState(true);
  const [loadingBanner, setLoadingBanner] = useState(true);

  const [isMobile, setIsMobile] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;
    let resizeTimer = null;

    //  จัดการ Mobile/Resize
    const updateMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    updateMobile(); // เช็คตอน mount

    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateMobile, 200); // debounce
    });

    //  โหลด FAQ + Banner
    async function loadData() {
      try {
        //  Load FAQ
        setLoadingFaq(true);
        const resFaq = await fetch(`${baseUrl}/api/FQAapi`, {
          headers: { "X-API-KEY": apiKey },
        });
        const jsonFaq = await resFaq.json();
        if (isMounted) {
          setFaqs(jsonFaq.status && jsonFaq.result ? jsonFaq.result : []);
        }
      } catch (e) {
        console.error("Error loading FAQs:", e);
      } finally {
        if (isMounted) setLoadingFaq(false);
      }

      try {
        //  Load Banner (with Cache)
        setLoadingBanner(true);
        if (!bannerCache) {
          const resBanner = await fetch(`${baseUrl}/api/branderIDapi/1`, {
            headers: { "X-API-KEY": apiKey },
          });
          const jsonBanner = await resBanner.json();
          bannerCache = Array.isArray(jsonBanner.data)
            ? jsonBanner.data
            : [jsonBanner.data];
        }
        if (isMounted) setBanners(bannerCache);
      } catch (e) {
        console.error("Error loading Banner:", e);
      } finally {
        if (isMounted) setLoadingBanner(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", updateMobile);
    };
  }, [locale]); 

  return (
    <div className="no-margin">
      {/* ================= Banner ================= */}
      <FaqBanner
        banners={banners}
        loadingBanner={loadingBanner}
        isMobile={isMobile}
        baseUrl={baseUrl}
      />

      {/* ================= FAQ ================= */}
      <main className="layout-faq fade-in">
        <h1 className="headtitle">คำถามที่พบบ่อยเกี่ยวกับโซลาร์เซลล์</h1>

        <FaqList
          faqs={faqs}
          loadingFaq={loadingFaq}
          openIndex={openIndex}
          setOpenIndex={setOpenIndex}
        />
      </main>
    </div>
  );
}
