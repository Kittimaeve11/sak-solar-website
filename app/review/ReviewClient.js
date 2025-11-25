'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import '../../styles/review.css';
import { useLocale } from '../Context/LocaleContext';
import VideoGrid from './components/VideoGrid';
import PaginationControls from './components/PaginationControls';
import { extractVideoId } from './components/utils';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function ReviewClient() {
    const { locale } = useLocale();
    const [reviews, setReviews] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingBanner, setLoadingBanner] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const mainRef = useRef(null);
    const itemsPerPage = 18;

    useEffect(() => {
        const updateDevice = () => setIsMobile(window.innerWidth <= 768);
        updateDevice();

        const load = async () => {
            try {
                const [reviewRes, bannerRes] = await Promise.all([
                    fetch(`${baseUrl}/api/Reviewapi?offset=1&limit=999`, { headers: { 'X-API-KEY': apiKey } }),
                    fetch(`${baseUrl}/api/branderIDapi/11`, { headers: { 'X-API-KEY': apiKey } }),
                ]);

                const reviewJson = await reviewRes.json();
                const bannerJson = await bannerRes.json();

                setReviews(reviewJson?.result?.data || []);
                setBanners(Array.isArray(bannerJson?.data) ? bannerJson.data : [bannerJson.data]);
            } finally {
                setTimeout(() => setLoading(false), 200);
                setTimeout(() => setLoadingBanner(false), 300);
            }
        };

        window.addEventListener('resize', updateDevice);
        load();
        return () => window.removeEventListener('resize', updateDevice);
    }, [locale]);

    const validReviews = reviews.filter((r) => extractVideoId(r?.vedio_link));
    const totalPages = Math.ceil(validReviews.length / itemsPerPage);
    const paginated = validReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        setTimeout(() => {
            if (mainRef.current) {
                window.scrollTo({ top: mainRef.current.offsetTop - 10, behavior: 'smooth' });
            }
        }, 80);
    };

    return (
        <div className="no-margin">
            {/* 🔸 Banner */}
            {loadingBanner ? (
                <div className="skeleton skeleton-banner fade-in"></div>
            ) : (
                banners.map((b) => {
                    const imgSrc = isMobile
                        ? `${baseUrl}/${b.brander_pictureMoblie}`
                        : `${baseUrl}/${b.brander_picturePC}`;
                    return (
                        <div key={b.brander_ID} className="banner-container">
                            <Image
                                src={imgSrc}
                                alt={b.brander_name}
                                fill
                                className="banner-image fade-in"
                                unoptimized
                                priority
                            />
                        </div>
                    );
                })
            )}

            {/* 🔸 Main Content */}
            <main ref={mainRef} className="layout-review">
                <h1 className="headtitle">
                    {locale === 'en'
                        ? 'Customer Reviews on Our Solar Installations'
                        : 'รีวิวการติดตั้ง Solar จากลูกค้าของเรา'}
                </h1>

                <VideoGrid paginated={paginated} loading={loading} locale={locale} itemsPerPage={itemsPerPage} />

                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handlePageChange={handlePageChange}
                />
            </main>
        </div>
    );
}
