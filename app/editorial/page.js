'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import '@/styles/editorial.css';
import { IoIosArrowBack, IoIosArrowForward, IoIosArrowDown } from 'react-icons/io';
import { FaArrowRightLong } from "react-icons/fa6";
import { useLocale } from '../Context/LocaleContext';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function EditorialListPage() {
  const locale = useLocale(); // 'th' หรือ 'en'
  const [articles, setArticles] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [filter, setFilter] = useState('ทั้งหมด');
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [banners, setBanners] = useState([]);
  const [loadingBanner, setLoadingBanner] = useState(true);
  const [bannerLoaded, setBannerLoaded] = useState({}); // track การโหลดแต่ละ Banner

  const router = useRouter();
  const topRef = useRef(null);

  // ---------------- Fetch Articles, Types & Banner ----------------
  useEffect(() => {
    document.title = locale === 'en' 
      ? 'Editorials | Sak Siam Solar Energy Co., Ltd.' 
      : 'บทความ | บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด';

    const fetchAll = async () => {
      setLoading(true);
      setLoadingBanner(true);

      try {
        const [resType, resArticles, resBanner] = await Promise.all([
          fetch(`${baseUrl}/api/edittorTypepageapi`, { headers: { 'X-API-KEY': apiKey } }),
          fetch(`${baseUrl}/api/edittorpageapi`, { headers: { 'X-API-KEY': apiKey } }),
          fetch(`${baseUrl}/api/branderIDapi/15`, { headers: { 'X-API-KEY': apiKey } }),
        ]);

        if (!resType.ok) throw new Error(`Type API failed: ${resType.status}`);
        if (!resArticles.ok) throw new Error(`Main API failed: ${resArticles.status}`);
        if (!resBanner.ok) throw new Error(`Banner API failed: ${resBanner.status}`);

        const typeData = await resType.json();
        const articleData = await resArticles.json();
        const bannerData = await resBanner.json();

        setTypes(typeData.result || []);
        setArticles(Array.isArray(articleData.result?.data) ? articleData.result.data : []);
        const bannerArray = Array.isArray(bannerData.data) ? bannerData.data : (bannerData.data ? [bannerData.data] : []);
        setBanners(bannerArray);

        setLoading(false);
        setLoadingBanner(false);
        setTimeout(() => setShouldAnimate(true), 50);
      } catch (err) {
        console.error('Failed to fetch editorial:', err);
        setArticles([]);
        setTypes([]);
        setBanners([]);
        setLoading(false);
        setLoadingBanner(false);
      }
    };

    fetchAll();
  }, [locale]);

  // ---------------- Pagination ----------------
  const handlePageChange = (page) => {
    if (page === currentPage) return;
    setShouldAnimate(false);
    topRef.current?.scrollIntoView({ behavior: 'auto' });
    setCurrentPage(page);
    setTimeout(() => setShouldAnimate(true), 50);
  };

  const filteredArticles = filter === 'ทั้งหมด'
    ? Array.isArray(articles) ? articles : []
    : Array.isArray(articles) ? articles.filter((item) => item.editoria_typeID === filter) : [];

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage) || 1;
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderPagination = () => {
    const pages = [];
    const totalNumbers = 5;
    const totalBlocks = totalNumbers + 2;

    if (currentPage > 1) pages.push(
      <button key="prev" onClick={() => handlePageChange(currentPage - 1)} className="btn-with-arrow">
        <IoIosArrowBack className="arrow-icon" />
      </button>
    );

    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, currentPage - 2);
      const endPage = Math.min(totalPages - 1, currentPage + 2);
      if (1 < startPage) pages.push(<button key={1} onClick={() => handlePageChange(1)} className={currentPage === 1 ? 'active-page' : ''}>1</button>);
      if (startPage > 2) pages.push(<span key="start-ellipsis" className="ellipsis">...</span>);
      for (let i = startPage; i <= endPage; i++) pages.push(
        <button key={i} onClick={() => handlePageChange(i)} className={i === currentPage ? 'active-page' : ''}>{i}</button>
      );
      if (endPage < totalPages - 1) pages.push(<span key="end-ellipsis" className="ellipsis">...</span>);
      pages.push(<button key={totalPages} onClick={() => handlePageChange(totalPages)} className={currentPage === totalPages ? 'active-page' : ''}>{totalPages}</button>);
    } else {
      for (let i = 1; i <= totalPages; i++) pages.push(
        <button key={i} onClick={() => handlePageChange(i)} className={i === currentPage ? 'active-page' : ''}>{i}</button>
      );
    }

    if (currentPage < totalPages) pages.push(
      <button key="next" onClick={() => handlePageChange(currentPage + 1)} className="btn-with-arrow">
        <IoIosArrowForward className="arrow-icon" />
      </button>
    );

    return pages;
  };

  // ---------------- Helper Functions ----------------
  function parseDescription(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/^"+|"+$/g, '')
      .replace(/\\\//g, '/')
      .replace(/\\"/g, '"')
      .replace(/&nbsp;/g, ' ')
      .replace(/\\n/g, '')
      .replace(/ style="[^"]*"/g, '')
      .trim();
  }

  const getImageUrl = (path) => {
    if (!path) return '/images/no-image.jpg';
    const cleaned = path.replace(/^"+|"+$/g, '').replace(/\\/g, '/').replace(/\/{2,}/g, '/');
    return `${baseUrl}/${cleaned}`;
  };

  return (
    <div ref={topRef} className="no-margin">
      {/* ---------------- Banner ---------------- */}
      <div style={{ width: '100%', aspectRatio: '3.22/1', position: 'relative', marginBottom: '1rem' }}>
        {loadingBanner && <div className="skeleton-banner" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />}

        {banners.length > 0 && banners.map(item => {
          const loaded = bannerLoaded[item.brander_ID] || false;
          return (
            <picture key={item.brander_ID} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
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
                  setBannerLoaded(prev => ({ ...prev, [item.brander_ID]: true }))
                }
                unoptimized
              />
            </picture>
          );
        })}

        {(!loadingBanner && banners.length === 0) && (
          <Image
            src="/images/no-image.jpg"
            alt="Banner fallback"
            fill
            style={{ objectFit: 'cover' }}
          />
        )}
      </div>

      <main className="layout-container">
        <h1 className="headtitle">{locale === 'en' ? 'Editorials' : 'บทความ'}</h1>

        {/* ---------------- Filter ---------------- */}
        <div className="portfolio-filters">
          <label htmlFor="filter-select" className="filter-label">{locale === 'en' ? 'Select Editorial Type:' : 'เลือกประเภทบทความ :'}</label>
          <div className="filter-row">
            <div className="select-wrapper">
              <select
                id="filter-select"
                value={filter}
                onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
                className="filter-dropdown"
              >
                <option value="ทั้งหมด">{locale === 'en' ? 'All Editorials' : 'บทความทั้งหมด'}</option>
                {types.map((t) => (
                  <option key={t.TypeEditoria_id} value={t.TypeEditoria_id}>
                    {locale === 'en' ? t.TypeEditoria_nameEN || t.TypeEditoria_nameTH : t.TypeEditoria_nameTH}
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
          <main className={`editorial-grid fade-in${shouldAnimate ? ' active' : ''}`} key={`page-${currentPage}`}>
            {paginatedArticles.map((item) => {
              const title = locale === 'en' ? item.editoria_titieEN : item.editoria_titieTH;
              const description = locale === 'en' ? item.editoria_descriptionEN : item.editoria_descriptionTH;

              return (
                <div key={item.editoria_num} className="editorial-card" onClick={() => router.push(`/editorial/${item.editoria_num}`)}>
                  <Image
                    src={getImageUrl(item.editoria_gallary)}
                    alt={title}
                    width={400}
                    height={200}
                    className="card-image"
                    onError={(e) => { e.currentTarget.src = '/images/no-image.jpg'; }}
                  />
                  <div className="card-content">
                    <h3 className="card-title">{title}</h3>
                    <p className="editorial-date">
                      {new Date(item.editoria_creacteAt).toLocaleDateString(
                        locale === 'en' ? "en-EN" : "th-TH",
                        { day: "numeric", month: "long", year: "numeric" }
                      )}
                    </p>
                    <p className="card-snippet" dangerouslySetInnerHTML={{ __html: parseDescription(description) }} />
                    <p className="read-more">{locale === 'en' ? 'Read more' : 'อ่านเพิ่มเติม'} <FaArrowRightLong /></p>
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
