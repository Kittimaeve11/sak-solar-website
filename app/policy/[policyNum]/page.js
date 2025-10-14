'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './PolicyPage.module.css';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function PolicyPage() {
  const { policyNum } = useParams();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลนโยบายจาก API
  useEffect(() => {
    if (!policyNum) return;

    const fetchPolicy = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/policyIDapi/${policyNum}`, {
          headers: { 'X-API-KEY': apiKey || '' },
        });
        const data = await res.json();

        if (data.status && data.result) {
          setPolicy(data.result);
        } else {
          setPolicy(null);
        }
      } catch (error) {
        console.error('Error fetching policy:', error);
        setPolicy(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [policyNum]);

  // ฟังก์ชันล้างและจัดรูปแบบ HTML จากหลังบ้าน
  const sanitizeContent = (html) => {
    if (!html) return '';

    let clean = html
      // ล้างเครื่องหมาย quote และ escape
      .replace(/^"(.*)"$/, '$1')
      .replace(/\\\//g, '/')
      .replace(/\\\\/g, '\\')
      .replace(/\\u003c/g, '<')
      .replace(/\\u003e/g, '>')
      .replace(/\n/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .replace(/<p>\s*<\/p>/g, '')
      .replace(/<p>&nbsp;<\/p>/g, '')
      .replace(/(<br\s*\/?>\s*){2,}/gi, '<br>')
      .trim();

    // ล้าง inline style และ margin จาก Word
    clean = clean.replace(/style="[^"]*"/gi, '');
    clean = clean.replace(/<div[^>]*>/gi, '<div>');

    // จัดระยะห่างเลขข้อให้เท่ากัน (ลบ space ก่อนตัวเลข)
    clean = clean.replace(/(?:<p>|<\/p>|<div>|<\/div>|<br\s*\/?>)+(?=\s*\d+\.)/gi, '');

    // ครอบเลขข้อด้วย div เพื่อควบคุม layout
    clean = clean.replace(
      /(\d+(?:\.\d+)+)\s/g,
      (match, number) =>
        `<div class="policy-item" data-level="${number.split('.').length - 1}">${number} `
    );

    // ปิด div ที่เปิดไว้ (กัน HTML แตก)
    clean = clean.replace(/<\/p>/gi, '');
    clean = clean.replace(/(<div class="policy-item"[^>]*>[^<]*)$/, '$1</div>');

    // รวม div ที่ซ้ำ
    clean = clean.replace(/<\/div>\s*<div class="policy-item"/g, '<div class="policy-item"');

    return clean;
  };

  // Loading skeleton
  if (loading) {
    return (
      <main className={styles.layoutContainer}>
        <div className={styles.skeletonHeader}></div>
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            className={
              i % 4 === 3 ? styles.skeletonBlockShort : styles.skeletonBlock
            }
          ></div>
        ))}
      </main>
    );
  }

  // กรณีไม่พบนโยบาย
  if (!policy) {
    return <div className={styles.notfound}>ไม่พบนโยบายนี้</div>;
  }

  // แสดงผลเนื้อหา
  return (
    <main className={`${styles.layoutContainer} fade-in`}>
      <h1 className={styles.headtitle}>
        {policy.policy_nameTH}
        {policy.policy_nameEN && ` (${policy.policy_nameEN})`}
      </h1>

      <div
        className={styles.tiptapContent}
        dangerouslySetInnerHTML={{
          __html: sanitizeContent(policy.policy_detailTH) || 'ไม่มีข้อมูล',
        }}
      />
    </main>
  );
}
