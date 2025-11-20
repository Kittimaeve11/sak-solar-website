'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '@/styles/about.css';
import { useLocale } from '../Context/LocaleContext';
import { IoMdArrowDropright } from 'react-icons/io';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* ===============================================
   Simple Cache Helper (ดึง/เก็บข้อมูลใน sessionStorage)
   =============================================== */
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

/* ===============================================
   Normalize Image URL เพื่อป้องกัน path รูปภาพพัง
   =============================================== */
const normalizeSrc = (path) => {
  if (!path) return '/no-image.png';
  return path.startsWith('http') ? path : `${baseUrl}/${path.replace(/^\/+/, '')}`;
};

export default function AboutPage() {
  const { locale } = useLocale();

  /* เก็บข้อมูลเนื้อหาแต่ละ section */
  const [sections, setSections] = useState({
    history: null,
    vision: null,
    mission: [],
    teams: [],
  });

  const [loading, setLoading] = useState(true);         // สถานะโหลดข้อมูล
  const [selectedMenu, setSelectedMenu] = useState('history'); // เมนูที่ถูก active

  /* =====================================================
     Fetch Data (พร้อมระบบ Cache ตามภาษา)
     ===================================================== */
  useEffect(() => {
    const cacheKey = `ABOUT_PAGE_CACHE_${locale}`; // แยก cache ตาม locale
    const cachedData = getCache(cacheKey);

    // ใช้ cache ถ้าข้อมูลยังไม่หมดอายุ
    if (cachedData) {
      setSections(cachedData);
      setLoading(false);
      return;
    }

    // ดึงข้อมูลจาก API เมื่อไม่มี cache
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
        setCache(cacheKey, data); // เก็บ cache
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [locale]);

  /* =====================================================
     Scroll ไปยัง Section ที่เลือก และ fix header offset
     ===================================================== */
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

  /* =====================================================
     Observer เพื่อ highlight menu ตามตำแหน่ง scroll จริง
     ===================================================== */
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSelectedMenu(entry.target.id); // เปลี่ยน active menu
          }
        });

        // ถ้า scroll กลับขึ้นใกล้ top ให้กำหนด active เป็น history
        if (window.scrollY < 200) {
          setSelectedMenu("history");
        }
      },
      {
        root: null,
        threshold: 0.3,                  // ตรวจจับเร็วขึ้น
        rootMargin: '-10% 0px -65% 0px', // ปรับตำแหน่งตรวจสอบให้สมดุล
      }
    );

    document
      .querySelectorAll('.about-section')
      .forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [loading]);

  /* =====================================================
     Render Section พร้อมรูปภาพ + ข้อความรายละเอียด
     ===================================================== */
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
            priority={sectionType === 'history'} // preload เฉพาะภาพแรก
          />
        </div>

        {/* แสดงรายละเอียด โดยเลือกภาษา */}
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
      {/* ========== ส่วน Sidebar เมนูด้านซ้าย ========== */}
      <aside className="about-sidebar">
        <h3 className="sidebar-headertext">
          {/* เปลี่ยนหัวข้อเมนูตามภาษา */}
          {locale === 'th' ? 'เกี่ยวกับศักดิ์สยามโซลาร์' : 'About Saksiam Solar'}
        </h3>

        {/* วนเมนูจาก array เพื่อไม่ต้องเขียนซ้ำทีละบรรทัด */}
        <ul className="sidebar-menu">
          {['history', 'vision', 'mission', 'teams'].map((menu) => (
            <li key={menu}>
              <Link
                href={`#${menu}`}   // ลิงก์ไปแต่ละ section
                scroll={false}      // ปิด scroll เริ่มต้นของ Next.js
                className={selectedMenu === menu ? 'active' : ''} // ไฮไลท์เมนูที่เลือก
                onClick={(e) => {
                  e.preventDefault(); // ไม่ให้กระโดดทันที
                  scrollToSection(menu); // ใช้ smooth scroll แทน
                }}
              >
                <IoMdArrowDropright className="arrow" />
                {/* เปลี่ยนชื่อเมนูตามภาษา */}
                {locale === 'th'
                  ? { history: 'ประวัติความเป็นมา', vision: 'วิสัยทัศน์', mission: 'พันธกิจ', teams: 'คณะกรรมการ' }[menu]
                  : { history: 'History', vision: 'Vision', mission: 'Mission', teams: 'Committee' }[menu]}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* ========== ส่วนเนื้อหา (Content) ========== */}
      <section className="about-content">
        {loading ? (
          // ถ้ากำลังโหลด ให้แสดง skeleton
          <div className="skeleton-bannerabout"></div>
        ) : (
          <>
            {/* ซ่อน History, Vision, Mission เมื่อเลือก Teams */}
            <div className={`content-sections ${selectedMenu === 'teams' ? 'hidden-section' : ''}`}>
              
              {/* ========= HISTORY ========= */}
              <section id="history" className="about-section">
                <h2 className="about-title with-lines">
                  {locale === 'th' ? 'ประวัติความเป็นมา' : 'History'}
                </h2>
                {renderSection(sections.history, 'history')}
              </section>

              {/* ========= VISION ========= */}
              <section id="vision" className="about-section">
                <h2 className="about-title with-lines">
                  {locale === 'th' ? 'วิสัยทัศน์' : 'Vision'}
                </h2>
                {renderSection(sections.vision, 'vision')}
              </section>

              {/* ========= MISSION ========= */}
              <section id="mission" className="about-section">
                <h2 className="about-title with-lines">
                  {locale === 'th' ? 'พันธกิจ' : 'Mission'}
                </h2>

                {/* แสดงรายการพันธกิจ พร้อม icon ถ้ามี */}
                <ul className="mission-list fade-in show">
                  {sections.mission.map((item, index) => (
                    <li key={item.mission_ID || index} className="mission-item">
                      
                      {/* รูป icon ถ้ามี */}
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

                      {/* ข้อความพันธกิจ (TH/EN) */}
                      <span className="mission-text">
                        {locale === 'th' ? item.titleTH : item.titleEN || item.titleTH}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* ========= TEAMS (แสดงเต็มหน้าเมื่อเลือก) ========= */}
            <div
              id="teams"
              className={`teams-section ${selectedMenu === 'teams' ? 'fade-in show' : 'hidden-section'}`}
            >
              <h2 className="about-title with-lines">
                {locale === 'th' ? 'คณะกรรมการ' : 'Committee'}
              </h2>

              {/* แสดงข้อมูลคณะกรรมการแบบ Card */}
              <div className="teams-grid">
                {sections.teams.map((member, idx) => (
                  <div
                    key={member.teamsID || idx}
                    className={idx === 0 ? 'team-boss' : 'team-card'} // การ์ดแรกเป็นหัวหน้า
                  >
                    <Image
                      src={normalizeSrc(member.teams_picture)}
                      alt={locale === 'th' ? member.teams_nameTH : member.teams_nameEN}
                      width={300}
                      height={300}
                      className="team-image"
                      loading="lazy"
                    />

                    {/* ชื่อ + ตำแหน่ง */}
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
