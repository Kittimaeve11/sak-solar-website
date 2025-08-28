'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { pageview } from '../lib/firebase';

export default function GoogleAnalytics({ GA_MEASUREMENT_ID }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [consent, setConsent] = useState(null);

    useEffect(() => {
        const savedConsent = Cookies.get('cookieConsentSettings');
        if (savedConsent) setConsent(JSON.parse(savedConsent));
    }, []);

    useEffect(() => {
        if (!consent) return;
        const url = pathname + (searchParams.toString() ? `?${searchParams}` : '');
        if (consent.analytics) {
            pageview(url);
        }
    }, [pathname, searchParams, consent]);

    if (!consent || !consent.analytics) return null;

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
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
              page_path: window.location.pathname,
            });
          `,
                }}
            />
        </>
    );
}
