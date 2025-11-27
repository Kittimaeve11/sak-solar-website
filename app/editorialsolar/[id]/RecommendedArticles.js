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

/* Hook ตรวจ screen width */
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

/* Custom Arrow */
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

/* Clean HTML safely (รวม parseDescription) */
function cleanHTML(str) {
  if (!str) return "";
  try {
    return str
      .replace(/^"+|"+$/g, "")
      .replace(/\\\//g, "/")
      .replace(/\\"/g, '"')
      .replace(/&nbsp;/g, " ")
      .replace(/\\n/g, " ")
      .replace(/ style="[^"]*"/g, "")
      .replace(/<\/?[^>]+(>|$)/g, "")
      .trim();
  } catch {
    return "";
  }
}

/* Get Image URL safely */
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

/* Logging click */
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

/*  MAIN COMPONENT */
export default function RecommendedArticles({ typeID, currentId }) {
  const { locale } = useLocale();
  const [articles, setArticles] = useState([]);
  const sliderRef = useRef(null);
  const width = useWindowWidth();

  const slidesToShow = width > 1200 ? 3 : width > 991 ? 2 : width > 638 ? 2 : 1;

  useEffect(() => {
    if (!typeID) return; // ไม่ fetch ถ้า typeID ว่าง

    async function fetchData() {
      try {
        const res = await fetch(
          `${baseUrl}/api/belowedittorIDpageapi?editoriatypeID=${typeID}`,
          { headers: { "X-API-KEY": apiKey } }
        );
        const data = await res.json();

        const filtered = data?.result?.filter(
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

  // ถ้าไม่มีบทความ ไม่แสดงอะไรเลย
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
      <h3 className={styles.titlerecommended}>
        {locale === "en" ? "Recommended Articles" : "บทความแนะนำ"}
      </h3>

      <div className={styles.sliderWrapperrecommended}>
        <Slider ref={sliderRef} {...settings}>
          {articles.map((article) => {
            const imageUrl = getImageUrl(article.editoria_gallary);
            const rawTitle = locale === "en"
              ? article.editoria_titieEN || article.editoria_titieTH
              : article.editoria_titieTH || article.editoria_titieEN;
            const title = cleanHTML(rawTitle);

            const rawPreview =
              locale === "en"
                ? article.editoria_descriptionEN
                : article.editoria_descriptionTH;

            const previewText = cleanHTML(rawPreview).slice(0, 120) + "...";

            return (
              <Link
                key={article.editoria_id}
                href={`/editorialsolar/${article.editoria_num}`}
                onClick={() => handleLogClick(article)}
                className={styles.cardrecommended}
              >
                <article>
                  <div className={styles.imageWrapperrecommended}>
                    <Image
                      src={imageUrl}
                      alt={title}
                      fill
                      loading="lazy"
                      sizes="(max-width:768px)80vw,(max-width:1200px)40vw,25vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>

                  <div className={styles.cardContentrecommended}>
                    <h4 className={styles.cardTitlerecommended}>{title}</h4>

                    <p className={styles.daterecommended}>
                      {new Date(article.editoria_creacteAt).toLocaleDateString(
                        locale === "en" ? "en-EN" : "th-TH",
                        { day: "numeric", month: "long", year: "numeric" }
                      )}
                    </p>

                    <p className={styles.cardDescription}>{previewText}</p>

                    <p className="read-more">
                      {locale === "en" ? "Read more" : "อ่านเพิ่มเติม"}{" "}
                      <FaArrowRightLong />
                    </p>

                  </div>
                </article>
              </Link>
            );
          })}
        </Slider>
      </div>
    </section>
  );
}
