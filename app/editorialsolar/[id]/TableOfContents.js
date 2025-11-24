'use client';

import Link from "next/link";
import { IoMdArrowDropright } from "react-icons/io";
import styles from "./EditorialDetailPage.module.css";

export default function TableOfContents({ subList, activeIndex, locale }) {
  if (!subList || subList.length === 0) return null;

  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.tocTitle}>
        {locale === "en" ? "Table of Contents" : "สารบัญ"}
      </h3>
      <ul className={styles.tocList}>
        {subList.map((sub, index) => (
          <li key={index} className={styles.tocItem}>
            <Link
              href={`#section-${index}`}
              className={`${styles.tocLink} ${activeIndex === index ? styles.active : ""}`}
            >
              <IoMdArrowDropright className={styles.tocIcon} />
              <span className={styles.tocText}>
                {locale === "en" ? sub?.subtitiEN || sub?.subtitiTH : sub?.subtitiTH}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
