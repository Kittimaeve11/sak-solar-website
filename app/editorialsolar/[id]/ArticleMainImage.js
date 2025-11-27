'use client';

import Image from "next/image";
import styles from "./EditorialDetailPage.module.css";

export default function ArticleMainImage({ images = [], title }) {
  if (!images || images.length === 0) return null;

  return (
    <Image
      src={images[0]}    // ⬅️ รูปแรกเท่านั้น
      alt={title}
      width={900}
      height={450}
      className={styles.mainImage}
      priority
    />
  );
}
