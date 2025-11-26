'use client';

import Link from 'next/link';
import { FaLine } from 'react-icons/fa6';
import { AiFillTikTok } from 'react-icons/ai';
import {
  FaFacebookSquare,
  FaYoutube,
  FaInstagramSquare,
} from 'react-icons/fa';

export default function SocialLinks({ messages, socialValues }) {
  const socialIconMap = {
    facebook: <FaFacebookSquare style={{ color: '#1877f2', fontSize: 40 }} />,
    line: <FaLine style={{ color: '#00c300', fontSize: 35 }} />,
    instagram: (
      <FaInstagramSquare style={{ color: '#F5058D', fontSize: 40 }} />
    ),
    youtube: <FaYoutube style={{ color: '#FF0033', fontSize: 40 }} />,
    tiktok: <AiFillTikTok style={{ color: '#101010', fontSize: 40 }} />,
  };

  if (!socialValues || socialValues.length === 0) return null;

  return (
    <div className="gridItem socialSection">
      <h1 className="communicationName">{messages.communication}</h1>
      <div className="socialLinks">
        {socialValues.map(({ link, name, key }) => (
          <div
            key={key}
            className="socialItem"
            style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}
          >
            <span className="iconFL">{socialIconMap[key]}</span>
            <Link
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="label"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {name}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
