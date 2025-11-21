'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Slider from "react-slick";
import { useRouter } from "next/navigation";
import { useLocale } from "@/app/Context/LocaleContext";
import { FaArrowRightLong } from "react-icons/fa6";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import styles from "./RecommendedArticles.module.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/* ================= API ================= */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* ================= Resize Hook ================= */
function useWindowWidth() {
  const [width, setWidth] = useState(1200);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
}

/* ================= ปุ่ม Arrow ================= */
const PrevArrow = ({ onClick }) => (
  <button className={styles.arrowPrev} onClick={onClick}>
    <IoIosArrowBack />
  </button>
);

const NextArrow = ({ onClick }) => (
  <button className={styles.arrowNext} onClick={onClick}>
    <IoIosArrowForward />
  </button>
);

/* ================= Clean HTML ================= */
function cleanHTML(str) {
  if (!str) return "";
  return str
    .replace(/^"+|"+$/g, "")
    .replace(/\\\//g, "/")
    .replace(/\\n/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/ style="[^"]*"/g, "")
    .trim();
}

/* ================= ดึงรูป ================= */
function getImageUrl(galleryStr) {
  if (!galleryStr) return "/images/no-image.jpg";
  try {
    const parsed = JSON.parse(galleryStr);
    const first = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
    if (!first) return "/images/no-image.jpg";
    return `${baseUrl}/${first.replace(/^"+|"+$/g, "").replace(/\\/g, "/")}`;
  } catch {
    return "/images/no-image.jpg";
  }
}

/* ================= ฟังก์ชัน Log ================= */
const handleLogClick = async (article) => {
  try {
    const logData = {
      actionType: "2",
      actionDetail: `บทความแนะนำ ID: ${article.editoria_id} หมายเลข: ${article.editoria_num}`,
      typeUser: "ผู้เยี่ยมชมเว็บไซต์",
      datatype: "บทความ",
      dataID: article.editoria_id,
      datatypeID: article.editoria_typeID,
      brandtype: "0",
      dataname: article.editoria_titieTH || "-",
    };

    await fetch(`${baseUrl}/api/logWebsitepageapi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(logData),
    });
  } catch (err) {
    console.error("Log failed:", err);
  }
};

/* =========================================================
   ⭐ Component หลัก (เหมือน Product)
========================================================= */
export default function RecommendedArticles({ typeID, currentId }) {
  const { locale } = useLocale();
  const [articles, setArticles] = useState([]);
  const sliderRef = useRef(null);
  const width = useWindowWidth();
  const router = useRouter();

  // ⭐ Dynamic slidesToShow เหมือน RecommendedProducts
  const slidesToShow =
    width > 1200 ? 4 : width > 991 ? 3 : width > 638 ? 2 : 1;

  /* ====== ดึงข้อมูล API ====== */
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `${baseUrl}/api/belowedittorIDpageapi?editoriatypeID=${typeID}`,
          { headers: { "X-API-KEY": apiKey } }
        );
        const data = await res.json();
        const filtered = data.result.filter(
          (item) => item.editoria_id !== currentId
        );
        setArticles(filtered);

        // ⭐ บังคับรีเฟรช slick
        await new Promise((r) => setTimeout(r, 0));
        sliderRef.current?.slickGoTo(0);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }

    fetchData();
  }, [typeID, currentId]);

  if (!articles.length) return null;

  /* ====== Slick Settings ====== */
  const settings = {
    infinite: articles.length > slidesToShow,
    speed: 400,
    arrows: true,
    slidesToShow,
    slidesToScroll: 1,
    swipe: true,
    draggable: true,
    touchThreshold: 10,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <section className={styles.wrapper}>
      <h3 className={styles.title}>
        {locale === "en" ? "Recommended Articles" : "บทความแนะนำ"}
      </h3>

      {/* ⭐ ต้องมี div นี้ครอบ Slider เพื่อไม่ให้ติดขอบซ้าย-ขวา */}
      <div className={styles.sliderWrapper}>
        <Slider ref={sliderRef} {...settings}>
          {articles.map((article, idx) => {
            const imageUrl = getImageUrl(article.editoria_gallary);
            const title =
              locale === "en"
                ? article.editoria_titieEN || article.editoria_titieTH
                : article.editoria_titieTH || article.editoria_titieEN;

            const description = cleanHTML(
              locale === "en"
                ? article.editoria_descriptionEN ||
                article.editoria_descriptionTH
                : article.editoria_descriptionTH ||
                article.editoria_descriptionEN
            );
            const previewText =
              description.length > 120
                ? description.slice(0, 120) + "..."
                : description;

            return (
              <Link
                key={article.editoria_id}
                href={`/editorial/${article.editoria_num}`}
                onClick={() => handleLogClick(article)}
                className={`${styles.card} fade-in`}
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                {/* ==== รูปบทความ ==== */}
                <div className={styles.imageWrapper}>
                  <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 25vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>

                {/* ==== เนื้อหา ==== */}
                <div className={styles.cardContent}>
                  <h4 className={styles.cardTitle}>{title}</h4>

                  <p className={styles.date}>
                    {new Date(article.editoria_creacteAt).toLocaleDateString(
                      locale === "en" ? "en-EN" : "th-TH",
                      { day: "numeric", month: "long", year: "numeric" }
                    )}
                  </p>

                  <p
                    className={styles.cardDescription}
                    dangerouslySetInnerHTML={{ __html: previewText }}
                  />

                  <p className={styles.readMore}>
                    {locale === "en" ? "Read more" : "อ่านเพิ่มเติม"}{" "}
                    <FaArrowRightLong />
                  </p>
                </div>
              </Link>
            );
          })}
        </Slider>
      </div>
    </section>
  );
}