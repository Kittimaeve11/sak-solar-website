'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from '../Context/LocaleContext';
import '@/styles/contact.css';

import BannerContact from './components/BannerContact';
import SkeletonContact from './components/SkeletonContact';
import CompanyInfo from './components/CompanyInfo';
import GoogleMap from './components/GoogleMap';
import SocialLinks from './components/SocialLinks';
import ContactForm from './components/ContactForm';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

// Memory cache
let contactCache = {
  contacts: null,
  brander: null,
  topics: null,
  timestamp: 0,
};

export default function ContactClient() {
  const { messages, locale } = useLocale();

  const [contacts, setContacts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [brander, setBrander] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 768);
      }
    };
    updateMobile();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateMobile);
    }

    const fetchAllData = async () => {
      try {
        const API_ENABLED = false;

        if (!API_ENABLED) {
          setLoading(false);
          return;
        }
        const cacheAge = Date.now() - contactCache.timestamp;
        if (
          contactCache.contacts &&
          contactCache.brander &&
          contactCache.topics &&
          cacheAge < 1000 * 60 * 10
        ) {
          setContacts(contactCache.contacts);
          setBrander(contactCache.brander);
          setTopics(contactCache.topics);
          setLoading(false);
          return;
        }

        setLoading(true);

        const [contactsRes, branderRes, topicsRes] = await Promise.all([
          fetch(`${baseUrl}/api/contactapi`, { headers: { 'X-API-KEY': apiKey } }),
          fetch(`${baseUrl}/api/branderIDapi/8`, { headers: { 'X-API-KEY': apiKey } }),
          fetch(`${baseUrl}/api/topicsapi`, { headers: { 'X-API-KEY': apiKey } }),
        ]);

        const [contactsData, branderData, topicsData] = await Promise.all([
          contactsRes.json(),
          branderRes.json(),
          topicsRes.json(),
        ]);

        const contactsList = contactsData.result || [];
        const branderList = branderData.data ? [branderData.data] : [];
        const topicsList =
          topicsData.status && Array.isArray(topicsData.result)
            ? topicsData.result
            : [];

        setContacts(contactsList);
        setBrander(branderList);
        setTopics(topicsList);

        contactCache = {
          contacts: contactsList,
          brander: branderList,
          topics: topicsList,
          timestamp: Date.now(),
        };
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateMobile);
      }
    };
  }, []);

  return (
    <div className="no-margin" >
      {/* ===== Banner (มี skeleton ของตัวเองใน component) ===== */}
      <BannerContact
        brander={brander}
        loading={loading}
        isMobile={isMobile}
        baseUrl={baseUrl}
      />

      <main className="layout-containercontact ">
        <h1 className="headtitle">{messages.contact}</h1>

        {/* ===== ส่วนข้อมูลบริษัท / รูป / map / social ===== */}
        {loading ? (
          <SkeletonContact />
        ) : (
          <div className="contactGrid fade-in">
            {contacts.map((item) => {
              const infoValues = [
                locale === 'th' ? item.address_th : item.address_en,
                item.phone_number.replace(/ *, */g, ' | '),
                item.fax || '',
                item.email_sub
                  ? `${item.email_main} | ${item.email_sub}`
                  : item.email_main,
                locale === 'th' ? item.officehours_th : item.officehours_en,
              ];

              const socialValues = [
                {
                  link: item.facebook,
                  name: messages.contacts.socialmedia.facebook,
                  key: 'facebook',
                },
                {
                  link: item.line,
                  name: messages.contacts.socialmedia.line,
                  key: 'line',
                },
                {
                  link: item.instagram,
                  name: messages.contacts.socialmedia.ig,
                  key: 'instagram',
                },
                {
                  link: item.youtube,
                  name: messages.contacts.socialmedia.youtube,
                  key: 'youtube',
                },
                {
                  link: item.tiktok,
                  name: messages.contacts.socialmedia.tiktok,
                  key: 'tiktok',
                },
              ].filter(
                (data) =>
                  data.link &&
                  data.link !== 'null' &&
                  data.link !== 'undefined' &&
                  data.link.trim() !== ''
              );

              const locationPhotoUrl = `${baseUrl.replace(
                /\/$/,
                ''
              )}/${item.locationphoto.replace(/^\/+/, '')}`;

              return (
                <React.Fragment key={item.id}>
                  <CompanyInfo
                    locale={locale}
                    messages={messages}
                    infoValues={infoValues}
                    locationPhotoUrl={locationPhotoUrl}
                  />
                  <GoogleMap googleMapUrl={item.google_map} />
                  <SocialLinks
                    messages={messages}
                    socialValues={socialValues}
                  />
                </React.Fragment>
              );
            })}
          </div>
        )}

        <hr className="custom-divider" />

        {/* ===== ฟอร์ม — อยู่ตลอด เหมือนโค้ดเดิม ===== */}
        <h1 className="headtitle" style={{ marginBottom: '-1rem' }}>
          {messages.ask}
        </h1>

        <ContactForm
          messages={messages}
          locale={locale}
          topics={topics}
        />
      </main>
    </div>
  );
}
