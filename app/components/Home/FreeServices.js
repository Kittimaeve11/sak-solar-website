'use client';

import React from 'react';
import styles from './FreeServices.module.css';
import Image from 'next/image';

export default function FreeServices({ contacts = [], locale, loading, baseUrl }) {
  if (loading) return <p>Loading services...</p>;
  if (!contacts || contacts.length === 0) return null;

  const count = contacts.length;
  let topContacts = [];
  let bottomContacts = [];

  if (count < 6) {
    topContacts = contacts;
  } else if (count === 6) {
    topContacts = contacts.slice(0, 3);
    bottomContacts = contacts.slice(3);
  } else {
    const topCount = Math.floor(count / 2);
    topContacts = contacts.slice(0, topCount);
    bottomContacts = contacts.slice(topCount);
  }

  const renderCards = (items) =>
    items.map((item) => (
      <div key={item.sevice_ID} className={styles.cardfree}>
        <div className={styles.iconWrapper}>
          <Image
            src={`${baseUrl}/${item.picture}`}
            alt={locale === 'th' ? item.titleTH : (item.titleEN || 'Service')}
            width={90}
            height={90}
            className={styles.icon}
          />
        </div>

        <p className={styles.titlefree}>
          {locale === 'th' ? item.titleTH : item.titleEN}
        </p>

        <p className={styles.subtitlefree}>
          {locale === 'th' ? item.subtitleTH : item.subtitleEN}
        </p>

        <ul className={styles.listfree}>
          {(locale === 'th' ? item.detailTH : item.detailEN)
            .split('/')
            .map((text, index) => (
              <li key={index} className={styles.textfree}>
                {text.trim()}
              </li>
            ))}
        </ul>
      </div>

    ));

  return (
    <div className={styles.serviceSection}>
      <h1 className="headtitle">ข้อมูลบริการฟรี</h1>
      <h4
        style={{
          textAlign: 'center',
          marginTop: -10,
          marginBottom: 20,
          fontWeight: 600,
          color: '#243865'
        }}
      >
        บริการครบครันตั้งแต่การปรึกษา ติดตั้งฟรี จนถึงการดูแลหลังการขาย
      </h4>

      <div style={{ marginBottom: '24px' }}>
        <div className={styles.gridWrapper}>
          <div className={styles.gridContainer}>{renderCards(topContacts)}</div>
        </div>

        {bottomContacts.length > 0 && (
          <div className={styles.gridWrapper}>
            <div className={styles.gridContainer}>{renderCards(bottomContacts)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
