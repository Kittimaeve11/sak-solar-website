"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../../styles/Footer.module.css"; // import CSS module สำหรับสไตล์ footer
import { menuItems as staticMenu } from "../config/footer"; // เมนูพื้นฐานแบบ static เช่น “บริการของเรา”, “เกี่ยวกับเรา”

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API; // base URL ของ API
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API; // API key สำหรับเรียก backend

export default function Footer() {
  /* =========================
     State สำหรับเก็บข้อมูล
  ========================== */
  const [socials, setSocials] = useState([]); // ข้อมูล Social Media (mock data)
  const [policies, setPolicies] = useState([]); // ข้อมูลนโยบายจาก policyapi
  const [dynamicProducts, setDynamicProducts] = useState([]); // เมนูสินค้าจาก API
  const [contact, setContact] = useState(null); // ข้อมูลติดต่อบริษัท
  const [loading, setLoading] = useState(true); // ตัวแปรสถานะการโหลดข้อมูล

  /* =========================
     โหลดข้อมูลจาก API
  ========================== */
  useEffect(() => {
    // โหลดข้อมูล socials จาก mock API ภายในโปรเจกต์
    fetch("/api/data")
      .then((res) => res.json())
      .then((data) => setSocials(data.socials || []))
      .catch(() => setSocials([]));

    // โหลดข้อมูล policy, product และ contact พร้อมกัน
    const fetchData = async () => {
      try {
        const [policiesRes, productsRes, contactRes] = await Promise.all([
          fetch(`${baseUrl}/api/policyapi`, {
            headers: { "X-API-KEY": apiKey },
          }),
          fetch(`${baseUrl}/api/productHeaderapi`, {
            headers: { "X-API-KEY": apiKey },
          }),
          fetch(`${baseUrl}/api/contactapi`, {
            headers: { "X-API-KEY": apiKey },
          }),
        ]);

        // แปลงผลลัพธ์ทั้งหมดเป็น JSON
        const [policiesData, productsData, contactData] = await Promise.all([
          policiesRes.json(),
          productsRes.json(),
          contactRes.json(),
        ]);

        // 1. จัดการข้อมูลนโยบาย
        if (policiesData.status && Array.isArray(policiesData.result)) {
          setPolicies(policiesData.result);
        } else {
          setPolicies([]);
        }

        // 2. จัดการข้อมูลสินค้า (dynamic product)
        if (productsData.status && Array.isArray(productsData.result)) {
          const productMenus = productsData.result.map((item) => ({
            label: item.producttypenameTH.trim(),
            href: `/products/${item.producttypeID}`,
          }));

          // เพิ่มเมนูภายนอกเพิ่มเติม
          const extraMenus = [
            {
              label: "สินเชื่อโซล่ารูฟ",
              href: "https://saksiam.com/service/solarrooftop",
            },
            { label: "ใบรับรองการไฟฟ้า", href: "/file/Inverter.pdf" },
          ];

          setDynamicProducts([...productMenus, ...extraMenus]);
        }

        // 3. จัดการข้อมูลติดต่อบริษัท
        if (
          contactData.status &&
          Array.isArray(contactData.result) &&
          contactData.result.length > 0
        ) {
          setContact(contactData.result[0]);
        } else {
          setContact(null);
        }
      } catch (err) {
        console.error("Error fetching footer data:", err);
        // หากเกิดข้อผิดพลาด จะรีเซ็ตข้อมูลทั้งหมดเป็นค่าว่าง
        setPolicies([]);
        setDynamicProducts([]);
        setContact(null);
      } finally {
        setLoading(false); // ปิดสถานะกำลังโหลด
      }
    };

    fetchData();
  }, []);

  /* =========================
     Path รูปไอคอน Social Media
  ========================== */
  const iconPath = useMemo(
    () => ({
      facebook: "/images/facebook.png",
      instagram: "/images/instagram.png",
      tiktok: "/images/tiktok.png",
      line: "/images/line.png",
      youtube: "/images/youtube.png",
    }),
    []
  );

  /* =========================
     รวมเมนู dynamic + static
     (ใช้สำหรับคอลัมน์ 2 ช่องแรก)
  ========================== */
  const firstTwoMenus = [
    {
      ...staticMenu[0],
      items:
        dynamicProducts.length > 0
          ? dynamicProducts
          : staticMenu[0].items, // ใช้ dynamic ถ้ามีข้อมูลจาก API ถ้าไม่มีก็ใช้ static
    },
    staticMenu[1], // เมนูที่สองจาก config/footer
  ];

  /* =========================
     Layout ส่วน Footer
  ========================== */
  return (
    <div>
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          {/* คอลัมน์ที่ 1: บริการของเรา + นโยบาย */}
          <div className={styles.column}>
            <h4>{firstTwoMenus[0].title}</h4>
            <ul>
              {firstTwoMenus[0].items.map(({ label, href }, i) => (
                <li key={href || label + i}>
                  {href ? <Link href={href}>{label}</Link> : <span>{label}</span>}
                </li>
              ))}
            </ul>

            <h4>นโยบาย</h4>
            {loading ? (
              <p>กำลังโหลด...</p>
            ) : policies.length > 0 ? (
              <ul>
                {policies.map((policy, i) => (
                  <li
                    key={policy.policyID}
                    className="fade-in"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <Link href={`/policy/${policy.policy_Num}`}>
                      {policy.policy_nameTH}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>ไม่มีนโยบาย</p>
            )}
          </div>

          {/* คอลัมน์ที่ 2: เมนูจาก static config */}
          <div className={styles.column}>
            <h4>{firstTwoMenus[1].title}</h4>
            <ul>
              {firstTwoMenus[1].items.map(({ label, href }, i) => (
                <li key={href || label + i}>
                  {href ? <Link href={href}>{label}</Link> : <span>{label}</span>}
                </li>
              ))}
            </ul>
          </div>

          {/* คอลัมน์ที่ 3: ติดต่อเรา + โซเชียลมีเดีย */}
          <div className={styles.column}>
            <h4>ติดต่อเรา</h4>
            {loading ? (
              <p>กำลังโหลด...</p>
            ) : contact ? (
              <div className="fade-in">
                <ul>
                  <li>บริษัท ศักดิ์สยามลิสซิ่ง จำกัด (มหาชน)</li>
                  <li>{contact.address_th}</li>
                  <li>โทรศัพท์ : {contact.call_center}</li>
                  <li>แฟกซ์ : {contact.fax}</li>
                  <li>อีเมล : {contact.email_main}</li>
                </ul>

                {/* ส่วนแสดงไอคอน Social Media */}
                <div className={styles.socialIcons}>
                  {Object.entries({
                    facebook: contact.facebook,
                    line: contact.line,
                    instagram: contact.instagram,
                    youtube: contact.youtube,
                    tiktok: contact.tiktok,
                  })
                    .filter(([_, url]) => url && url !== "null") // แสดงเฉพาะที่มีลิงก์จริง
                    .map(([key, url], i) => (
                      <Link
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={key}
                        className="fade-in"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <Image
                          src={iconPath[key] || "/images/default-icon.png"}
                          alt={key}
                          width={36}
                          height={36}
                        />
                      </Link>
                    ))}
                </div>
              </div>
            ) : (
              <p>ไม่มีข้อมูลติดต่อ</p>
            )}
          </div>
        </div>

        {/* พื้นหลังตกแต่งส่วนล่างของ Footer */}
        <div className={styles.footerBottomImage}></div>
      </footer>

      {/* ส่วนล่างสุดของ Footer */}
      <div className={styles.footerBottomWrapper}>
        <div className={styles.footerBottom}>
          © 2025 Copyright: SAKSIAM SOLAR ENERGY CO., LTD BY SAKSIAM LEASING
          PUBLIC COMPANY LIMITED. All Rights Reserved.

          {/* กลุ่มโลโก้บริษัทและหน่วยงาน */}
          <div className={styles.logoGroup}>
            {/* โลโก้ Saksiam Solar */}
            <Image
              src="/images/logo3.8549861c.png"
              alt="โลโก้สีส้ม"
              width={40}
              height={40}
            />

            {/* โลโก้การไฟฟ้า (เปิดไฟล์ PDF เมื่อคลิก) */}
            <Link
              href="/file/Inverter.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <Image
                src="/images/Logo-of-the-Provincial-Electricity-Authority-of-Thailand.png"
                alt="โลโก้การไฟฟ้าส่วนภูมิภาค"
                width={40}
                height={40}
              />
            </Link>

            {/* โลโก้ กกพ */}
            <Image
              src="/images/ERCNewLogo.png"
              alt="โลโก้กกพ"
              width={40}
              height={40}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
