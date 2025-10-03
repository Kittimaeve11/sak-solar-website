'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Slider from "react-slick";
import { useLocale } from "@/app/Context/LocaleContext";
import { FaArrowRightLong } from "react-icons/fa6";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import styles from "./RecommendedArticles.module.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

// --------------------- ฟังก์ชันดึง URL รูป ---------------------
function getImageUrl(galleryStr) {
  if (!galleryStr) return "/images/no-image.jpg";
  try {
    const parsed = JSON.parse(galleryStr);
    const first = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
    if (!first) return "/images/no-image.jpg";
    const cleaned = first.replace(/^"+|"+$/g, "").replace(/\\/g, "/");
    return `${baseUrl}/${cleaned}`;
  } catch {
    return "/images/no-image.jpg";
  }
}

// --------------------- ฟังก์ชัน clean HTML ---------------------
function cleanHTML(str) {
  if (!str) return "";
  return str
    .replace(/^"+|"+$/g, "")
    .replace(/\\\//g, "/")
    .replace(/\\"/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/\\n/g, "")
    .replace(/ style="[^"]*"/g, "")
    .trim();
}

// custom arrows
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

// --------------------- Component ---------------------
export default function RecommendedArticles({ typeID, currentId }) {
  const { locale } = useLocale();
  const [articles, setArticles] = useState([]);
  const [imgError, setImgError] = useState({});

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

  // slider config
  const settings = {
    dots: false,
    infinite: articles.length > 4, // เลื่อนได้ถ้ามากกว่า 4
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 900, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.layout}>
        <div className={styles.container}>
          <h3 className={styles.title}>
            {locale === "en" ? "Recommended Articles" : "บทความแนะนำ"}
          </h3>

          <Slider {...settings} className={styles.sliderWrapper}>
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

              // ✅ ถ้ายาวเกิน 120 ตัวอักษร ค่อยตัด + "..."
              const previewText =
                description.length > 120
                  ? description.slice(0, 120) + "..."
                  : description;

              const imgSrc = imgError[article.editoria_num]
                ? "/images/no-image.jpg"
                : getImageUrl(article.editoria_gallary);

              return (
                <Link
                  key={article.editoria_id}
                  href={`/editorial/${article.editoria_num}`}
                  className={styles.card}
                >
                  {/* ✅ รูปแบบ 16:9 */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "16/9",
                      overflow: "hidden",
                      borderRadius: "8px",
                    }}
                  >
                    <Image
                      src={imgSrc}
                      alt={title}
                      fill
                      style={{ objectFit: "cover" }}
                      className={styles.cardImage}
                      onError={() =>
                        setImgError((prev) => ({
                          ...prev,
                          [article.editoria_num]: true,
                        }))
                      }
                    />
                  </div>

                  {/* ✅ เนื้อหา */}
                  <div className={styles.cardContent}>
                    <h4 className={styles.cardTitle}>{title}</h4>
                    <p className="editorial-date">
                      {new Date(article.editoria_creacteAt).toLocaleDateString(
                        locale === "en" ? "en-EN" : "th-TH",
                        { day: "numeric", month: "long", year: "numeric" }
                      )}
                    </p>
                    <p
                      className={styles.cardDescription}
                      dangerouslySetInnerHTML={{ __html: previewText }}
                    />
                    <p className="read-more">
                      {locale === "en" ? "Read more" : "อ่านเพิ่มเติม"}{" "}
                      <FaArrowRightLong />
                    </p>
                  </div>
                </Link>
              );
            })}
          </Slider>
        </div>
      </div>
    </section>
  );
}
