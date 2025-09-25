'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/app/Context/LocaleContext";
import styles from "./RecommendedArticles.module.css";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

// --------------------- ฟังก์ชันดึง URL รูป ---------------------
function getImageUrl(galleryStr) {
    if (!galleryStr) return "";
    try {
        const parsed = JSON.parse(galleryStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return `${baseUrl}/${parsed[0].replace(/\\/g, "/")}`;
        }
        if (typeof parsed === "string") {
            return `${baseUrl}/${parsed.replace(/\\/g, "/")}`;
        }
    } catch {
        return `${baseUrl}/${galleryStr.replace(/\\/g, "/")}`;
    }
}

// --------------------- ฟังก์ชัน clean HTML ---------------------
function cleanHTML(str) {
    if (!str) return "";

    let result = str;

    // ลบ backslash เกินความจำเป็น
    result = result.replace(/\\+/g, "");

    // แปลง &nbsp; → space
    result = result.replace(/&nbsp;/g, " ");

    // แก้แท็กปิดที่ escape เช่น <\/p>, <\/span>
    result = result.replace(/<\\\/span>/gi, "</span>");
    result = result.replace(/<\\\/p>/gi, "</p>");

    // แปลง \" → "
    result = result.replace(/\\"/g, '"');

    // ลบ newline
    result = result.replace(/\n/g, "");

    // ลบ double quote ที่ครอบรอบนอกสุด
    result = result.replace(/^"+|"+$/g, "");

    // Trim
    return result.trim();
}

// --------------------- ตัด plain text (สำหรับ preview 100 ตัวอักษร) ---------------------
function stripHTMLTags(html) {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").trim();
}

// --------------------- Component ---------------------
export default function RecommendedArticles({ typeID, currentId }) {
    const { locale } = useLocale();
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        async function fetchRecommended() {
            try {
                const res = await fetch(
                    `${baseUrl}/api/belowedittorIDpageapi?editoriatypeID=${typeID}`,
                    { headers: { "X-API-KEY": apiKey } }
                );
                if (!res.ok) throw new Error(`API failed: ${res.status}`);
                const data = await res.json();
                const filtered = data.result.filter(
                    (item) => item.editoria_id !== currentId
                );
                setArticles(filtered);
            } catch (err) {
                console.error("Fetch recommended articles error:", err);
            }
        }
        fetchRecommended();
    }, [typeID, currentId]);

    if (articles.length === 0) return null;

    return (
        <section className={styles.wrapper}>
            <div className={styles.layout}>
                <div className={styles.container}>
                    <h3 className={styles.title}>
                        {locale === "en" ? "Recommended Articles" : "บทความแนะนำ"}
                    </h3>
                    <div className={styles.scrollContainer}>
                        {articles.map((article) => {
                            const title =
                                locale === "en"
                                    ? article.editoria_titieEN || article.editoria_titieTH
                                    : article.editoria_titieTH || article.editoria_titieEN;

                            const rawDescription =
                                locale === "en"
                                    ? article.editoria_descriptionEN ||
                                      article.editoria_descriptionTH
                                    : article.editoria_descriptionTH ||
                                      article.editoria_descriptionEN;

                            const description = cleanHTML(rawDescription);
                            const previewText = stripHTMLTags(description).slice(0, 100) + "...";
                            const imageUrl = getImageUrl(article.editoria_gallary);

                            return (
                                <Link
                                    key={article.editoria_id}
                                    href={`/editorial/${article.editoria_num}`}
                                    className={styles.card}
                                >
                                    {imageUrl && (
                                        <Image
                                            src={imageUrl}
                                            alt={title}
                                            width={300}
                                            height={180}
                                            className={styles.cardImage}
                                        />
                                    )}
                                    <div className={styles.cardContent}>
                                        <h4 className={styles.cardTitle}>{title}</h4>
                                        <p className="editorial-date">
                                            {new Date(article.editoria_creacteAt).toLocaleDateString(
                                                locale === 'en' ? "en-EN" : "th-TH",
                                                { day: "numeric", month: "long", year: "numeric" }
                                            )}
                                        </p>
                                        {/* แสดงเป็น plain text preview */}
                                        <p className={styles.cardDescription}>{previewText}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
