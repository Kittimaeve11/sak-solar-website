'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import '@/styles/editorial.css';
import { IoIosArrowBack, IoIosArrowForward, IoIosArrowDown } from 'react-icons/io';
import { FaArrowRightLong } from "react-icons/fa6";
import { useLocale } from '../Context/LocaleContext';

// อ่านค่าจาก .env
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* =========================================================
   ฟังก์ชันบันทึก Log ไป Backend
   ========================================================= */
const handleLogClick = async (item) => {
  try {
    const logData = {
      actionType: '2', // 2 = ดูบทความ
      actionDetail: `หน้าบทความ รหัสบทความ: ${item.editoria_id ?? '-'} หมายเลขบทความ: ${item.editoria_num ?? '-'} ชื่อบทความ: ${item.editoria_titieTH ?? '-'}`,
      typeUser: 'ผู้เยี่ยมชมเว็บไซต์',
      datatype: 'บทความ',
      dataID: item.editoria_id ?? '0',
      datatypeID: item.editoria_typeID ?? '0',
      brandtype: '0', // ✅ ป้องกัน error null
      dataname: item.editoria_titieTH ?? '-',
    };

    console.log("📤 ส่ง Log:", logData);

    const res = await fetch(`${baseUrl}/api/logWebsitepageapi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify(logData),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('❌ Log API error:', err);
    } else {
      console.log('✅ Log: บันทึกการดูบทความสำเร็จ');
    }
  } catch (err) {
    console.error('💥 เกิดข้อผิดพลาดในการบันทึก Log:', err);
  }
};


// ✅ เก็บ cache ในหน่วยความจำ
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
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [filter, setFilter] = useState('ทั้งหมด');
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [banners, setBanners] = useState([]);
  const [loadingBanner, setLoadingBanner] = useState(true);
  const [bannerLoaded, setBannerLoaded] = useState({});
  const [imgError, setImgError] = useState({});

  const router = useRouter();
  const topRef = useRef(null);

  /* =========================================================
     FETCH DATA (with cache)
  ========================================================= */
  useEffect(() => {
    document.title =
      locale === 'en'
        ? 'Editorials | Sak Siam Solar Energy Co., Ltd.'
        : 'บทความ | บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด';

    const fetchAll = async () => {
      try {
        // ✅ ถ้ามี cache และไม่เกิน 10 นาที ใช้ cache เลย
        const cacheAge = Date.now() - editorialCache.timestamp;
        if (
          editorialCache.articles &&
          editorialCache.types &&
          editorialCache.banners &&
          cacheAge < 1000 * 60 * 10
        ) {
          setArticles(editorialCache.articles);
          setTypes(editorialCache.types);
          setBanners(editorialCache.banners);
          setLoading(false);
          setLoadingBanner(false);
          setTimeout(() => setShouldAnimate(true), 50);
          return;
        }

        // ✅ โหลดใหม่จาก API
        setLoading(true);
        setLoadingBanner(true);

        const [resType, resArticles, resBanner] = await Promise.all([
          fetch(`${baseUrl}/api/edittorTypepageapi`, {
            headers: { 'X-API-KEY': apiKey },
          }),
          fetch(`${baseUrl}/api/edittorpageapi?limit=1000`, {
            headers: { 'X-API-KEY': apiKey },
          }),
          fetch(`${baseUrl}/api/branderIDapi/15`, {
            headers: { 'X-API-KEY': apiKey },
          }),
        ]);

        if (!resType.ok || !resArticles.ok || !resBanner.ok)
          throw new Error('API fetch error');

        const typeData = await resType.json();
        const articleData = await resArticles.json();
        const bannerData = await resBanner.json();

        const typeList = Array.isArray(typeData.result) ? typeData.result : [];
        const articleList = Array.isArray(articleData.result?.data)
          ? articleData.result.data
          : [];
        const bannerArray = Array.isArray(bannerData.data)
          ? bannerData.data
          : bannerData.data
            ? [bannerData.data]
            : [];

        // ✅ เก็บลง cache
        editorialCache = {
          articles: articleList,
          types: typeList,
          banners: bannerArray,
          timestamp: Date.now(),
        };

        setArticles(articleList);
        setTypes(typeList);
        setBanners(bannerArray);
      } catch (err) {
        console.error('❌ Failed to fetch editorial:', err);
        setArticles([]);
        setTypes([]);
        setBanners([]);
      } finally {
        setLoading(false);
        setLoadingBanner(false);
        setTimeout(() => setShouldAnimate(true), 50);
      }
    };

    fetchAll();
  }, [locale]);

  /* =========================================================
     PAGINATION
  ========================================================= */
  const handlePageChange = (page) => {
    if (page === currentPage) return;
    setShouldAnimate(false);
    topRef.current?.scrollIntoView({ behavior: 'auto' });
    setCurrentPage(page);
    setTimeout(() => setShouldAnimate(true), 50);
  };

  const filteredArticles =
    filter === 'ทั้งหมด'
      ? Array.isArray(articles)
        ? articles
        : []
      : Array.isArray(articles)
        ? articles.filter((item) => item.editoria_typeID === filter)
        : [];

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage) || 1;
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* =========================================================
     PAGINATION BUTTONS
  ========================================================= */
  const renderPagination = () => {
    const pages = [];
    const totalNumbers = 5;
    const totalBlocks = totalNumbers + 2;

    if (currentPage > 1)
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="btn-with-arrow"
        >
          <IoIosArrowBack className="arrow-icon" />
        </button>
      );

    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, currentPage - 2);
      const endPage = Math.min(totalPages - 1, currentPage + 2);
      if (1 < startPage)
        pages.push(
          <button
            key={1}
            onClick={() => handlePageChange(1)}
            className={currentPage === 1 ? 'active-page' : ''}
          >
            1
          </button>
        );
      if (startPage > 2)
        pages.push(<span key="start-ellipsis" className="ellipsis">...</span>);
      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={i === currentPage ? 'active-page' : ''}
          >
            {i}
          </button>
        );
      }
      if (endPage < totalPages - 1)
        pages.push(<span key="end-ellipsis" className="ellipsis">...</span>);
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={currentPage === totalPages ? 'active-page' : ''}
        >
          {totalPages}
        </button>
      );
    } else {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={i === currentPage ? 'active-page' : ''}
          >
            {i}
          </button>
        );
      }
    }

    if (currentPage < totalPages)
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="btn-with-arrow"
        >
          <IoIosArrowForward className="arrow-icon" />
        </button>
      );

    return pages;
  };

  /* =========================================================
     HELPERS
  ========================================================= */
  const parseDescription = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/^"+|"+$/g, '')
      .replace(/\\\//g, '/')
      .replace(/\\"/g, '"')
      .replace(/&nbsp;/g, ' ')
      .replace(/\\n/g, '')
      .replace(/ style="[^"]*"/g, '')
      .trim();
  };

  const getImageUrl = (galleryStr) => {
    if (!galleryStr) return '/images/no-image.jpg';
    try {
      const parsed = JSON.parse(galleryStr);
      const first = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
      if (!first) return '/images/no-image.jpg';
      const cleaned = first
        .replace(/^"+|"+$/g, '')
        .replace(/\\/g, '/')
        .replace(/\/{2,}/g, '/');
      return `${baseUrl.replace(/\/$/, '')}/${cleaned.replace(/^\//, '')}`;
    } catch {
      return '/images/no-image.jpg';
    }
  };

  /* =========================================================
     RENDER PAGE
  ========================================================= */
  return (
    <div ref={topRef} className="no-margin">
      {/* ---------------- Banner ---------------- */}
      <div className="banner-container">
        {loadingBanner && <div className="skeleton-banner" />}
        {banners.length > 0 &&
          banners.map((item) => {
            const loaded = bannerLoaded[item.brander_ID] || false;
            return (
              <picture key={item.brander_ID}>
                <source
                  srcSet={`${baseUrl.replace(/\/$/, '')}/${item.brander_pictureMoblie.replace(/^\//, '')}`}
                  media="(max-width: 768px)"
                />
                <Image
                  src={`${baseUrl.replace(/\/$/, '')}/${item.brander_picturePC.replace(/^\//, '')}`}
                  alt={item.brander_name || 'Editorial Banner'}
                  fill
                  priority
                  className="banner-image"
                  style={{ opacity: loaded ? 1 : 0 }}
                  onLoad={() =>
                    setBannerLoaded((prev) => ({
                      ...prev,
                      [item.brander_ID]: true,
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
            priority
            className="banner-image"
          />
        )}
      </div>

      {/* ---------------- Main Content ---------------- */}
      <main className="layout-editorial">
        <h1 className="headtitle">{locale === 'en' ? 'Editorials' : 'บทความ'}</h1>

        {/* ---------------- Filter ---------------- */}
        <div className="portfolio-filters">
          <label htmlFor="filter-select" className="filter-label">
            {locale === 'en'
              ? 'Select Editorial Type:'
              : 'เลือกประเภทบทความ :'}
          </label>
          <div className="filter-row">
            <div className="select-wrapper">
              <select
                id="filter-select"
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-dropdown"
              >
                <option value="ทั้งหมด">
                  {locale === 'en'
                    ? 'All Editorials'
                    : 'บทความทั้งหมด'}
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

        {/* ---------------- Main Grid ---------------- */}
        {loading ? (
          <div className="editorial-grid">
            {Array.from({ length: itemsPerPage }).map((_, idx) => (
              <div className="skeleton-card" key={idx}>
                <div className="skeleton skeleton-image" />
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-data" />
                <span className="skeleton skeleton-line" />
                <span className="skeleton skeleton-line" />
              </div>
            ))}
          </div>
        ) : (
          <main
            className={`editorial-grid fade-in${shouldAnimate ? ' active' : ''
              }`}
            key={`page-${currentPage}`}
          >
            {paginatedArticles.map((item) => {
              const title =
                locale === 'en'
                  ? item.editoria_titieEN
                  : item.editoria_titieTH;
              const description =
                locale === 'en'
                  ? item.editoria_descriptionEN
                  : item.editoria_descriptionTH;
              const imgSrc = imgError[item.editoria_num]
                ? '/images/no-image.jpg'
                : getImageUrl(item.editoria_gallary);

              return (
                <div
                  key={item.editoria_num}
                  className="editorial-card"
                  onClick={async () => {
                    await handleLogClick(item); // ✅ Log ก่อน redirect
                    setTimeout(() => {
                      router.push(`/editorial/${item.editoria_num}`);
                    }, 300);
                  }}
                >
                  <div className="card-image-wrapper">
                    <Image
                      src={imgSrc}
                      alt={title}
                      fill
                      className="card-image"
                      onError={() =>
                        setImgError((prev) => ({
                          ...prev,
                          [item.editoria_num]: true,
                        }))
                      }
                    />
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{title}</h3>
                    <p className="editorial-date">
                      {new Date(item.editoria_creacteAt).toLocaleDateString(
                        locale === 'en' ? 'en-EN' : 'th-TH',
                        { day: 'numeric', month: 'long', year: 'numeric' }
                      )}
                    </p>
                    <p
                      className="card-snippet"
                      dangerouslySetInnerHTML={{
                        __html: parseDescription(description),
                      }}
                    />
                    <p className="read-more">
                      {locale === 'en' ? 'Read more' : 'อ่านเพิ่มเติม'}{' '}
                      <FaArrowRightLong />
                    </p>
                  </div>
                </div>

              );
            })}
          </main>
        )}

        {/* ---------------- Pagination ---------------- */}
        {!loading && totalPages > 1 && (
          <div className="pagination-controls">
            <div className="page-buttons">{renderPagination()}</div>
          </div>
        )}
      </main>
    </div>
  );
}
