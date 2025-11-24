'use client';

import Image from "next/image";
import Gallery from "./gallery";
import styles from "./EditorialDetailPage.module.css";

export default function ArticleSubSection({
  index,
  title,
  desc,
  images,
  sectionRef,
  isActive,
}) {


  return (
    <section
      ref={sectionRef}
      id={`section-${index}`}
      className={styles.subSection}
    >
      {/* ชื่อหัวข้อย่อย */}
      <h2 className={`${styles.subTitle} ${isActive ? styles.activeTitle : ""}`}>
        {title}
      </h2>

      {/* เนื้อหา */}
      <div
        className={styles.subContent}
        dangerouslySetInnerHTML={{ __html: desc }}
      />

      {/* แสดงรูปแบบ Gallery (ถ้ามีรูป) */}
      {images && images.length > 0 && (
        <div className={styles.section}>
          <Gallery images={images} />
        </div>
      )}
    </section>
  );
}
