"use client";
import Image from "next/image";
import { FaCalendar } from "react-icons/fa";
import { formatDate } from "./utils";
import { useLocale } from "../Context/LocaleContext";

export default function PortfolioCard({ proj, router }) {
  const { locale } = useLocale();

  return (
    <div
      className="portfolio-card"
      onClick={() => router.push(`/portfolio/${proj.id}`)}
    >
      <div className="portfolio-image-wrapper">
        <Image
          src={proj.coverImage || "/images/placeholder.png"}
          alt={proj.titleTH || "portfolio"}
          fill
          unoptimized
          className="portfolio-image"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        <div className="portfolio-banner">
          <Image
            src="/images/logosak-solar.png"
            alt="logo"
            width={120}
            height={40}
            className="banner-logo"
          />
          <div className="banner-text">
            {locale === "th"
              ? "ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด"
              : "Sak Siam Solar Energy Co., Ltd."}
          </div>
        </div>
      </div>

      <div className="portfolio-content">
        <h3 className="project-title">
          {locale === "th" ? proj.titleTH : proj.titleEN}
        </h3>
        <ul className="project-details">
          <li>
            <strong>{locale === "th" ? "ขนาดติดตั้ง" : "Installation Size"}</strong>
            <span>{proj.size}</span>
          </li>
          <li>
            <strong>
              {locale === "th" ? "ประเภทผลิตภัณฑ์" : "Product Type"}
            </strong>
            <span>{proj.productTypeTH}</span>
          </li>
          <li>
            <strong>{locale === "th" ? "จำนวนแผง" : "Panel Count"}</strong>
            <span>
              {proj.panelCount} {locale === "th" ? "แผง" : "panels"}
            </span>
          </li>
          <li className="date-post">
            <strong>
              <FaCalendar />
            </strong>
            <span>{formatDate(proj.postDate, locale)}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
