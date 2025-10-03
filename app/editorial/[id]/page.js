'use client';

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { IoMdArrowDropright } from "react-icons/io";
import { useLocale } from "@/app/Context/LocaleContext";
import Gallery from "../gallery";
import RecommendedArticles from "./RecommendedArticles";
import styles from "./EditorialDetailPage.module.css";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* ---------------- ฟังก์ชันแปลง URL ของรูป ---------------- */
function getImageUrls(galleryStr) {
  if (!galleryStr) return [];

  const normalizePath = (raw, firstDir = "") => {
    let p = String(raw).replace(/^"+|"+$/g, "").trim();
    p = p.replace(/\\/g, "/").replace(/\/{2,}/g, "/");
    if (!p.includes("/") && firstDir) p = `${firstDir}/${p}`;
    return `${baseUrl}/${p}`;
  };

  try {
    const parsed = JSON.parse(galleryStr);
    let items = [];
    if (Array.isArray(parsed)) {
      if (parsed.length === 1 && typeof parsed[0] === "string" && parsed[0].includes(",")) {
        items = parsed[0].split(",").map(s => s.trim()).filter(Boolean);
      } else {
        items = parsed.map(String).filter(Boolean);
      }
    } else if (typeof parsed === "string") {
      items = parsed.split(",").map(s => s.trim()).filter(Boolean);
    }

    const firstDir = (items[0] && items[0].includes("/"))
      ? items[0].substring(0, items[0].lastIndexOf("/"))
      : "";

    return items.map(item => normalizePath(item, firstDir));
  } catch {
    const parts = String(galleryStr).includes(",")
      ? String(galleryStr).split(",").map(s => s.trim()).filter(Boolean)
      : [String(galleryStr).trim()];

    const firstDir = (parts[0] && parts[0].includes("/"))
      ? parts[0].substring(0, parts[0].lastIndexOf("/"))
      : "";

    return parts.map(part => normalizePath(part, firstDir));
  }
}

/* ---------------- ฟังก์ชัน parse HTML ---------------- */
function parseHTML(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/\\\//g, "/")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/<\\\/?span>/g, "")
    .replace(/^"+|"+$/g, "")
    .trim();
}

