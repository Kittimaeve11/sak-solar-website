'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function PolicyPage() {
  const { policyNum } = useParams();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!policyNum) return;

    const fetchPolicy = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/policyIDapi/${policyNum}`, {
          headers: {
            'X-API-KEY': apiKey || '',
          },
        });
        const data = await res.json();

        if (data.status && data.result) {
          setPolicy(data.result);
        } else {
          setPolicy(null);
        }
      } catch (error) {
        console.error('Error fetching policy:', error);
        setPolicy(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [policyNum]);

  if (loading) return <div>กำลังโหลดข้อมูลนโยบาย...</div>;
  if (!policy) return <div>ไม่พบนโยบายนี้</div>;

// ฟังก์ชันแปลง escape character ที่เกินมา
const decodeHtmlEntities = (text) => {
  if (!text) return "";
  return text.replace(/\\\//g, '/');
};

// ฟังก์ชันตัด " หน้า-หลังออก
const cleanQuotes = (text) => {
  if (!text) return '';
  return text.trim().replace(/^"(.*)"$/, '$1');
};

return (
  <main className="layout-container">
    <h1 className="headtitle" style={{marginBottom:'-1rem'}}>
      {policy.policy_nameTH}
      {policy.policy_nameEN && ` (${policy.policy_nameEN})`}
    </h1>
    <div
      dangerouslySetInnerHTML={{
        __html: cleanQuotes(decodeHtmlEntities(policy.policy_detailTH)) || "ไม่มีข้อมูล",
      }}
    />
  </main>
);
}
