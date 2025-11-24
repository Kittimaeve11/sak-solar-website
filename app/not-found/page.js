'use client';

import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFoundPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>404</h1>
        <p className={styles.text}>ขออภัย ไม่พบหน้าที่คุณต้องการ</p>
        <Link href="/" className={styles.homeButton}>
          ⬅ กลับสู่หน้าหลัก
        </Link>
      </div>
    </div>
  );
}
