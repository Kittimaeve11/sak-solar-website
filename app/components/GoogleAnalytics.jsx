'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { initFirebase, pageview } from '../lib/firebase';

export default function GoogleAnalytics({ GA_MEASUREMENT_ID }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [consent, setConsent] = useState(null);

    useEffect(() => {
        initFirebase();

        const savedConsent = Cookies.get('cookieConsentSettings');
        const parsed = savedConsent ? JSON.parse(savedConsent) : null;
        setConsent(parsed);

        if (parsed?.analytics) {
            const url =
                pathname + (searchParams.toString() ? `?${searchParams}` : '');
            pageview(url);
        }
    }, [pathname, searchParams]);

    if (!consent || !consent.analytics) return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="afterInteractive"
            />
            <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${GA_MEASUREMENT_ID}', {
                            send_page_view: false
                        });
                    `,
                }}
            />
        </>
    );
}