export default function EditorialDetailPage() {
  const params = useParams();
  const id = params?.id;
  const { locale } = useLocale();

  const [editorial, setEditorial] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const sectionsRef = useRef([]);

  /* ---------------- ดึงข้อมูล ---------------- */
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    async function fetchData() {
      try {
        const res = await fetch(`${baseUrl}/api/edittorIDpageapi/${id}`, {
          headers: { "X-API-KEY": apiKey },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`API failed: ${res.status}`);
        const data = await res.json();

        let article = null;
        if (Array.isArray(data?.result) && data.result.length > 0) {
          article = data.result[0];
        } else if (data?.result && typeof data.result === "object") {
          article = data.result;
        } else if (data?.data) {
          article = data.data;
        } else if (typeof data === "object") {
          article = data;
        }

        setEditorial(article);
      } catch (err) {
        if (err.name !== "AbortError") console.error("Fetch error:", err);
      }
    }

    fetchData();
    return () => controller.abort();
  }, [id]);

  /* ---------------- Scroll spy แบบแก้บัค ---------------- */
  useEffect(() => {
    if (!sectionsRef.current.length) return;

    function onScroll() {
      let currentIndex = -1; // เริ่ม -1 = ยังไม่เข้า section ไหน

      sectionsRef.current.forEach((section, idx) => {
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionBottom = rect.bottom;

        // เช็คว่า viewport อยู่ใน section นี้
        if (sectionTop <= 120 && sectionBottom > 120) {
          currentIndex = idx;
        }
      });

      // ถ้าไม่เจอ section เลย → set null
      if (currentIndex === -1) {
        if (activeIndex !== null) setActiveIndex(null);
      } else if (currentIndex !== activeIndex) {
        setActiveIndex(currentIndex);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [editorial, activeIndex]);





  if (!editorial) return null;

  const title = locale === "en"
    ? editorial?.titiemainEN || editorial?.titiemainTH || editorial?.editoria_titieEN || editorial?.editoria_titieTH || "-"
    : editorial?.titiemainTH || editorial?.editoria_titieTH || "-";

  const description = locale === "en"
    ? editorial?.descriptionmainEN || editorial?.descriptionmainTH || editorial?.editoria_descriptionEN || editorial?.editoria_descriptionTH || "-"
    : editorial?.descriptionmainTH || editorial?.editoria_descriptionTH || "-";

  const subList = editorial?.subEditoria || [];

  return (
    <main>
      <div className={styles.wrapper}>
        <div className={styles.layout}>
          {/* ---------------- เนื้อหาหลัก ---------------- */}
          <div className={styles.contentBox}>
            <article className={styles.article}>
              {/* Header */}
              <div className={styles.headerportfolio}>
                <h1 className={styles.title}>{title}</h1>
                <div className={styles.meta}>
                  <Link href="/" className={styles.link}>
                    {locale === "en" ? "Home" : "หน้าหลัก"}{" "}
                    <MdKeyboardDoubleArrowRight style={{ fontSize: 19 }} />
                  </Link>
                  <Link href="/editorial" className={styles.link}>
                    {locale === "en" ? "Back" : "ย้อนกลับ"}{" "}
                    <MdKeyboardDoubleArrowRight style={{ fontSize: 19 }} />
                  </Link>
                  <span className={styles.articleName}>{title}</span>
                </div>
              </div>

              {/* วันที่โพสต์ */}
              <time className={styles.date}>
                {locale === "en" ? "Posted on: " : "วันที่โพสต์ : "}
                {editorial?.editoria_creacteAt
                  ? new Date(editorial.editoria_creacteAt).toLocaleDateString(
                    locale === "en" ? "en-EN" : "th-TH",
                    { day: "numeric", month: "long", year: "numeric" }
                  )
                  : "-"}
              </time>

              {/* รูปหลัก */}
              {editorial?.gallarymain &&
                getImageUrls(editorial.gallarymain).map((url, idx) => (
                  <Image
                    key={idx}
                    src={url}
                    alt={`${title} - ${idx + 1}`}
                    width={800}
                    height={400}
                    className={styles.mainImage}
                    priority={idx === 0}
                  />
                ))}

              {/* เนื้อหาหลัก */}
              <div
                className={styles.mainContent}
                dangerouslySetInnerHTML={{ __html: parseHTML(description) }}
              />

              {/* เนื้อหาย่อย */}
              {subList.map((sub, index) => {
                const subTitle = locale === "en"
                  ? sub?.subtitiEN || sub?.subtitiTH || "-"
                  : sub?.subtitiTH || "-";

                const subDesc = locale === "en"
                  ? sub?.subdescriptionEN || sub?.subdescriptionTH || "-"
                  : sub?.subdescriptionTH || "-";

                const imageUrls = getImageUrls(sub?.subgallary || "");

                return (
                  <section
                    key={index}
                    id={`section-${index}`}
                    ref={(el) => (sectionsRef.current[index] = el)}
                    className={styles.subSection}
                  >
                    <h2 className={`${styles.subTitle} ${activeIndex === index ? styles.activeTitle : ""}`}>
                      {subTitle}
                    </h2>

                    <div
                      className={styles.subContent}
                      dangerouslySetInnerHTML={{ __html: parseHTML(subDesc) }}
                    />
                    {imageUrls.length > 0 && (
                      <div className={styles.section}>
                        <Gallery images={imageUrls} />
                      </div>
                    )}
                  </section>
                );
              })}
            </article>
          </div>

          {/* ---------------- Sidebar ---------------- */}
          <aside className={styles.sidebar}>
            <h3 className={styles.tocTitle}>
              {locale === "en" ? "Table of Contents" : "สารบัญ"}
            </h3>
            <ul className={styles.tocList}>
              {subList.map((sub, index) => {
                const subTitle = locale === "en"
                  ? sub?.subtitiEN || sub?.subtitiTH || "-"
                  : sub?.subtitiTH || "-";
                const isActive = activeIndex === index;
                return (
                  <li key={index} className={styles.tocItem}>
                    <Link
                      href={`#section-${index}`}
                      className={`${styles.tocLink} ${isActive ? styles.active : ""}`}
                    >
                      <IoMdArrowDropright className={styles.tocIcon} />
                      <span className={styles.tocText}>{subTitle}</span>
                    </Link>
                  </li>


                );
              })}
            </ul>
          </aside>
        </div>
      </div>

      {/* -------------------- Recommended Articles -------------------- */}
      <div className={styles.recommendedSection}>
        <RecommendedArticles typeID={3} currentId={editorial.editoria_id} />
      </div>
    </main>
  );
}
