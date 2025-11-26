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

  /* =====================================================
      ตรวจมือถือ (เพื่อเลือกไฟล์ภาพ)
  ===================================================== */
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  /* =====================================================
      ดึงข้อมูล FAQ + Banner
  ===================================================== */
  useEffect(() => {
    const loadData = async () => {
      // FAQ
      try {
        const res = await fetch(`${baseUrl}/api/FQAapi`, {
          headers: { 'X-API-KEY': apiKey },
        });
        const json = await res.json();
        setFaqs(json.status && json.result ? json.result : []);
      } finally {
        setLoadingFaq(false);
      }

      // Banner
      try {
        if (!bannerCache) {
          const res = await fetch(`${baseUrl}/api/branderIDapi/1`, {
            headers: { 'X-API-KEY': apiKey },
          });
          const json = await res.json();
          bannerCache = Array.isArray(json.data) ? json.data : [json.data];
        }
        setBanners(bannerCache);
      } finally {
        setLoadingBanner(false);
      }
    };

    loadData();
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
