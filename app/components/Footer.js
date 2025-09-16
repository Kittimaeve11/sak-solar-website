"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../../styles/Footer.module.css";
import { menuItems as staticMenu } from "../config/footer";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function Footer() {
  const [socials, setSocials] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [dynamicProducts, setDynamicProducts] = useState([]); 
  const [contact, setContact] = useState(null); // ✅ contact จาก API

  useEffect(() => {
    // โหลด social media (จากไฟล์ local api/data เดิม ถ้ายังต้องใช้)
    fetch("/api/data")
      .then((res) => res.json())
      .then((data) => setSocials(data.socials || []))
      .catch(() => setSocials([]));

    // โหลดนโยบาย
    const fetchPolicies = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/policyapi`, {
          headers: { "X-API-KEY": `${apiKey}` },
        });
        const data = await res.json();
        if (data.status && Array.isArray(data.result)) {
          setPolicies(data.result);
        } else {
          setPolicies([]);
        }
      } catch (error) {
        console.error("Error fetching policies:", error);
        setPolicies([]);
      }
    };

    // โหลดสินค้า
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/productHeaderapi`, {
          headers: { "X-API-KEY": `${apiKey}` },
        });
        const data = await res.json();
        if (data.status && Array.isArray(data.result)) {
          const productMenus = data.result.map((item) => ({
            label: item.producttypenameTH.trim(),
            href: `/products/${item.producttypeID}`,
          }));
          const extraMenus = [
            { label: "สินเชื่อโซล่ารูฟ", href: "https://saksiam.com/service/solarrooftop" },
            { label: "ใบรับรองการไฟฟ้า", href: "/file/Inverter.pdf" },
          ];
          setDynamicProducts([...productMenus, ...extraMenus]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    // ✅ โหลดข้อมูลติดต่อ
    const fetchContact = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/contactapi`, {
          headers: { "X-API-KEY": `${apiKey}` },
        });
        const data = await res.json();
        if (data.status && Array.isArray(data.result) && data.result.length > 0) {
          setContact(data.result[0]); // ใช้ record แรก
        }
      } catch (err) {
        console.error("Error fetching contact:", err);
      }
    };

    fetchPolicies();
    fetchProducts();
    fetchContact();
  }, []);

  // icon map
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

  // เมนูสินค้า
  const firstTwoMenus = [
    {
      ...staticMenu[0],
      items: dynamicProducts.length > 0 ? dynamicProducts : staticMenu[0].items,
    },
    staticMenu[1],
  ];

  return (
    <div>
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          {/* คอลัมน์แรก: บริการของเรา + นโยบาย */}
          <div className={styles.column}>
            <h4>{firstTwoMenus[0].title}</h4>
            <ul>
              {firstTwoMenus[0].items.map(({ label, href }, i) => (
                <li key={href || label + i}>
                  {href ? <Link href={href}>{label}</Link> : <span>{label}</span>}
                </li>
              ))}
            </ul>

            {policies.length > 0 && (
              <>
                <h4>นโยบาย</h4>
                <ul>
                  {policies.map((policy) => (
                    <li key={policy.policyID}>
                      <Link href={`/policy/${policy.policy_Num}`}>
                        {policy.policy_nameTH}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* คอลัมน์ที่สอง */}
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

          {/* คอลัมน์ที่สาม: ติดต่อเรา + social icons */}
          <div className={styles.column}>
            {contact && (
              <>
                <h4>ติดต่อเรา</h4>
                <ul>
                  <li> บริษัท ศักดิ์สยามลิสซิ่ง จำกัด (มหาชน) </li>
                  <li>{contact.address_th}</li>
                  {/* <li>โทรศัพท์ : {contact.phone_number}</li> */}
                  <li>โทรศัพท์ : {contact.call_center}</li>
                  <li>แฟกซ์ : {contact.fax}</li>
                  <li>อีเมล : {contact.email_main}</li>
                  {/* <li>{contact.officehours_th}</li> */}
                </ul>
                <div className={styles.socialIcons}>
                  {Object.entries({
                    facebook: contact.facebook,
                    line: contact.line,
                    instagram: contact.instagram,
                    youtube: contact.youtube,
                    tiktok: contact.tiktok,
                  })
                    .filter(([_, url]) => url && url !== "null") //  แสดงเฉพาะที่มีลิงก์จริง
                    .map(([key, url]) => (
                      <Link
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={key}
                        className={styles.iconWrapper}
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
              </>
            )}
          </div>
        </div>

        <div className={styles.footerBottomImage}></div>
      </footer>

      <div className={styles.footerBottomWrapper}>
        <div className={styles.footerBottom}>
          © 2025 Copyright: SAKSIAM SOLAR ENERGY CO., LTD BY SAKSIAM LEASING PUBLIC COMPANY LIMITED. All Rights Reserved.
          <div className={styles.logoGroup}>
            <Image src="/images/logo3.8549861c.png" alt="โลโก้สีส้ม" width={100} height={40} />
            <Link
              href="/file/Inverter.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <Image
                src="/images/Logo-of-the-Provincial-Electricity-Authority-of-Thailand.png"
                alt="โลโก้การไฟฟ้าส่วนภูมิภาค"
                width={100}
                height={40}
              />
            </Link>
            <Image src="/images/ERCNewLogo.png" alt="โลโก้กกพ" width={100} height={40} />
          </div>
        </div>
      </div>
    </div>
  );
}
