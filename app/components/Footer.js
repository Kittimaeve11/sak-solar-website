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
  const [contact, setContact] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // โหลด socials (mock data local)
    fetch("/api/data")
      .then((res) => res.json())
      .then((data) => setSocials(data.socials || []))
      .catch(() => setSocials([]));

    // โหลด API พร้อมกัน
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

        const [policiesData, productsData, contactData] = await Promise.all([
          policiesRes.json(),
          productsRes.json(),
          contactRes.json(),
        ]);

        // Policies
        if (policiesData.status && Array.isArray(policiesData.result)) {
          setPolicies(policiesData.result);
        } else {
          setPolicies([]);
        }

        //  Products
        if (productsData.status && Array.isArray(productsData.result)) {
          const productMenus = productsData.result.map((item) => ({
            label: item.producttypenameTH.trim(),
            href: `/products/${item.producttypeID}`,
          }));
          const extraMenus = [
            { label: "สินเชื่อโซล่ารูฟ", href: "https://saksiam.com/service/solarrooftop" },
            { label: "ใบรับรองการไฟฟ้า", href: "/file/Inverter.pdf" },
          ];
          setDynamicProducts([...productMenus, ...extraMenus]);
        }

        //  Contact
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
        setPolicies([]);
        setDynamicProducts([]);
        setContact(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Path ไอคอนโซเชียล
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

  // สองเมนูแรก (dynamic + static)
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

          {/* คอลัมน์ที่สาม: ติดต่อเรา + social */}
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
                <div className={styles.socialIcons}>
                  {Object.entries({
                    facebook: contact.facebook,
                    line: contact.line,
                    instagram: contact.instagram,
                    youtube: contact.youtube,
                    tiktok: contact.tiktok,
                  })
                    .filter(([_, url]) => url && url !== "null")
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

        <div className={styles.footerBottomImage}></div>
      </footer>

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
