"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../../styles/Footer.module.css"; // ✅ ปรับ path ตามโปรเจกต์คุณ
import { menuItems } from "../config/footer"; // ✅ ต้องมีไฟล์นี้

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function Footer() {
  const [socials, setSocials] = useState([]);
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    // โหลด social media จาก local API
    fetch("/api/data")
      .then((res) => res.json())
      .then((data) => setSocials(data.socials || []))
      .catch(() => setSocials([]));

    // โหลดนโยบายจาก API
    const fetchPolicies = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/policyapi`, {
          headers: {
            'X-API-KEY': `${apiKey}`,
          },
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

    fetchPolicies();
  }, []);
  const iconPath = useMemo(() => ({
    facebook: "/images/facebook.png",
    instagram: "/images/instagram.png",
    tiktok: "/images/tiktok.png",
    line: "/images/line.png",
    youtube: "/images/youtube.png",
  }), []);

  const firstTwoMenus = menuItems.slice(0, 2);
  const contactMenu = menuItems.find((item) => item.title === "ติดต่อเรา");

  return (
    <div>
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          {/* คอลัมน์แรก */}
          <div className={styles.column}>
            <h4>{firstTwoMenus[0].title}</h4>
            <ul>
              {firstTwoMenus[0].items.map(({ label, href }, i) => (
                <li key={href || label + i}>
                  {href ? <Link href={href}>{label}</Link> : <span>{label}</span>}
                </li>
              ))}
            </ul>

            {/* แสดงนโยบายจาก API */}
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
            {contactMenu && (
              <>
                <h4>{contactMenu.title}</h4>
                <ul>
                  {contactMenu.items.map(({ label }, i) => (
                    <li key={label + i}>
                      <span style={{ color: "white" }}>{label}</span>
                    </li>
                  ))}
                </ul>
                <div className={styles.socialIcons}>
                  {socials.map(({ id, url, icon }) => (
                    <Link
                      key={id}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={id}
                      className={styles.iconWrapper}
                    >
                      <Image
                        src={iconPath[icon] || "/images/default-icon.png"}
                        alt={id}
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

        {/* รูปตกแต่งด้านล่าง */}
        <div className={styles.footerBottomImage}></div>
      </footer>

      {/* ส่วนลิขสิทธิ์ + โลโก้ */}
      <div className={styles.footerBottomWrapper}>
        <div className={styles.footerBottom}>
          © 2025 Copyright: SAKSIAM SOLAR ENERGY CO., LTD BY SAKSIAM LEASING PUBLIC COMPANY LIMITED. All Rights Reserved.
          <div className={styles.logoGroup}>
            <Image
              src="/images/logo3.8549861c.png"
              alt="โลโก้สีส้ม"
              width={100}
              height={40}
            />
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
            <Image
              src="/images/ERCNewLogo.png"
              alt="โลโก้กกพ"
              width={100}
              height={40}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
