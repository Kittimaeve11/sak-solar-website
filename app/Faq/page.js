'use client';

import { useEffect, useRef, useState } from 'react';
import '../../styles/faq.css';
import { MdOutlineArrowForwardIos } from 'react-icons/md';
import Image from 'next/image';
import { useLocale } from '../Context/LocaleContext';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  const [banners, setBanners] = useState([]);
  const [loadingBanner, setLoadingBanner] = useState(true);
  const [fadeInBanner, setFadeInBanner] = useState(false);

  const [loadingFaq, setLoadingFaq] = useState(true);
  const [fadeInFaq, setFadeInFaq] = useState(false);

  const answerRefs = useRef([]);
  const { locale } = useLocale();

  useEffect(() => {
    const loc = typeof locale === 'string' ? locale.toLowerCase() : 'th';
    const isThai = loc.startsWith('th');

    // ---------- SEO ----------
    document.title = isThai
      ? 'คำถามที่พบบ่อย | บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด'
      : 'FAQ | Sak Siam Solar Energy Co., Ltd.';

    const metaDescription = document.querySelector("meta[name='description']");
    const content = isThai ? 'คำถามที่พบบ่อย' : 'Frequently Asked Questions';
    if (metaDescription) {
      metaDescription.setAttribute('content', content);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = content;
      document.head.appendChild(meta);
    }

    /* =========================================================
       ✅ โหลดข้อมูลเพียงครั้งเดียว (ใช้ cache)
       ========================================================= */
    const fetchData = async () => {
      // --- FAQ ---
      if (window.__FAQ_CACHE__) {
        console.log('♻️ ใช้ข้อมูล FAQ จาก cache');
        setFaqs(window.__FAQ_CACHE__);
        setLoadingFaq(false);
        setFadeInFaq(true);
      } else {
        console.log('🌞 โหลด FAQ จาก API...');
        try {
          setLoadingFaq(true);
          const resFaq = await fetch(`${baseUrl}/api/FQAapi`, {
            headers: { 'X-API-KEY': apiKey },
          });
          const dataFaq = await resFaq.json();
          const faqResult = dataFaq.status && dataFaq.result ? dataFaq.result : [];
          window.__FAQ_CACHE__ = faqResult; // ✅ เก็บใน cache
          setFaqs(faqResult);
        } catch {
          setFaqs([]);
        } finally {
          setLoadingFaq(false);
          setFadeInFaq(true);
        }
      }

      // --- Banner ---
      if (window.__BANNER_FAQ_CACHE__) {
        console.log('♻️ ใช้ข้อมูล Banner จาก cache');
        setBanners(window.__BANNER_FAQ_CACHE__);
        setLoadingBanner(false);
        setFadeInBanner(true);
      } else {
        console.log('🌞 โหลด Banner จาก API...');
        try {
          setLoadingBanner(true);
          const resBanner = await fetch(`${baseUrl}/api/branderIDapi/1`, {
            headers: { 'X-API-KEY': apiKey },
          });
          const dataBanner = await resBanner.json();
          const arr = Array.isArray(dataBanner.data)
            ? dataBanner.data
            : dataBanner.data
              ? [dataBanner.data]
              : [];
          window.__BANNER_FAQ_CACHE__ = arr; // ✅ เก็บใน cache
          setBanners(arr);
        } catch {
          setBanners([]);
        } finally {
          setLoadingBanner(false);
          setTimeout(() => setFadeInBanner(true), 50);
        }
      }
    };

    fetchData();
  }, [locale]);

  const toggle = (index) => setOpenIndex((prev) => (prev === index ? null : index));

  // เปิด/ปิดคำตอบแบบ dynamic
  useEffect(() => {
    answerRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i === openIndex) {
        el.style.maxHeight = el.scrollHeight + 'px';
        el.style.paddingTop = '1rem';
        el.style.paddingBottom = '1rem';
      } else {
        el.style.maxHeight = '0px';
        el.style.paddingTop = '0';
        el.style.paddingBottom = '0';
      }
    });
  }, [openIndex, faqs]);

  const cleanHtml = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/^"|"$/g, '')
      .replace(/\\\//g, '/')
      .replace(/\\"/g, '"')
      .replace(/\\n/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/ style="[^"]*"/g, '')
      .replace(/<br\s*\/?>/gi, '<br/>')
      .trim();
  };

  const SkeletonFaq = () => (
    <div className="faq-skeleton-card">
      <div className="faq-skeleton-question skeleton" />
      <div className="faq-skeleton-answer" />
    </div>
  );

  /* =========================================================
     🖼 ส่วนแสดงผล
     ========================================================= */
  return (
    <div className="no-margin">
      {/* Banner */}
      {loadingBanner ? (
        <div className="skeleton-banner"></div>
      ) : (
        banners.map((item) => (
          <div
            key={item.brander_ID}
            className={`banner-container ${fadeInBanner ? 'fade-in' : ''}`}
          >
            <picture>
              <source
                srcSet={`${baseUrl}/${item.brander_pictureMoblie}`}
                media="(max-width: 768px)"
              />
              <Image
                src={`${baseUrl}/${item.brander_picturePC}`}
                alt={item.brander_name || 'Banner Image'}
                width={1530}
                height={800}
                className="banner-image"
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                unoptimized
              />
            </picture>
          </div>
        ))
      )}

      {/* FAQ */}
      <main className={`layout-faq ${fadeInFaq ? 'fade-in' : ''}`}>
        <h1 className="headtitle">คำถามที่พบบ่อยเกี่ยวกับโซลาร์เซลล์</h1>

        {loadingFaq
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonFaq key={i} />)
          : faqs.map((item, index) => (
              <div key={item.fqa_id} className="faq-item">
                <button
                  onClick={() => toggle(index)}
                  className="faq-button"
                  type="button"
                >
                  {cleanHtml(item.fqa_questionTH)}
                  <span className={`faq-icon ${openIndex === index ? 'open' : ''}`}>
                    <MdOutlineArrowForwardIos />
                  </span>
                </button>
                <div
                  ref={(el) => (answerRefs.current[index] = el)}
                  className="faq-answer"
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: cleanHtml(item.fqa_answersTH),
                    }}
                  />
                </div>
              </div>
            ))}
      </main>
    </div>
  );
}
