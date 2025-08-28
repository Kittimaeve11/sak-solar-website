'use client';
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import styles from "./EditorialDetailPage.module.css";
import Link from "next/link";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import Gallery from "../gallery";
import SlideEditorial from "@/app/components/Home/SlideEditorial";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

async function getEditorialById(editorialNum) {
  const res = await fetch(`${baseUrl}/api/edittorIDpageapi/${editorialNum}`, {
    headers: { "X-API-KEY": apiKey },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.result?.[0] || null;
}

function parseHtmlString(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/^"+|"+$/g, "")
    .replace(/\\\//g, "/")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export default function EditorialDetailPage() {
  const { id } = useParams();
  const [editorial, setEditorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isSticky, setIsSticky] = useState(false);
  const observerRef = useRef(null);

  const getImageUrl = (path) => {
    if (!path) return "/images/no-image.jpg";
    return `${baseUrl}/${path.replace(/^"+|"+$/g, "").replace(/\\/g, "/")}`;
  };

  const scrollToHeading = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 80;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!id) return;

    let observer;
    const handleSticky = () => setIsSticky(window.scrollY > 300);

    const loadEditorial = async () => {
      setLoading(true);
      const res = await getEditorialById(id);
      if (!res) {
        setEditorial(null);
        setLoading(false);
        return;
      }

      const descriptionmainTH = parseHtmlString(res.descriptionmainTH);
      const subEditoria = Array.isArray(res.subEditoria)
        ? res.subEditoria.map((sub, index) => ({
            ...sub,
            id: `sub-${index}`,
            subdescriptionTH: parseHtmlString(sub.subdescriptionTH),
            subgallary: (() => {
              try {
                return sub.subgallary ? JSON.parse(sub.subgallary.replace(/^"+|"+$/g, "")) : [];
              } catch {
                return [];
              }
            })(),
          }))
        : [];

      setEditorial({ ...res, descriptionmainTH, subEditoria });

      const allHeadings = subEditoria.map((sub) => ({
        id: sub.id,
        text: sub.subtitiTH,
        key: sub.id,
      }));
      setHeadings(allHeadings);

      setLoading(false);

      // IntersectionObserver สำหรับ TOC highlight
      observer = new IntersectionObserver(
        (entries) => {
          const visibleEntries = entries.filter(e => e.isIntersecting);
          if (visibleEntries.length) {
            // เลือก section ที่ใกล้ top ของ viewport
            const nearest = visibleEntries.reduce((prev, curr) => {
              const prevTop = Math.abs(prev.boundingClientRect.top);
              const currTop = Math.abs(curr.boundingClientRect.top);
              return currTop < prevTop ? curr : prev;
            });
            setActiveId(nearest.target.id);
          }
        },
        { root: null, rootMargin: "-80px 0px -20% 0px", threshold: [0, 0.1, 0.25, 0.5, 1] }
      );

      allHeadings.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    };

    loadEditorial();
    window.addEventListener("scroll", handleSticky);

    return () => {
      window.removeEventListener("scroll", handleSticky);
      if (observer) {
        headings.forEach(({ id }) => {
          const el = document.getElementById(id);
          if (el) observer.unobserve(el);
        });
      }
    };
  }, [id]);

  if (loading) return <div className={styles.notFound}>Loading...</div>;
  if (!editorial) return <div className={styles.notFound}>ไม่พบบทความ</div>;

  return (
    <main className={styles.wrapper}>
      <div className={styles.layout}>
        <div className={styles.contentBox}>
          <article className={styles.article}>
            <div className={styles.headerportfolio}>
              <h1 className={styles.title}>{editorial.titiemainTH}</h1>
              <div className={styles.meta}>
                <Link href="/" className={styles.link}>
                  หน้าหลัก <MdKeyboardDoubleArrowRight style={{ fontSize: 19 }} />
                </Link>
                <Link href="/editorial" className={styles.link}>
                  ย้อนกลับ <MdKeyboardDoubleArrowRight style={{ fontSize: 19 }} />
                </Link>
                <span className={styles.articleName}>{editorial.titiemainTH}</span>
              </div>
            </div>

            <time className={styles.date}>
              วันที่โพสต์ :{" "}
              {new Date(editorial.editoria_creacteAt).toLocaleDateString("th-TH", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>

            {editorial.gallarymain && (
              <Image
                src={getImageUrl(editorial.gallarymain)}
                alt={editorial.titiemainTH}
                width={800}
                height={400}
                className={styles.mainImage}
                priority
              />
            )}

            <section
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: editorial.descriptionmainTH }}
            />

            {editorial.subEditoria.map((sub) => (
              <div key={sub.id} id={sub.id} className={styles.subArticle}>
                <h2>{sub.subtitiTH}</h2>
                <section dangerouslySetInnerHTML={{ __html: sub.subdescriptionTH }} />
                {sub.subgallary.length > 0 && <Gallery images={sub.subgallary.map(getImageUrl)} />}
              </div>
            ))}

            {editorial.gallery?.length > 1 && (
              <div className={styles.bottomGallery}>
                <h1>แกลเลอรี่</h1>
                <Gallery images={editorial.gallery.map(getImageUrl)} />
              </div>
            )}

            <SlideEditorial />
          </article>
        </div>

        {headings.length > 1 && (
          <nav className={`${styles.sidebar} ${isSticky ? styles.sticky : ""}`} aria-label="สารบัญบทความ">
            <h2 className={styles.tocTitle}>เนื้อหาบทความ</h2>
            <ul className={styles.tocList}>
              {headings.map(({ id, text, key }) => (
                <li key={key} className={styles.tocItem}>
                  <button
                    type="button"
                    className={`${styles.tocLinkSection} ${activeId === id ? styles.active : ""}`}
                    onClick={() => scrollToHeading(id)}
                  >
                    {text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </main>
  );
}
