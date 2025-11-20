'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import '@/styles/editorial.css';
import { IoIosArrowBack, IoIosArrowForward, IoIosArrowDown } from 'react-icons/io';
import { FaArrowRightLong } from 'react-icons/fa6';
import { useLocale } from '../Context/LocaleContext';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* ---------------- Log ---------------- */
const handleLogClick = async (item) => {
  try {
    const logData = {
      actionType: '2',
      actionDetail: `หน้าบทความ รหัสบทความ: ${item.editoria_id ?? '-'} หมายเลข: ${item.editoria_num ?? '-'} ชื่อบทความ: ${item.editoria_titieTH ?? '-'}`,
      typeUser: 'ผู้เยี่ยมชมเว็บไซต์',
      datatype: 'บทความ',
      dataID: item.editoria_id ?? '0',
      datatypeID: item.editoria_typeID ?? '0',
      brandtype: '0',
      dataname: item.editoria_titieTH ?? '-',
    };

    await fetch(`${baseUrl}/api/logWebsitepageapi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify(logData),
    });
  } catch (err) {
    console.error('Log error:', err);
  }
};

/* ---------------- Cache ---------------- */
let editorialCache = {
  articles: null,
  types: null,
  banners: null,
  timestamp: 0,
};

export default function EditorialListPage() {
  const locale = useLocale();
  const [articles, setArticles] = useState([]);
  const [types, setTypes] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBanner, setLoadingBanner] = useState(true);

  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [filter, setFilter] = useState('ทั้งหมด');

  const topRef = useRef(null);
  const titleRef = useRef(null); // 👈 ref สำหรับเลื่อนไปที่ H1
  const router = useRouter();
  const [pageChanging, setPageChanging] = useState(false);

  /* =========================================================
     USEEFFECT เดียว (SEO + Fetch + Device)
  ========================================================= */
  useEffect(() => {
    /* SEO */
    document.title =
      locale === 'en'
        ? 'Editorials | Sak Siam Solar Energy Co., Ltd.'
        : 'บทความ | บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด';

    /* ตรวจมือถือ */
    const updateDevice = () => setIsMobile(window.innerWidth <= 768);
    updateDevice();
    window.addEventListener('resize', updateDevice);

    /* โหลดข้อมูล */
    const load = async () => {
      try {
        const cacheAge = Date.now() - editorialCache.timestamp;
        if (
          editorialCache.articles &&
          editorialCache.types &&
          editorialCache.banners &&
          cacheAge < 10 * 60 * 1000
        ) {
          setArticles(editorialCache.articles);
          setTypes(editorialCache.types);
          setBanners(editorialCache.banners);
        } else {
          setLoading(true);
          setLoadingBanner(true);

          const [resType, resArticle, resBanner] = await Promise.all([
            fetch(`${baseUrl}/api/edittorTypepageapi`, { headers: { 'X-API-KEY': apiKey } }),
            fetch(`${baseUrl}/api/edittorpageapi?limit=1000`, { headers: { 'X-API-KEY': apiKey } }),
            fetch(`${baseUrl}/api/branderIDapi/15`, { headers: { 'X-API-KEY': apiKey } }),
          ]);

          const typeJson = await resType.json();
          const articleJson = await resArticle.json();
          const bannerJson = await resBanner.json();

          const typeList = typeJson?.result ?? [];
          const articleList = articleJson?.result?.data ?? [];
          const bannerList = Array.isArray(bannerJson?.data)
            ? bannerJson.data
            : bannerJson.data
              ? [bannerJson.data]
              : [];

          editorialCache = {
            articles: articleList,
            types: typeList,
            banners: bannerList,
            timestamp: Date.now(),
          };

          setArticles(articleList);
          setTypes(typeList);
          setBanners(bannerList);
        }
      } catch (err) {
        console.error('Editorial Load Error:', err);
        setArticles([]);
        setTypes([]);
        setBanners([]);
      } finally {
        setLoading(false);
        setLoadingBanner(false);
        /* Trigger fade-in */
        setTimeout(() => setShouldAnimate(true), 50);
      }
    };

    load();

    return () => window.removeEventListener('resize', updateDevice);
  }, [locale]);

  /* =========================================================
     PAGINATION
  ========================================================= */
  const filteredArticles =
    filter === 'ทั้งหมด'
      ? articles
      : articles.filter((a) => a.editoria_typeID === filter);

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage) || 1;

  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ฟังก์ชันเลื่อนไปที่ H1
  const scrollToTitle = () => {
    if (!titleRef.current) return;
    titleRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  // ฟังก์ชันเปลี่ยนหน้า + scroll
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    setShouldAnimate(false);     // ⛔ ปิด animation ก่อน render หน้าใหม่

    scrollToTitle();             // 🔼 เลื่อนขึ้นก่อนเปลี่ยนหน้า

    setTimeout(() => {
      setCurrentPage(page);     // 🧠 บังคับ React render หน้าใหม่
    }, 10);

    setTimeout(() => {
      setShouldAnimate(true);   // ✨ ค่อย fade-in หน้าใหม่
    }, 20);                     // ❗ต้องเร็วนิดเดียวเพื่อไม่ให้ DOM แสดงก่อน
  };


  const parseDescription = (str) => {
    if (!str || typeof str !== 'string') return '';
    try {
      return str
        .replace(/^"+|"+$/g, '')
        .replace(/\\\//g, '/')
        .replace(/\\"/g, '"')
        .replace(/&nbsp;/g, ' ')
        .replace(/\\n/g, '')
        .replace(/ style="[^"]*"/g, '')
        .trim();
    } catch (e) {
      return ''; // ⛔ กัน error ไม่ให้ Build พัง
    }
  };

  const getImageUrl = (galleryStr) => {
    if (!galleryStr) return '/images/no-image.jpg';
    try {
      const arr = JSON.parse(galleryStr);
      const first = arr?.[0];
      if (!first) return '/images/no-image.jpg';

      const cleaned = first.replace(/\\/g, '/').replace(/\/{2,}/g, '/');
      return `${baseUrl}/${cleaned.replace(/^\//, '')}`;
    } catch (err) {
      return '/images/no-image.jpg';  // ← ป้องกัน Build error
    }
  };


  /* =========================================================
     RENDER PAGE
  ========================================================= */
  return (
    <div ref={topRef} className="no-margin">
      {/* ⭐⭐⭐ BANNER ⭐⭐⭐ */}
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
                priority
                unoptimized
                sizes="100vw"
                className="banner-image"
              />
            </div>
          );
        })
      )}

      {/* ⭐⭐⭐ CONTENT ⭐⭐⭐ */}
      <main className="layout-editorial">
        {/* 👇 ผูก ref ที่ H1 */}
        <h1 ref={titleRef} className="headtitle">
          {locale === 'en' ? 'Editorials' : 'บทความ'}
        </h1>

        {/* Filter */}
        <div className="portfolio-filters">
          <label className="filter-label">
            {locale === 'en' ? 'Select Editorial Type:' : 'เลือกประเภทบทความ :'}
          </label>
          <div className="filter-row">
            <div className="select-wrapper">
              <select
                value={filter}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilter(value);
                  setCurrentPage(1);
                  // เวลาปรับ filter เลื่อนกลับไปที่หัวเรื่องด้วย
                  setTimeout(scrollToTitle, 50);
                }}
                className="filter-dropdown"
              >
                <option value="ทั้งหมด">
                  {locale === 'en' ? 'All Editorials' : 'บทความทั้งหมด'}
                </option>

                {types.map((t) => (
                  <option key={t.TypeEditoria_id} value={t.TypeEditoria_id}>
                    {locale === 'en'
                      ? t.TypeEditoria_nameEN || t.TypeEditoria_nameTH
                      : t.TypeEditoria_nameTH}
                  </option>
                ))}
              </select>
              <IoIosArrowDown className="dropdown-icon" />
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className={`editorial-grid ${pageChanging ? 'fade-in' : ''}`}>
            {Array.from({ length: itemsPerPage }).map((_, idx) => (
              <div className="skeleton-card" key={idx}>
                <div className="skeleton skeleton-image"></div>
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-data"></div>
                <div className="skeleton skeleton-line"></div>
                <div className="skeleton skeleton-line"></div>
              </div>
            ))}
          </div>
        ) : (
          <div
            key={currentPage}
            className={`editorial-grid ${shouldAnimate ? 'fade-in' : ''}`}
          >

            {paginatedArticles.map((item) => {
              const title =
                locale === 'en' ? item.editoria_titieEN : item.editoria_titieTH;
              const description =
                locale === 'en'
                  ? item.editoria_descriptionEN
                  : item.editoria_descriptionTH;

              return (
                <div
                  key={item.editoria_num}
                  className="editorial-card"
                  onClick={async () => {
                    await handleLogClick(item);
                    setTimeout(
                      () => router.push(`/editorial/${item.editoria_num}`),
                      300
                    );
                  }}
                >
                  <div className="card-image-wrapper">
                    <Image
                      src={getImageUrl(item.editoria_gallary)}
                      alt={title}
                      fill
                      className="card-image"
                      unoptimized
                    />
                  </div>

                  <div className="card-content">
                    <h3 className="card-title">{title}</h3>
                    <p className="editorial-date">
                      {item.editoria_creacteAt
                        ? new Date(item.editoria_creacteAt).toLocaleDateString(
                          locale === 'en' ? 'en-US' : 'th-TH',
                          { day: 'numeric', month: 'long', year: 'numeric' }
                        )
                        : ''}
                    </p>
                    <p
                      className="card-snippet"
                      dangerouslySetInnerHTML={{ __html: parseDescription(description) }}
                    ></p>

                    <p className="read-more">
                      {locale === 'en' ? 'Read more' : 'อ่านเพิ่มเติม'}{' '}
                      <FaArrowRightLong />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="pagination-controls">
            <div className="page-buttons">
              {currentPage > 1 && (
                <button
                  className="btn-with-arrow"
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <IoIosArrowBack />
                </button>
              )}

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={currentPage === i + 1 ? 'active-page' : ''}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              {currentPage < totalPages && (
                <button
                  className="btn-with-arrow"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <IoIosArrowForward />
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
