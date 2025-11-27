'use client';

import { useEffect, useState } from 'react';
import '@/styles/about.css';
import { useLocale } from '../Context/LocaleContext';

import AboutSidebar from './components/AboutSidebar';
import HistoryVisionMission from './components/HistoryVisionMission';
import TeamsSection from './components/TeamsSection';
import LoadingSpinner from './components/LoadingSpinner';

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
  return path.startsWith('http')
    ? path
    : `${baseUrl}/${path.replace(/^\/+/, '')}`;
};

export default function AboutPageClient() {
  const { locale } = useLocale();

  /* เก็บข้อมูลเนื้อหาแต่ละ section */
  const [sections, setSections] = useState({
    history: null,
    vision: null,
    mission: [],
    teams: [],
  });

  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState('history');

  /* =====================================================
     Fetch Data (พร้อมระบบ Cache ตามภาษา)
     ===================================================== */
  useEffect(() => {
    const cacheKey = `ABOUT_PAGE_CACHE_${locale}`;
    const cachedData = getCache(cacheKey);

    if (cachedData) {
      setSections(cachedData);
      setLoading(false);
      return;
    }

    async function fetchAll() {
      try {
        const [history, vision, mission, teams] = await Promise.all([
          fetch(`${baseUrl}/api/branderIDapi/12`, {
            headers: { 'X-API-KEY': apiKey },
          }),
          fetch(`${baseUrl}/api/branderIDapi/7`, {
            headers: { 'X-API-KEY': apiKey },
          }),
          fetch(`${baseUrl}/api/misstionapi`, {
            headers: { 'X-API-KEY': apiKey },
          }),
          fetch(`${baseUrl}/api/teamsapi`, {
            headers: { 'X-API-KEY': apiKey },
          }),
        ]);

        const data = {
          history: (await history.json()).data,
          vision: (await vision.json()).data,
          mission: (await mission.json()).result || [],
          teams: (await teams.json()).result || [],
        };

        setSections(data);
        setCache(cacheKey, data);
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
        const position =
          el.getBoundingClientRect().top + window.scrollY - headerOffset;
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
            setSelectedMenu(entry.target.id);
          }
        });

        if (window.scrollY < 200) {
          setSelectedMenu('history');
        }
      },
      {
        root: null,
        threshold: 0.3,
        rootMargin: '-10% 0px -65% 0px',
      }
    );

    document
      .querySelectorAll('.about-section')
      .forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [loading]);

  return (
    <main className="about-container fade-in">
      {/* Sidebar */}
      <AboutSidebar
        locale={locale}
        selectedMenu={selectedMenu}
        onSelectMenu={scrollToSection}
      />

      {/* Content */}
      <section className="about-content">
        {loading ? (
          <>
            <LoadingSpinner />
            <div className="loading-placeholder"></div>
          </>
        ) : (
          <>
            <HistoryVisionMission
              locale={locale}
              sections={sections}
              selectedMenu={selectedMenu}
              normalizeSrc={normalizeSrc}
            />

            <TeamsSection
              locale={locale}
              sections={sections}
              selectedMenu={selectedMenu}
              normalizeSrc={normalizeSrc}
            />
          </>
        )}
      </section>
    </main>
  );
}
