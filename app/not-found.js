// ❌ ห้ามมี 'use client' ใน not-found.js

import Image from "next/image";
import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <Image
          src="/images/404.png" //  ใช้รูป custom ได้ / หรือเปลี่ยนเป็น icon ที่มี
          alt="404 Not Found"
          width={350}
          height={250}
          className={styles.image}
          priority
        />
        <h1 className={styles.title}>404 - ไม่พบหน้านี้</h1>
        <p className={styles.text}>
          ขออภัย หน้าที่คุณกำลังค้นหาไม่มีอยู่ในระบบ หรืออาจถูกย้ายแล้ว
        </p>
        <Link href="/" className={styles.homeButton}>
          ⬅️ กลับสู่หน้าหลัก
        </Link>
      </div>
    </div>
  );
}
