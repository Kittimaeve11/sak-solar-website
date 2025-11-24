'use client';

import { useEffect, useState } from 'react';
import BannerList from './BannerList';
import FAQList from './FAQList';
import '../../styles/faq.css';
import { useLocale } from '../Context/LocaleContext';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

let bannerCache = null;

export default function FAQPage() {
  const locale = useLocale();
  const [faqs, setFaqs] = useState([]);
  const [banners, setBanners] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [loadingFaq, setLoadingFaq] = useState(true);
  const [loadingBanner, setLoadingBanner] = useState(true);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/FQAapi`, {
          headers: { 'X-API-KEY': apiKey },
        });
        const json = await res.json();
        setFaqs(json.status && json.result ? json.result : []);
      } finally {
        setLoadingFaq(false);
      }

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
      {loadingBanner ? (
        <div className="skeleton skeleton-banner fade-in"></div>
      ) : (
        <BannerList banners={banners} baseUrl={baseUrl} isMobile={isMobile} />
      )}

      <main className="layout-faq fade-in">
        <h1 className="headtitle">
          {locale === 'en'
            ? 'Frequently Asked Questions about Solar Energy'
            : 'คำถามที่พบบ่อยเกี่ยวกับโซลาร์เซลล์'}
        </h1>

        <FAQList faqs={faqs} loading={loadingFaq} />
      </main>
    </div>
  );
}
