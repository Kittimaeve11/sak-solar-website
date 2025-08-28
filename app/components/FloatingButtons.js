'use client';

import React, { useState, useEffect } from 'react';
import { FaFacebookSquare, FaLine, FaInstagramSquare, FaYoutube } from 'react-icons/fa';
import { AiFillTikTok } from 'react-icons/ai';
import { PiInstagramLogoFill } from 'react-icons/pi';
import Link from 'next/link';
import { BiSolidPhoneCall, BiSolidPhone } from "react-icons/bi";
import { IoCloseOutline } from "react-icons/io5";
import styles from './FloatingContactButton.module.css';
import Image from 'next/image';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function FloatingContactButton() {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [iconIndex, setIconIndex] = useState(0);
  const [contact, setContact] = useState(null);
  const [dynamicIcons, setDynamicIcons] = useState([]);
  // const iconNames = ['facebook', 'line', 'instagram', 'youtube', 'tiktok', 'phone'];
  const [isHovered, setIsHovered] = useState(false);

  const iconLabelMap = {
    facebook: 'Facebook',
    line: 'Line',
    instagram: 'Instagram',
    youtube: 'Youtube',
    tiktok: 'Tiktok',
    phone: 'เบอร์โทรติดต่อ',
  };


  const coloredIcons = {
    facebook: <FaFacebookSquare style={{ color: '#1877f2', fontSize: 30 }} />,
    line: <FaLine style={{ color: '#00c300', fontSize: 30 }} />,
    instagram: <FaInstagramSquare style={{ color: '#F5058D', fontSize: 30 }} />,
    youtube: <FaYoutube style={{ color: '#FF0033', fontSize: 30 }} />,
    tiktok: <AiFillTikTok style={{ color: '#101010', fontSize: 30 }} />,
    phone: <BiSolidPhone style={{ color: '#f97316', fontSize: 26 }} />,
  };

  const isValidUrl = (url) =>
    typeof url === 'string' && url.trim().length > 0 && url.startsWith('http');

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/contactapi`, {
          headers: {
            'X-API-KEY': apiKey,
          },
        });
        const data = await res.json();
        const result = data.result?.[0] || null;
        setContact(result);
        // สร้างไอคอนที่หมุนจากข้อมูลจริง
        const icons = [
          ...(isValidUrl(result?.facebook) ? [{ name: 'facebook', icon: <FaFacebookSquare style={{ color: '#ffffff', fontSize: 35 }} /> }] : []),
          ...(isValidUrl(result?.line) ? [{ name: 'line', icon: <FaLine style={{ color: '#ffffff', fontSize: 35 }} /> }] : []),
          ...(isValidUrl(result?.instagram) ? [{ name: 'instagram', icon: <PiInstagramLogoFill style={{ color: '#ffffff', fontSize: 35 }} /> }] : []),
          ...(isValidUrl(result?.youtube) ? [{ name: 'youtube', icon: <FaYoutube style={{ color: '#ffffff', fontSize: 35 }} /> }] : []),
          ...(isValidUrl(result?.tiktok) ? [{ name: 'tiktok', icon: <AiFillTikTok style={{ color: '#ffffff', fontSize: 35 }} /> }] : []),
          ...(result?.phone_number ? [{ name: 'phone', icon: <BiSolidPhoneCall style={{ color: '#ffffff', fontSize: 32 }} /> }] : []),
        ];
        setDynamicIcons(icons);
      } catch (error) {
        console.error('Error fetching contact data:', error);
      }
    };
    fetchContact();
  }, []);

  useEffect(() => {
    if (!open && dynamicIcons.length > 0 && !isHovered) {
      const interval = setInterval(() => {
        setIconIndex((prev) => (prev + 1) % dynamicIcons.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [open, dynamicIcons, isHovered]);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsAnimating(true);
    } else if (isVisible) {
      setIsAnimating(false);
      const timeout = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  const socialList = contact
    ? [
      { name: 'facebook', url: contact.facebook },
      { name: 'line', url: contact.line },
      { name: 'instagram', url: contact.instagram },
      { name: 'youtube', url: contact.youtube },
      { name: 'tiktok', url: contact.tiktok },
    ].filter(({ url }) => isValidUrl(url))
    : [];

  const phoneNumber = contact?.phone_number?.trim();

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'ปิดช่องทางติดต่อ' : 'เปิดช่องทางติดต่อ'}
        className={`${styles.buttonContact} ${!open ? styles.closed : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!open ? (
          <div className={styles.iconLabelWrapper}>
            {dynamicIcons[iconIndex]?.icon || <FaFacebookSquare style={{ color: '#ffffff', fontSize: 35 }} />}
            <span className={styles.iconText}>
              {iconLabelMap[dynamicIcons[iconIndex]?.name] || ''}
            </span>
          </div>
        ) : (
          <IoCloseOutline style={{ fontSize: '28px' }} />
        )}

      </button>

      {isVisible && (
        <div
          className={`${styles.speechBubble} ${isAnimating ? styles.fadeIn : styles.fadeOut}`}
        >
          <h4 className={styles.title}>ช่องทางติดต่อเรา</h4>

          <div className={styles.socialList}>
            {socialList.map(({ name, url }) => (
              <Link
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
              >
                {coloredIcons[name]}
              </Link>
            ))}
          </div>

          {phoneNumber &&
            phoneNumber.split(',').map((number, index) => {
              const cleaned = number.trim();
              return (
                <div
                  key={`phone-${index}`}
                  className={styles.phoneItem}
                  onClick={() =>
                    (window.location.href = `tel:${cleaned.replace(/[^0-9+]/g, '')}`)
                  }
                  aria-label={`โทร ${cleaned}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      window.location.href = `tel:${cleaned.replace(/[^0-9+]/g, '')}`;
                    }
                  }}
                >
                  {coloredIcons.phone}
                  <span>{cleaned}</span>
                </div>
              );
            })}
        </div>
      )}
    </>
  );
}
