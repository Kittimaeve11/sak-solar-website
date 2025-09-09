'use client';

import { useEffect, useRef, useState } from 'react';
import '../../styles/faq.css';
import { MdOutlineArrowForwardIos } from 'react-icons/md';
import Image from 'next/image';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);

  // ---------------- Banner ----------------
  const [banners, setBanners] = useState([]);
  const [loadingBanner, setLoadingBanner] = useState(true);
  const [bannerLoaded, setBannerLoaded] = useState({});

  // ---------------- FAQ ----------------
  const [loadingFaq, setLoadingFaq] = useState(true);
  const answerRefs = useRef([]);

  // ---------------- Fetch Data ----------------
  useEffect(() => {
    const fetchFaqs = async () => {
      setLoadingFaq(true);
      setFadeIn(false);
      try {
        const res = await fetch(`${baseUrl}/api/FQAapi`, {
          headers: { 'X-API-KEY': apiKey },
        });
        const data = await res.json();
        setFaqs(data.status && data.result ? data.result : []);
      } catch {
        setFaqs([]);
      } finally {
        setLoadingFaq(false);
        setTimeout(() => setFadeIn(true), 100);
      }
    };

    const fetchBanner = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/branderIDapi/1`, {
          headers: { 'X-API-KEY': apiKey },
        });
        const data = await res.json();
        const branderArray = Array.isArray(data.data)
          ? data.data
          : data.data
            ? [data.data]
            : [];
        setBanners(branderArray);
      } catch {
        setBanners([]);
      } finally {
        setLoadingBanner(false);
      }
    };

    fetchFaqs();
    fetchBanner();
  }, []);

  // ---------------- Toggle Answer ----------------
  const toggle = (index) => setOpenIndex(prev => (prev === index ? null : index));

  useEffect(() => {
    answerRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i === openIndex) {
        el.style.maxHeight = el.scrollHeight + 'px';
        el.style.paddingTop = '0.5rem';
        el.style.paddingBottom = '0.5rem';
      } else {
        el.style.maxHeight = '0px';
        el.style.paddingTop = '0';
        el.style.paddingBottom = '0';
      }
    });
  }, [openIndex, faqs]);

  // ---------------- Clean HTML ----------------
  const cleanHtml = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/^"|"$/g, '')
      .replace(/\\\//g, '/')
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/ style="[^"]*"/g, '')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<p>/g, '<p style="margin:0; padding:0">')
      .replace(/<li>/g, '<li style="margin:0; padding:0">')
      .trim();
  };

  // ---------------- Skeleton ----------------
  const SkeletonFaq = () => (
    <div className="faq-skeleton-card">
      <div className="faq-skeleton-question skeleton" />
      <div className="faq-skeleton-answer"></div>
    </div>
  );

  // ---------------- Render ----------------
  return (
    <div className="no-margin">
      {/* ---------------- Banner ---------------- */}
      <div
        style={{
          width: '100%',
          aspectRatio: '3.22/1',
          position: 'relative',
          marginBottom: '1rem'
        }}
      >
        {loadingBanner && (
          <div
            className="skeleton-banner"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          />
        )}

        {banners.length > 0 &&
          banners.map((item) => {
            const loaded = bannerLoaded[item.brander_ID] || false;
            return (
              <picture
                key={item.brander_ID}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}
              >
                <source
                  srcSet={`${baseUrl}/${item.brander_pictureMoblie}`}
                  media="(max-width: 768px)"
                />
                <Image
                  src={`${baseUrl}/${item.brander_picturePC}`}
                  alt={item.brander_name || 'Editorial Banner'}
                  fill
                  style={{
                    objectFit: 'cover',
                    opacity: loaded ? 1 : 0,
                    transition: 'opacity 0.5s ease'
                  }}
                  onLoadingComplete={() =>
                    setBannerLoaded((prev) => ({
                      ...prev,
                      [item.brander_ID]: true
                    }))
                  }
                  unoptimized
                />
              </picture>
            );
          })}

        {!loadingBanner && banners.length === 0 && (
          <Image
            src="/images/no-image.jpg"
            alt="Banner fallback"
            fill
            style={{ objectFit: 'cover' }}
          />
        )}
      </div>

      {/* ---------------- FAQ ---------------- */}
      <main className={`layout-faq ${fadeIn ? 'fade-in' : ''}`}>
        <h1 className="headtitle">คำถามที่พบบ่อยเกี่ยวกับโซลาร์เซลล์</h1>

        {loadingFaq
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonFaq key={i} />)
          : faqs.map((item, index) => (
              <div
                key={item.fqa_id}
                className={`faq-item ${openIndex === index ? 'open' : ''}`}
              >
                <button
                  onClick={() => toggle(index)}
                  className="faq-button"
                  type="button"
                >
                  {cleanHtml(item.fqa_questionTH)}
                  <span
                    className={`faq-icon ${
                      openIndex === index ? 'open' : ''
                    }`}
                  >
                    <MdOutlineArrowForwardIos />
                  </span>
                </button>
                <div
                  ref={(el) => (answerRefs.current[index] = el)}
                  className={`faq-answer ${
                    openIndex === index ? 'open' : ''
                  }`}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: cleanHtml(item.fqa_answersTH)
                    }}
                  />
                </div>
              </div>
            ))}
            
      </main>
    </div>
  );
}
