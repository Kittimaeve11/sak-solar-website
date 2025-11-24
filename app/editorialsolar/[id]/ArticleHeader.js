'use client';

import Link from "next/link";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import styles from "./EditorialDetailPage.module.css";

export default function ArticleHeader({ title, date, locale }) {
  return (
    <div className={styles.headerportfolio}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.meta}>
        <Link href="/" className={styles.link}>
          {locale === "en" ? "Home" : "หน้าหลัก"}{" "}
          <MdKeyboardDoubleArrowRight style={{ fontSize: 19 }} />
        </Link>

        <Link href="/editorialsolar" className={styles.link}>
          {locale === "en" ? "Back" : "ย้อนกลับ"}{" "}
          <MdKeyboardDoubleArrowRight style={{ fontSize: 19 }} />
        </Link>

        <span className={styles.articleName}>{title}</span>
      </div>

      <time className={styles.date}>
        {locale === "en" ? "Posted on: " : "วันที่โพสต์ : "}
        {date}
      </time>
    </div>
  );
}
