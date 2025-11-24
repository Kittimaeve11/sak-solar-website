'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Slider from "react-slick";
import { useLocale } from "@/app/Context/LocaleContext";
import { FaArrowRightLong } from "react-icons/fa6";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import styles from './RecommendedArticles.module.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* 👉 Hook ตรวจ screen width */
function useWindowWidth() {
  const [width, setWidth] = useState(1200);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
}

/* 👉 Custom Arrow */
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

/* 👉 Cleaning HTML safely */
function cleanHTML(str) {
  if (!str) return "";
  return str
    .replace(/\\n/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/ style="[^"]*"/g, "")
    .trim();
}

/* 👉 Get Image URL safely */
function getImageUrl(galleryStr) {
  if (!galleryStr) return "/images/no-image.jpg";
  try {
    const parsed = JSON.parse(galleryStr);
    const first = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
    return first ? `${baseUrl}/${first.replace(/\\/g, "/")}` : "/images/no-image.jpg";
  } catch {
    return "/images/no-image.jpg";
  }
}

/* 👉 Logging click */
async function handleLogClick(article) {
  try {
    await fetch(`${baseUrl}/api/logWebsitepageapi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({
        actionType: "2",
        actionDetail: `บทความแนะนำ ID: ${article.editoria_id} หมายเลข: ${article.editoria_num}`,
        typeUser: "ผู้เยี่ยมชมเว็บไซต์",
        datatype: "บทความ",
        dataID: article.editoria_id,
        datatypeID: article.editoria_typeID,
        brandtype: "0",
        dataname: article.editoria_titieTH || "-",
      }),
    });
  } catch (err) {
    console.error("Log failed:", err);
  }
}

/* 🌟 MAIN COMPONENT */
export default function RecommendedArticles({ typeID, currentId }) {
  const { locale } = useLocale();
  const [articles, setArticles] = useState([]);
  const sliderRef = useRef(null);
  const width = useWindowWidth();

  const slidesToShow = width > 1200 ? 4 : width > 991 ? 3 : width > 638 ? 2 : 1;

  useEffect(() => {
    // ป้องกันไม่ให้ fetch แบบ typeID ว่าง
    if (!typeID) return;

    async function fetchData() {
      try {
        const res = await fetch(
          `${baseUrl}/api/belowedittorIDpageapi?editoriatypeID=${typeID}`,
          { headers: { "X-API-KEY": apiKey } }
        );
        const data = await res.json();

        const filtered =
          data?.result?.filter(
            (item) => Number(item.editoria_id) !== Number(currentId)
          ) || [];

        setArticles(filtered);
        sliderRef.current?.slickGoTo(0);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }
    fetchData();
  }, [typeID, currentId]);

  /* 🚫 Empty data — ไม่ render อะไรเลย */
  if (!articles.length) return null;

  const settings = {
    infinite: articles.length > slidesToShow,
    speed: 450,
    arrows: true,
    slidesToShow,
    slidesToScroll: 1,
    swipe: true,
    draggable: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <section className={styles.wrapper}>
      <h3 className={styles.title}>
        {locale === "en" ? "Recommended Articles" : "บทความแนะนำ"}
      </h3>

      <div className={styles.sliderWrapper}>
        <Slider ref={sliderRef} {...settings}>
          {articles.map((article, idx) => {
            const imageUrl = getImageUrl(article.editoria_gallary);
            const title =
              locale === "en"
                ? article.editoria_titieEN || article.editoria_titieTH
                : article.editoria_titieTH || article.editoria_titieEN;

            const previewText =
              cleanHTML(
                locale === "en"
                  ? article.editoria_descriptionEN
                  : article.editoria_descriptionTH
              ).slice(0, 120) + "...";

            return (
              <Link
                key={article.editoria_id}
                href={`/editorialsolar/${article.editoria_num}`}
                onClick={() => handleLogClick(article)}
                className={styles.card}
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    loading="lazy"
                    sizes="(max-width:768px)80vw,(max-width:1200px)40vw,25vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>

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
