'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '@/styles/about.css';
import { useLocale } from '../Context/LocaleContext';
import { IoMdArrowDropright } from 'react-icons/io';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* ====================== 🟢 Simple Cache Helper ====================== */
const getCache = (key, maxAgeMinutes = 30) => {
  if (typeof window === 'undefined') return null;
  const cached = sessionStorage.getItem(key);
  if (!cached) return null;

  const { data, timestamp } = JSON.parse(cached);
  return Date.now() - timestamp < maxAgeMinutes * 60 * 1000 ? data : null;
};

const setCache = (key, data) => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(
    key,
    JSON.stringify({ data, timestamp: Date.now() })
  );
};

/* ====================== Normalize Image URL ====================== */
const normalizeSrc = (path) => {
  if (!path) return '/no-image.png';
  return path.startsWith('http') ? path : `${baseUrl}/${path.replace(/^\/+/, '')}`;
};

export default function AboutPage() {
  const { locale } = useLocale();
  const [sections, setSections] = useState({
    history: null,
    vision: null,
    mission: [],
    teams: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState('history');

  /* ====================== Fetch Data with Cache ====================== */
  useEffect(() => {
    const cacheKey = `ABOUT_PAGE_CACHE_${locale}`; // 👈 แยก cache ตามภาษา
    const cachedData = getCache(cacheKey);

    if (cachedData) {
      setSections(cachedData);
      setLoading(false);
      return;
    }

    async function fetchAll() {
      try {
        const [history, vision, mission, teams] = await Promise.all([
          fetch(`${baseUrl}/api/branderIDapi/12`, { headers: { 'X-API-KEY': apiKey } }),
          fetch(`${baseUrl}/api/branderIDapi/7`, { headers: { 'X-API-KEY': apiKey } }),
          fetch(`${baseUrl}/api/misstionapi`, { headers: { 'X-API-KEY': apiKey } }),
          fetch(`${baseUrl}/api/teamsapi`, { headers: { 'X-API-KEY': apiKey } }),
        ]);

        const data = {
          history: (await history.json()).data,
          vision: (await vision.json()).data,
          mission: (await mission.json()).result || [],
          teams: (await teams.json()).result || [],
        };

        setSections(data);
        setCache(cacheKey, data); // ⭐ เก็บ cache
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [locale]);

  /* ====================== Scroll Menu ====================== */
  const scrollToSection = (id) => {
    setSelectedMenu(id);

    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const headerOffset = 120;
        const position = el.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: position, behavior: 'smooth' });
      }
    }, 50);
  };

/* ====================== Observer Highlight Menu ====================== */
useEffect(() => {
  if (loading) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setSelectedMenu(entry.target.id);
        }
      });

      // ⭐ ถ้าเลื่อนกลับไปบนสุด ให้ active = history เสมอ
      if (window.scrollY < 200) {
        setSelectedMenu("history");
      }
    },
    {
      root: null,
      threshold: 0.3,          // 👈 จับเร็วขึ้น (เดิม 0.55)
      rootMargin: '-10% 0px -65% 0px', // 👈 ปรับให้ section บนไม่ถูกแย่ง
    }
  );

  document
    .querySelectorAll('.about-section')
    .forEach((section) => observer.observe(section));

  return () => observer.disconnect();
}, [loading]);


  /* ====================== Render Content ====================== */
  const renderSection = (content, sectionType) => {
    if (!content) return null;

    const sizes = {
      history: { width: 919, height: 519 },
      vision: { width: 1600, height: 457 },
      default: { width: 1200, height: 600 },
    };

    const img = sizes[sectionType] || sizes.default;

    return (
      <div className="bannerabout-container fade-in show">
        <div className={`bannerabout-image-wrapper-custom image-${sectionType}`}>
          <Image
            src={normalizeSrc(content?.brander_picturePC)}
            alt={sectionType}
            width={img.width}
            height={img.height}
            className="bannerabout-image-custom"
            priority={sectionType === 'history'}
          />
        </div>

        {(locale === 'th'
          ? content?.brander_detail
          : content?.brander_detailEN || content?.brander_detail
        )
          ?.split('\n')
          .map((line, idx) => <p key={idx}>{line}</p>)}
      </div>
    );
  };

  return (
    <main className="about-container">
      {/* Sidebar */}
      <aside className="about-sidebar">
        <h3 className="sidebar-header">
          {locale === 'th' ? 'เกี่ยวกับศักดิ์สยามโซลาร์' : 'About Saksiam Solar'}
        </h3>
        <ul className="sidebar-menu">
          {['history', 'vision', 'mission', 'teams'].map((menu) => (
            <li key={menu}>
              <Link
                href={`#${menu}`}
                scroll={false}
                className={selectedMenu === menu ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(menu);
                }}
              >
                <IoMdArrowDropright className="arrow" />
                {locale === 'th'
                  ? {
                    history: 'ประวัติความเป็นมา',
                    vision: 'วิสัยทัศน์',
                    mission: 'พันธกิจ',
                    teams: 'คณะกรรมการ',
                  }[menu]
                  : {
                    history: 'History',
                    vision: 'Vision',
                    mission: 'Mission',
                    teams: 'Committee',
                  }[menu]}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Content Sections */}
      <section className="about-content">
        {loading ? (
          <div className="skeleton-bannerabout"></div>
        ) : (
          <>
            {/* 🟠 กลุ่ม Content (History, Vision, Mission) */}
            <div className={`content-sections ${selectedMenu === 'teams' ? 'hidden-section' : ''}`}>

              {/* HISTORY */}
              <section id="history" className="about-section">
                <h2 className="about-title with-lines">
                  {locale === 'th' ? 'ประวัติความเป็นมา' : 'History'}
                </h2>
                {renderSection(sections.history, 'history')}
              </section>

              {/* VISION */}
              <section id="vision" className="about-section">
                <h2 className="about-title with-lines">
                  {locale === 'th' ? 'วิสัยทัศน์' : 'Vision'}
                </h2>
                {renderSection(sections.vision, 'vision')}
              </section>

              {/* MISSION */}
              <section id="mission" className="about-section">
                <h2 className="about-title with-lines">
                  {locale === 'th' ? 'พันธกิจ' : 'Mission'}
                </h2>
                <ul className="mission-list fade-in show">
                  {sections.mission.map((item, index) => (
                    <li key={item.mission_ID || index} className="mission-item">
                      {item.picture && (
                        <Image
                          src={normalizeSrc(item.picture)}
                          alt="พันธกิจ"
                          width={90}
                          height={90}
                          className="mission-icon"
                          loading="lazy"
                        />
                      )}
                      <span className="mission-text">
                        {locale === 'th' ? item.titleTH : item.titleEN || item.titleTH}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* 🟢 TEAMS — แสดงเดี่ยวเต็มหน้า */}
            <div id="teams" className={`teams-section ${selectedMenu === 'teams' ? 'fade-in show' : 'hidden-section'}`}>
              <h2 className="about-title with-lines">
                {locale === 'th' ? 'คณะกรรมการ' : 'Committee'}
              </h2>
              <div className="teams-grid">
                {sections.teams.map((member, idx) => (
                  <div key={member.teamsID || idx} className={idx === 0 ? 'team-boss' : 'team-card'}>
                    <Image
                      src={normalizeSrc(member.teams_picture)}
                      alt={locale === 'th' ? member.teams_nameTH : member.teams_nameEN}
                      width={300}
                      height={300}
                      className="team-image"
                      loading="lazy"
                    />
                    <div className="team-info">
                      <p className="team-name">
                        {locale === 'th' ? member.teams_nameTH : member.teams_nameEN}
                      </p>
                      <p className="team-position">
                        {locale === 'th' ? member.teams_positionTH : member.teams_positionEN}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
