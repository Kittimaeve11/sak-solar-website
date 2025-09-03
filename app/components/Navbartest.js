'use client';

import React from 'react';
import { useLocale } from '../Context/LocaleContext';
import { usePathname } from 'next/navigation';
import { FaPhone } from "react-icons/fa6";
import Link from 'next/link';
import styles from '../../styles/Navbar.module.css';
import Image from 'next/image';

export default function Navbar() {
    const { messages, switchLocale, locale } = useLocale();
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    const isAboutPage = pathname === '/About';
    const isContactPage = pathname === '/Contact';

    return (
        <div className={styles.navWrapper}>
            <nav className={styles.navbar}>

                <div className={styles.leftSection}>
                    <div className={styles.logoContainer}>
                        <Image
                            src="/logo/logo-Sukhumvit.png"
                            alt="Logo"
                            fill
                            style={{ objectFit: 'contain' }}
                            sizes="470px"
                            priority 
                        />



                    </div>
                </div>

                <div className={styles.localeContactGroup}>
                    <div className={styles.localeButtons}>
                        <span
                            className={`${styles.localeItem} ${locale === 'th' ? styles.disabled : ''} `}
                            onClick={() => locale !== 'th' && switchLocale('th')}
                        >
                            TH
                        </span>

                        <span className={styles.localeDivider}> | </span>

                        <span
                            className={`${styles.localeItem} ${locale === 'en' ? styles.disabled : ''} `}
                            onClick={() => locale !== 'en' && switchLocale('en')}
                        >
                            ENG
                        </span>
                    </div>
                    {/* ✅ ปุ่มติดต่อเรา + เกี่ยวกับเรา+ โทร */}
                    <div className={styles.contactActions}>
                        <a href="tel:1487" className={styles.callLink} title="โทร 1487">
                            <FaPhone className={styles.phoneIcon} />
                            <span className={styles.phoneNumber}>1487</span>
                        </a>
                        <div className="flex items-center gap-2">
                            <Link
                                href="https://saksiam.com/home"
                                className={`${styles.contact}  font-500`}
                            >
                                {messages.backpage}
                            </Link>

                            <span> | </span>


                            <Link
                                href="/About/"
                                className={`${styles.contact} ${isAboutPage ? styles.active : ''} font-500`}
                            >
                                {messages.about}
                            </Link>

                            <span> | </span>

                            <Link
                                href="/Contact/"
                                className={`${styles.contact} ${isContactPage ? styles.active : ''} font-500`}
                            >
                                {messages.contact}
                            </Link>
                        </div>
                    </div>
                </div >
            </nav >
        </div >

    );
}
