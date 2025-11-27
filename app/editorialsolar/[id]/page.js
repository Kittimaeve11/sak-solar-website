'use client';

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useLocale } from "@/app/Context/LocaleContext";

import ArticleHeader from "./ArticleHeader";
import ArticleMainImage from "./ArticleMainImage";
import ArticleSubSection from "./ArticleSubSection";
import TableOfContents from "./TableOfContents";
import RecommendedArticles from "./RecommendedArticles";
import LoadingSpinner from "./LoadingSpinner";
import Gallery from "./gallery";
import { parseHTML, getImageUrls } from "./utils";
import styles from "./EditorialDetailPage.module.css";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function EditorialDetailPage() {
    const params = useParams();
    const id = params?.id;
    const { locale } = useLocale();

    const [editorial, setEditorial] = useState(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(null);
    const sectionsRef = useRef([]);

    useEffect(() => {
        if (!id) return;

        const controller = new AbortController();

        async function fetchArticle() {
            setIsLoading(true);
            setEditorial(undefined);

            try {
                const res = await fetch(`${baseUrl}/api/edittorIDpageapi/${id}`, {
                    headers: { "X-API-KEY": apiKey },
                    signal: controller.signal,
                });

                const data = await res.json();
                const article =
                    data?.result?.[0] ||
                    data?.result ||
                    data?.data ||
                    null;

                if (!controller.signal.aborted) {
                    // console.log(" editorial object จาก API:", article); // ดูค่า typeID ตรงนี้
                    setEditorial(article);
                }
            } catch {
                if (!controller.signal.aborted) {
                    setEditorial(null);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        fetchArticle();

        const onScroll = () => {
            let current = null;
            sectionsRef.current.forEach((section, idx) => {
                if (!section) return;
                const rect = section.getBoundingClientRect();
                if (rect.top <= 120 && rect.bottom > 120) current = idx;
            });
            setActiveIndex(current);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            controller.abort();
            window.removeEventListener("scroll", onScroll);
        };
    }, [id, locale]);

    /* ==========================
        Loading Stage
    ========================== */
    if (isLoading || editorial === undefined) {
        return (
            <>
                <LoadingSpinner />
                <div className="loading-placeholder"></div>
            </>
        );
    }

    /*  Loaded but no data */
    if (editorial === null) {
        return (
            <div className={styles.notFoundBox}>
                <p>{locale === "en" ? "Article not found" : "ไม่พบบทความ"}</p>
            </div>
        );
    }

    /*  Valid Data */
    const title =
        locale === "en"
            ? editorial?.titiemainEN || editorial?.editoria_titieEN
            : editorial?.titiemainTH || editorial?.editoria_titieTH;

    const description =
        locale === "en"
            ? editorial?.descriptionmainEN || editorial?.editoria_descriptionEN
            : editorial?.descriptionmainTH || editorial?.editoria_descriptionTH;

    const date = editorial?.editoria_creacteAt
        ? new Date(editorial.editoria_creacteAt).toLocaleDateString(
            locale === "en" ? "en-EN" : "th-TH",
            { day: "numeric", month: "long", year: "numeric" }
        )
        : "-";

    const subList = editorial?.subEditoria || [];

    /* ใช้ editoriatypeID ที่ถูกต้องแทน editoria_typeID */
    const safeTypeId =
        editorial?.editoriatypeID ||
        editorial?.typeID ||
        editorial?.editoria_typeID ||
        null;

    // console.log(" typeID ที่ส่งให้ RecommendedArticles:", safeTypeId);
    // console.log(" currentIdSafe:", Number(editorial?.editoria_id));

    return (
        <>
            <main className="fade-in">
                <div className={styles.wrapper}>
                    <div className={subList.length > 0 ? styles.layout : styles.layoutFullWidth}>
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
                                        title={locale === "en" ? sub?.subtitiEN || sub?.subtitiTH : sub?.subtitiTH}
                                        desc={parseHTML(
                                            locale === "en" ? sub?.subdescriptionEN : sub?.subdescriptionTH
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
                        {/*  แสดงเฉพาะภาพที่เหลือเป็นแกลเลอรี่ */}
                        <Gallery images={getImageUrls(editorial?.gallarymain)?.slice(1)} />

                    </div>

                </div>
            </main>

            <section style={{ marginTop: "50px", paddingBottom: "80px" }}>
                <RecommendedArticles
                    typeID={editorial?.editoriatypeID || editorial?.typeID}
                    currentId={Number(editorial?.editoria_id)}
                />
            </section>

        </>
    );
}
