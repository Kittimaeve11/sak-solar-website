'use client';

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useLocale } from "@/app/Context/LocaleContext";

import ArticleHeader from "./ArticleHeader";
import ArticleMainImage from "./ArticleMainImage";
import ArticleSubSection from "./ArticleSubSection";
import TableOfContents from "./TableOfContents";
import RecommendedArticles from "./RecommendedArticles";

import { parseHTML, getImageUrls } from "./utils";
import styles from "./EditorialDetailPage.module.css";
import LoadingSpinner from "./LoadingSpinner";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function EditorialDetailPage() {
  const params = useParams();
  const id = params?.id;
  const { locale } = useLocale();

  const [editorial, setEditorial] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 🟢 เพิ่ม state โหลด
  const [activeIndex, setActiveIndex] = useState(null);
  const sectionsRef = useRef([]);

  /* === useEffect ตัวเดียว: Fetch + ScrollSpy === */
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    async function fetchArticle() {
      try {
        setIsLoading(true); // 🟢 เริ่มโหลด
        const res = await fetch(`${baseUrl}/api/edittorIDpageapi/${id}`, {
          headers: { "X-API-KEY": apiKey },
          signal: controller.signal,
        });

        const data = await res.json();

        const article =
          data?.result?.[0] ||
          data?.result ||
          data?.data ||
          (typeof data === "object" ? data : null);

        setEditorial(article);
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("⏹ Fetch aborted");
          return;
        }
        console.error("❌ Fetch Error:", err);
      } finally {
        setIsLoading(false); // 🟢 จบโหลด (สำเร็จหรือ fail ก็ปิดโหลด)
      }
    }

    fetchArticle();

    const onScroll = () => {
      let current = null;
      sectionsRef.current.forEach((section, idx) => {
        if (!section) return;
        const rect = section.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom > 120) {
          current = idx;
        }
      });
      setActiveIndex(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      controller.abort();
      window.removeEventListener("scroll", onScroll);
    };
  }, [id, locale]);

  /* 🟢 ถ้ายังโหลดอยู่ ให้แสดง Spinner */
  if (isLoading) {
    return <LoadingSpinner />;
  }

  /* 🛑 ถ้าโหลดเสร็จ แต่ไม่มีข้อมูล (error หรือไม่พบ) */
  if (!editorial) {
    return (
      <div className={styles.notFoundBox}>
        <p>{locale === "en" ? "Article not found" : "ไม่พบบทความ"}</p>
      </div>
    );
  }

  /* === เตรียมข้อมูล === */
  const title =
    locale === "en"
      ? editorial?.titiemainEN ||
        editorial?.editoria_titieEN ||
        editorial?.editoria_titieTH
      : editorial?.titiemainTH || editorial?.editoria_titieTH;

  const description =
    locale === "en"
      ? editorial?.descriptionmainEN ||
        editorial?.editoria_descriptionEN ||
        editorial?.editoria_descriptionTH
      : editorial?.descriptionmainTH || editorial?.editoria_descriptionTH;

  const date = editorial?.editoria_creacteAt
    ? new Date(editorial.editoria_creacteAt).toLocaleDateString(
        locale === "en" ? "en-EN" : "th-TH",
        { day: "numeric", month: "long", year: "numeric" }
      )
    : "-";

  const subList = editorial?.subEditoria || [];

  return (
    <main>
      <div className={styles.wrapper}>
        <div className={subList.length > 0 ? styles.layout : styles.layoutFullWidth}>
          
          {/* Header */}
          <div className={styles.contentBox}>
            <article className={styles.article}>
              <ArticleHeader title={title} date={date} locale={locale} />

              <ArticleMainImage
                images={getImageUrls(editorial?.gallarymain)}
                title={title}
              />

              <div
                className={styles.mainContent}
                dangerouslySetInnerHTML={{ __html: parseHTML(description) }}
              />

              {subList.map((sub, index) => (
                <ArticleSubSection
                  key={index}
                  index={index}
                  title={
                    locale === "en"
                      ? sub?.subtitiEN || sub?.subtitiTH
                      : sub?.subtitiTH
                  }
                  desc={parseHTML(
                    locale === "en"
                      ? sub?.subdescriptionEN
                      : sub?.subdescriptionTH
                  )}
                  images={getImageUrls(sub.subgallary)}
                  sectionRef={(el) => (sectionsRef.current[index] = el)}
                  isActive={activeIndex === index}
                />
              ))}
            </article>
          </div>

          {subList.length > 0 && (
            <TableOfContents
              subList={subList}
              activeIndex={activeIndex}
              locale={locale}
            />
          )}
        </div>
      </div>

      <div className={styles.recommendedSection}>
        <RecommendedArticles typeID={3} currentId={editorial?.editoria_id} />
      </div>
    </main>
  );
}
