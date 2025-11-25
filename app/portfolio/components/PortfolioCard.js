'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaCalendar } from "react-icons/fa";
import { handleLogPortfolioClick } from './handleLogClick';
import { formatDate } from './utils';

export default function PortfolioCard({ proj, locale, baseUrl, apiKey }) {
    const router = useRouter();

    return (
        <div
            key={proj?.id}
            className="portfolio-card"
            onClick={async () => {
                await handleLogPortfolioClick(proj, baseUrl, apiKey); // บันทึก Log
                router.push(`/portfolio/${proj?.id}`); // ไปหน้ารายละเอียด
            }}
        >
            <div className="portfolio-image-wrapper">
                <Image
                    src={proj?.coverImage || "/images/placeholder.png"}
                    alt={locale === 'th' ? proj?.titleTH : proj?.titleEN}
                    className="portfolio-image"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    quality={75}
                    priority
                />

                <div className="portfolio-banner">
                    <Image
                        src="/images/logosak-solar.png"
                        alt="logo"
                        width={120}
                        height={40}
                        className="banner-logo"
                    />
                    <div className="banner-text">
                        {locale === 'th'
                            ? 'ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด'
                            : 'Sak Siam Solar Energy Co., Ltd.'}
                    </div>
                </div>
            </div>

            <div className="portfolio-content">
                <h3
                    className="project-title"
                    style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordBreak: 'break-word',
                    }}
                >
                    {locale === 'th' ? proj.titleTH : proj.titleEN}
                </h3>

                <ul className="project-details">
                    <li>
                        <strong>{locale === 'th' ? 'ขนาดติดตั้ง' : 'Installation Size'}</strong>
                        <span>{proj.size}</span>
                    </li>
                    <li>
                        <strong>{locale === 'th' ? 'ประเภทผลิตภัณฑ์' : 'Product Type'}</strong>
                        <span>{locale === 'th' ? proj.productTypeTH : proj.productTypeEN}</span>
                    </li>
                    <li>
                        <strong>{locale === 'th' ? 'จำนวนแผง' : 'Panel Count'}</strong>
                        <span>
                            {proj.panelCount} {locale === 'th' ? 'แผง' : 'panels'}
                        </span>
                    </li>
                    <li className="date-post">
                        <strong><FaCalendar /></strong>
                        <span>{formatDate(proj.postDate, locale)}</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
