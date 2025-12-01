"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../../styles/Footer.module.css";
import { menuItems as staticMenu } from "../config/footer";
import { useLocale } from "../Context/LocaleContext";

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
   Footer Component
====================== */
export default function Footer() {
  const { messages, locale } = useLocale();

  const [socials, setSocials] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [dynamicProducts, setDynamicProducts] = useState([]); // จาก API productHeaderapi เท่านั้น
  const [contact, setContact] = useState(null);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingPolicies, setLoadingPolicies] = useState(true);
  const [loadingContact, setLoadingContact] = useState(true);
  const API_ENABLED = false;
  /* ======================
     Load data from API
  ======================= */
  useEffect(() => {
    if (!API_ENABLED) {
      // API ปิด → ใช้ข้อมูล fallback แทน
      setDynamicProducts([]); // หรือ set fallback product menu static ก็ได้
      setPolicies([]);
      setContact(null);

      setLoadingProducts(false);
      setLoadingPolicies(false);
      setLoadingContact(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [policiesRes, productsRes, contactRes] = await Promise.all([
          fetch(`${baseUrl}/api/policyapi`, { headers: { "X-API-KEY": apiKey } }),
          fetch(`${baseUrl}/api/productHeaderapi`, { headers: { "X-API-KEY": apiKey } }),
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

        // Dynamic Product Menu (จาก API เท่านั้น)
        if (productsData?.status && Array.isArray(productsData.result)) {
          const productMenus = productsData.result.map((item) => ({
            label: item.producttypenameTH.trim(),
            href: `/products?categories=${slugify(item.producttypenameEN)}`,
          }));
          setDynamicProducts(productMenus);
        } else {
          setDynamicProducts([]); // ไม่มีข้อมูลจาก API
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
     Render Footer
  ======================= */
  return (
    <div>
      <footer className={styles.footer}>
        <div className={styles.footerContent}>

          {/* Column 1: Products + Policies */}
          <div className={styles.column}>
            <h4>{staticMenu[0].title}</h4>

            <ul>
              {loadingProducts ? (
                <li>กำลังโหลด...</li>
              ) : dynamicProducts.length > 0 ? (
                <>
                  {dynamicProducts.map(({ label, href }, i) => (
                    <li
                      key={href || label + i}
                      className="fade-in"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <Link href={href}>{label}</Link>
                    </li>
                  ))}

                  {/*  StaticMenu ต่อท้าย dynamicProducts */}
                  {staticMenu[0].items.map(({ label, href }, i) => (
                    <li
                      key={href || label + i}
                      className="fade-in"
                      style={{ animationDelay: `${(dynamicProducts.length + i) * 0.1}s` }}
                    >
                      <Link href={href}>{label}</Link>
                    </li>
                  ))}
                </>
              ) : (
                <>
                  <li>ไม่พบข้อมูลสินค้า</li>

                  {/*  StaticMenu ยังแสดงเวลา API ว่างด้วย */}
                  {staticMenu[0].items.map(({ label, href }, i) => (
                    <li key={href || label + i}>
                      <Link href={href}>{label}</Link>
                    </li>
                  ))}
                </>
              )}
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
              <p>ไม่พบข้อมูลนโยบาย</p>
            )}
          </div>

          {/* Column 2 */}
          <div className={styles.column}>
            <h4>{staticMenu[1].title}</h4>
            <ul>
              {staticMenu[1].items.map(({ label, href }, i) => (
                <li key={href || label + i}>
                  {href ? <Link href={href}>{label}</Link> : <span>{label}</span>}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 */}
          <div className={styles.column}>
            <h4>{messages.contact}</h4>
            {loadingContact ? (
              <p>กำลังโหลด...</p>
            ) : contact ? (
              <div className="fade-in">
                <ul>
                  <li>{messages.company}</li>
                  <li>{contact.address_th}</li>
                  <li>{messages.telephone} : {contact.call_center}</li>
                  <li>{messages.fax} : {contact.fax}</li>
                  <li>{messages.email} : {contact.email_main}</li>
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
              <p>ไม่พบข้อมูลติดต่อ</p>
            )}
          </div>
        </div>

        <div className={styles.footerBottomImage}></div>
      </footer>

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
