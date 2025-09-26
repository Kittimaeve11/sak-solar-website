'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '@/styles/about.css';
import { useLocale } from '../Context/LocaleContext';
import { usePathname } from 'next/navigation';
import { IoMdArrowDropright } from 'react-icons/io';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* ============================
   Helper ป้องกัน path พัง
============================ */
const normalizeSrc = (path) => {
  if (!path) return '/no-image.png'; // fallback กัน error
  return path.startsWith('http')
    ? path
    : `${baseUrl}/${path.replace(/^\/+/, '')}`;
};

export default function AboutPage() {
  const { locale } = useLocale();
  const pathname = usePathname();

  const [sections, setSections] = useState({
    history: null,
    vision: null,
    mission: [],
    teams: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState('history');
  const [showTeams, setShowTeams] = useState(false);

  const observerRef = useRef(null);

  /* ============================
     Fetch API
  ============================= */
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchAll() {
      try {
        const endpoints = [
          fetch(`${baseUrl}/api/branderIDapi/12`, { headers: { 'X-API-KEY': apiKey }, signal }),
          fetch(`${baseUrl}/api/branderIDapi/7`, { headers: { 'X-API-KEY': apiKey }, signal }),
          fetch(`${baseUrl}/api/misstionapi`, { headers: { 'X-API-KEY': apiKey }, signal }),
          fetch(`${baseUrl}/api/teamsapi`, { headers: { 'X-API-KEY': apiKey }, signal }),
        ];

        const [historyRes, visionRes, missionRes, teamsRes] = await Promise.allSettled(endpoints);

        const historyData =
          historyRes.status === 'fulfilled' ? await historyRes.value.json() : { data: null };
        const visionData =
          visionRes.status === 'fulfilled' ? await visionRes.value.json() : { data: null };
        const missionData =
          missionRes.status === 'fulfilled' ? await missionRes.value.json() : { status: false };
        const teamsData =
          teamsRes.status === 'fulfilled' ? await teamsRes.value.json() : { status: false };

        setSections({
          history: historyData?.data || null,
          vision: visionData?.data || null,
          mission: missionData?.status && missionData?.result ? missionData.result : [],
          teams: teamsData?.status && teamsData?.result ? teamsData.result : [],
        });
      } catch (error) {
        if (error.name !== 'AbortError') console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
    return () => controller.abort();
  }, [locale]);

  /* ============================
     Scroll ไปยัง Section (คลิกเมนู)
  ============================= */
  const scrollToSection = (id) => {
    setSelectedMenu(id);
    setShowTeams(id === 'teams');

    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleMenuClick = (e, menu) => {
    e.preventDefault();
    scrollToSection(menu);
  };

  /* ============================
     Intersection Observer (อัปเดตเมนูตาม scroll)
  ============================= */
  useEffect(() => {
    const sectionIds = ['history', 'vision', 'mission', 'teams'];
    const options = {
      root: null,
      rootMargin: '0px 0px -60% 0px', // ให้เปลี่ยน active ตอน section เข้ามากลางจอ
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          setSelectedMenu(id);
          setShowTeams(id === 'teams');
        }
      });
    }, options);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  /* ============================
     Render Section
  ============================= */
  const renderSection = (content) => {
    if (!content) return null;
    return (
      <div className="banner-container fade-in show">
        <div className="banner-image-wrapper">
          <picture>
            <source srcSet={normalizeSrc(content?.brander_pictureMoblie)} media="(max-width: 768px)" />
            <Image
              src={normalizeSrc(content?.brander_picturePC)}
              alt={(locale === 'th' ? content?.brander_title : content?.brander_titleEN) || 'Image'}
              fill
              className="banner-image"
              priority
            />
          </picture>
        </div>
        {(locale === 'th'
          ? content?.brander_detail
          : content?.brander_detailEN || content?.brander_detail
        )
          ?.split('\n')
          .map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
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
                className={selectedMenu === menu ? 'active' : ''}
                onClick={(e) => handleMenuClick(e, menu)}
                scroll={false}
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

      {/* Content */}
      <section className="about-content">
        {loading ? (
          <div className="skeleton-banner"></div>
        ) : (
          <>
            {/* 3 เนื้อหาแรก */}
            <div className={`content-sections ${showTeams ? 'hidden-section' : ''}`}>
              <h2 id="history" className="about-title with-lines">
                {locale === 'th' ? 'ประวัติความเป็นมา' : 'History'}
              </h2>
              {renderSection(sections.history)}

              <h2 id="vision" className="about-title with-lines">
                {locale === 'th' ? 'วิสัยทัศน์' : 'Vision'}
              </h2>
              {renderSection(sections.vision)}

              <h2 id="mission" className="about-title with-lines">
                {locale === 'th' ? 'พันธกิจ' : 'Mission'}
              </h2>
              <ul className="mission-list fade-in show">
                {sections.mission.map((item, index) => (
                  <li key={item.mission_ID || `mission-${index}`} className="mission-item">
                    {item.picture && (
                      <Image
                        src={normalizeSrc(item.picture)}
                        alt="พันธกิจ"
                        width={90}
                        height={90}
                        className="mission-icon"
                      />
                    )}
                    <span className="mission-text">
                      {locale === 'th' ? item.titleTH : item.titleEN || item.titleTH}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* คณะกรรมการ */}
            <div id="teams" className={`teams-section ${showTeams ? 'fade-in show' : 'hidden-section'}`}>
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
