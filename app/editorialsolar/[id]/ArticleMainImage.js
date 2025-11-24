'use client';

import Image from "next/image";
import styles from "./EditorialDetailPage.module.css";

export default function ArticleMainImage({ images, title }) {
  if (!images || images.length === 0) return null;

  return images.map((url, idx) => (
    <Image
      key={idx}
      src={url}
      alt={`${title} - ${idx + 1}`}
      width={800}
      height={400}
      className={styles.mainImage}
      priority={idx === 0}
    />
  ));
}
