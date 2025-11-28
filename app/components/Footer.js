"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../../styles/Footer.module.css";
import { menuItems as staticMenu } from "../config/footer";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* ======================
   Helper: slugify
====================== */
const slugify = (name) =>
  name
    ?.toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "") || "";

/* ======================
   Static extra menu (ไม่ใช่ API)
====================== */
const EXTRA_MENUS = [
  {
    label: "สินเชื่อโซล่ารูฟ",
    href: "https://saksiam.com/service/solarrooftop",
    external: true,
  },
  { label: "ใบรับรองการไฟฟ้า", href: "/file/Inverter.pdf" },
];

/* ======================
   Footer Component
====================== */
export default function Footer() {
  const [socials, setSocials] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [dynamicProducts, setDynamicProducts] = useState([]); // จาก API productHeaderapi เท่านั้น
  const [contact, setContact] = useState(null);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingPolicies, setLoadingPolicies] = useState(true);
  const [loadingContact, setLoadingContact] = useState(true);

  /* ======================
     Load data from API
  ======================= */
  useEffect(() => {
    // local /api/data (ถ้ามีใช้ socials)
    fetch("/api/data")
      .then((res) => res.json())
      .then((data) => setSocials(data.socials || []))
      .catch(() => setSocials([]));

    const fetchData = async () => {
      try {
        const API_ENABLED = false;

        if (!API_ENABLED) {
          setLoadingProducts(false);
          setLoadingPolicies(false);
          setLoadingContact(false);
          return;
        }

        const [policiesRes, productsRes, contactRes] = await Promise.all([
          fetch(`${baseUrl}/api/policyapi`, { headers: { "X-API-KEY": apiKey } }),
          fetch(`${baseUrl}/api/productHeaderapi`, {
            headers: { "X-API-KEY": apiKey },
          }),
          fetch(`${baseUrl}/api/contactapi`, { headers: { "X-API-KEY": apiKey } }),
        ]);

        const [policiesData, productsData, contactData] = await Promise.all([
          policiesRes.json(),
          productsRes.json(),
          contactRes.json(),
        ]);

        // Policies
        setPolicies(
          policiesData?.status && Array.isArray(policiesData.result)
            ? policiesData.result
            : []
        );
        setLoadingPolicies(false);

        // Dynamic Product Menu (เฉพาะ API)
        if (productsData?.status && Array.isArray(productsData.result)) {
          const productMenus = productsData.result.map((item) => ({
            label: item.producttypenameTH.trim(),
            href: `/products?categories=${slugify(item.producttypenameEN)}`, // SEO friendly
          }));
          setDynamicProducts(productMenus);
        } else {
          setDynamicProducts([]);
        }
        setLoadingProducts(false);

        // Contact Info
        setContact(
          contactData?.status &&
            Array.isArray(contactData.result) &&
            contactData.result.length > 0
            ? contactData.result[0]
            : null
        );
        setLoadingContact(false);
      } catch (err) {
        console.error("Error fetching footer data:", err);
        setPolicies([]);
        setDynamicProducts([]);
        setContact(null);
        setLoadingPolicies(false);
        setLoadingProducts(false);
        setLoadingContact(false);
      }
    };

    fetchData();
  }, []);

  /* ======================
     Social Icon Path
  ======================= */
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

  /* ======================
     Merge Static & Dynamic (เฉพาะ API)
  ======================= */
  const firstTwoMenus = [
    {
      ...staticMenu[0],
      // ถ้ามีข้อมูลจาก API ใช้อันนั้น, ถ้าไม่มีใช้ค่าจาก config เดิมเป็น fallback
      items:
        dynamicProducts.length > 0 ? dynamicProducts : staticMenu[0].items || [],
    },
    staticMenu[1],
  ];

  /* ======================
     Render Footer
  ======================= */
  return (
    <div>
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          {/* Column 1: Products + Policies */}
          <div className={styles.column}>
            <h4>{firstTwoMenus[0].title}</h4>

            <ul>
              {/* แสดงกำลังโหลดเฉพาะ API */}
              {loadingProducts ? (
                <li>กำลังโหลด...</li>
              ) : firstTwoMenus[0].items.length > 0 ? (
                firstTwoMenus[0].items.map(({ label, href, external }, i) => (
                  <li
                    key={href || label + i}
                    className="fade-in"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {href ? (
                      <Link
                        href={href}
                        {...(external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {label}
                      </Link>
                    ) : (
                      <span>{label}</span>
                    )}
                  </li>
                ))
              ) : (
                <li>ไม่มีข้อมูลบริการ</li>
              )}

              {/* Extra Static Menus (ไม่ต้องโหลด API) */}
              {EXTRA_MENUS.map(({ label, href, external }, i) => (
                <li
                  key={href || label + "extra" + i}
                  className="fade-in"
                  style={{ animationDelay: `${(firstTwoMenus[0].items.length + i) * 0.1}s` }}
                >
                  <Link
                    href={href}
                    {...(external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4>นโยบาย</h4>
            {loadingPolicies ? (
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

          {/* Column 2 */}
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

          {/* Column 3 */}
          <div className={styles.column}>
            <h4>ติดต่อเรา</h4>
            {loadingContact ? (
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

                {/* Social Icons */}
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

      {/* Bottom Footer */}
      <div className={styles.footerBottomWrapper}>
        <div className={styles.footerBottom}>
          © 2025 Copyright: SAKSIAM SOLAR ENERGY CO., LTD BY
          SAKSIAM LEASING PUBLIC COMPANY LIMITED. All Rights Reserved.

          <div className={styles.logoGroup}>
            <Image
              src="/images/logo3.8549861c.png"
              alt="โลโก้สีส้ม"
              width={40}
              height={40}
            />

            <Link
              href="/file/Inverter.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/Logo-of-the-Provincial-Electricity-Authority-of-Thailand.png"
                alt="โลโก้การไฟฟ้า"
                width={40}
                height={40}
              />
            </Link>

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
