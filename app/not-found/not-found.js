'use client';

import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <img
          src="/images/404-illustration.png"
          alt="Not Found"
          className={styles.image}
        />
        <h1 className={styles.title}>404</h1>
        <p className={styles.text}>
          The page you are looking for doesn’t exist or has been moved.
        </p>
        <Link href="/" className={styles.homeButton}>
          ⬅ Go back to Homepage
        </Link>
      </div>
    </div>
  );
}
