'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '@/styles/about.css';
import { useLocale } from '../Context/LocaleContext';
import { usePathname } from 'next/navigation';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

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

  // Fetch data
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchAll() {
      try {
        const [historyRes, visionRes, missionRes, teamsRes] = await Promise.all([
          fetch(`${baseUrl}/api/branderIDapi/12`, { headers: { 'X-API-KEY': apiKey }, signal }),
          fetch(`${baseUrl}/api/branderIDapi/7`, { headers: { 'X-API-KEY': apiKey }, signal }),
          fetch(`${baseUrl}/api/misstionapi`, { headers: { 'X-API-KEY': apiKey }, signal }),
          fetch(`${baseUrl}/api/teamsapi`, { headers: { 'X-API-KEY': apiKey }, signal }),
        ]);

        const historyData = await historyRes.json();
        const visionData = await visionRes.json();
        const missionData = await missionRes.json();
        const teamsData = await teamsRes.json();

        setSections({
          history: historyData?.data || null,
          vision: visionData?.data || null,
          mission: missionData.status && missionData.result ? missionData.result : [],
          teams: teamsData.status && teamsData.result ? teamsData.result : [],
        });
      } catch (error) {
        if (error.name !== 'AbortError') console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
    return () => controller.abort();
  }, [locale]);

  // Scroll to section
  const scrollToSection = (id) => {
    if (id === 'teams') setShowTeams(true);
    else setShowTeams(false);

    setSelectedMenu(id);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50); // รอ render DOM
  };

  const handleMenuClick = (e, menu) => {
    e.preventDefault();
    scrollToSection(menu);
  };

  const renderSection = (content) => (
    <div className="banner-container fade-in">
      <picture>
        <source srcSet={`${baseUrl}/${content?.brander_pictureMoblie}`} media="(max-width: 768px)" />
        <Image
          src={`${baseUrl}/${content?.brander_picturePC}`}
          alt={(locale === 'th' ? content?.brander_title : content?.brander_titleEN) || 'Image'}
          width={1530}
          height={800}
          className="banner-image"
        />
      </picture>
      {(locale === 'th' ? content?.brander_detail : content?.brander_detailEN || content?.brander_detail)?.split('\n').map((line, idx) => (
        <p key={idx}>{line}</p>
      ))}
    </div>
  );

  return (
    <main className="about-container">
      <aside className="about-sidebar">
        <h3 className="sidebar-header">{locale === 'th' ? 'เกี่ยวกับศักดิ์สยามโซลาร์' : 'About Saksiam Solar'}</h3>
        <ul className="sidebar-menu">
          {['history', 'vision', 'mission', 'teams'].map((menu) => (
            <li key={menu}>
              <Link
                href={`#${menu}`}
                className={selectedMenu === menu ? 'active' : ''}
                onClick={(e) => handleMenuClick(e, menu)}
                scroll={false}
              >
                {locale === 'th'
                  ? { history: 'ประวัติความเป็นมา', vision: 'วิสัยทัศน์', mission: 'พันธกิจ', teams: 'คณะกรรมการ' }[menu]
                  : { history: 'History', vision: 'Vision', mission: 'Mission', teams: 'Committee' }[menu]
                }
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      <section className="about-content">
        {loading ? (
          <div className="skeleton-banner"></div>
        ) : (
          <>
            {/* 3 เนื้อหาแรก */}
            <div className={`content-sections ${showTeams ? 'hidden-section' : ''}`}>
              <h2 id="history" className="about-title with-lines">{locale === 'th' ? 'ประวัติความเป็นมา' : 'History'}</h2>
              {sections.history && renderSection(sections.history)}

              <h2 id="vision" className="about-title with-lines">{locale === 'th' ? 'วิสัยทัศน์' : 'Vision'}</h2>
              {sections.vision && renderSection(sections.vision)}

              <h2 id="mission" className="about-title with-lines">{locale === 'th' ? 'พันธกิจ' : 'Mission'}</h2>
              <ul className="mission-list">
                {sections.mission.map((item, index) => (
                  <li key={item.mission_ID || `mission-${index}`} className="mission-item">
                    {item.picture && <Image src={`${baseUrl}/${item.picture}`} alt="พันธกิจ" width={90} height={90} className="mission-icon" />}
                    <span className="mission-text">{locale === 'th' ? item.titleTH : item.titleEN || item.titleTH}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* คณะกรรมการ */}
            <div id="teams" className={`teams-section ${showTeams ? '' : 'hidden-section'}`}>
              <h2 className="about-title with-lines">{locale === 'th' ? 'คณะกรรมการ' : 'Committee'}</h2>
              <div className="teams-grid">
                {sections.teams.map((member, idx) => (
                  <div key={member.teamsID || idx} className={idx === 0 ? 'team-boss' : 'team-card'}>
                    <Image
                      src={`${baseUrl}${member.teams_picture}`}
                      alt={locale === 'th' ? member.teams_nameTH : member.teams_nameEN}
                      width={300}
                      height={300}
                      className="team-image"
                    />
                    <div className="team-info">
                      <p className="team-name">{locale === 'th' ? member.teams_nameTH : member.teams_nameEN}</p>
                      <p className="team-position">{locale === 'th' ? member.teams_positionTH : member.teams_positionEN}</p>
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
