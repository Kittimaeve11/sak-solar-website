'use client';

import { useEffect, useRef, useState } from 'react';
import '../../styles/faq.css';
import { MdOutlineArrowForwardIos } from 'react-icons/md';
import Image from 'next/image';
import { useLocale } from '../Context/LocaleContext';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

// Banner Cache กันกระพริบ
let bannerCache = null;

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [banners, setBanners] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  const [loadingFaq, setLoadingFaq] = useState(true);
  const [loadingBanner, setLoadingBanner] = useState(true);

  const locale = useLocale();
  const answerRefs = useRef([]);
  const [isMobile, setIsMobile] = useState(false);

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
      useEffect เดียว — SEO + Fetch API
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

  /* -------- Clean HTML -------- */
  const cleanHtml = (str) =>
    (!str || typeof str !== 'string'
      ? ''
      : str
          .replace(/^"|"$/g, '')
          .replace(/\\\//g, '/')
          .replace(/\\"/g, '"')
          .replace(/\\n/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/ style="[^"]*"/g, '')
          .replace(/<br\s*\/?>/gi, '<br/>')
    ).trim();

  /* -------- Skeleton -------- */
  const SkeletonFaq = () => (
    <div className="faq-skeleton-card fade-in">
      <div className="faq-skeleton-question skeleton" />
      <div className="faq-skeleton-answer skeleton" />
    </div>
  );

  return (
    <div className="no-margin">

      {/* ================= Banner ================= */}
      {loadingBanner ? (
        <div className="skeleton skeleton-banner fade-in"></div>
      ) : (
        banners.map((b) => {
          const imgSrc = isMobile
            ? `${baseUrl}/${b.brander_pictureMoblie}`
            : `${baseUrl}/${b.brander_picturePC}`;

          return (
            <div key={b.brander_ID} className="banner-container fade-in">
              <Image
                src={imgSrc}
                alt={b.brander_name}
                fill
                className="banner-image"
                unoptimized
                priority
                sizes="100vw"
              />
            </div>
          );
        })
      )}

      {/* ================= FAQ ================= */}
      <main className="layout-faq fade-in">
        <h1 className="headtitle">คำถามที่พบบ่อยเกี่ยวกับโซลาร์เซลล์</h1>

        {loadingFaq
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonFaq key={i} />)
          : faqs.map((item, index) => {
              const isOpen = openIndex === index;

              return (
                <div key={item.fqa_id} className="faq-item fade-in">
                  <button
                    className="faq-button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    {cleanHtml(item.fqa_questionTH)}
                    <span className={`faq-icon ${isOpen ? 'open' : ''}`}>
                      <MdOutlineArrowForwardIos />
                    </span>
                  </button>

                  <div
                    className="faq-answer"
                    ref={(el) => (answerRefs.current[index] = el)}
                    style={{
                      maxHeight: isOpen
                        ? answerRefs.current[index]?.scrollHeight
                        : 0,
                      padding: isOpen ? '1rem 3rem' : '0 3rem',
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: cleanHtml(item.fqa_answersTH),
                      }}
                    />
                  </div>
                </div>
              );
            })}
      </main>
    </div>
  );
}
