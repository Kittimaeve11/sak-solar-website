'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function ContactChannels() {
  const [lineUrl, setLineUrl] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data');
        const data = await res.json();

        // Line
        const line = data.socials.find((item) => item.id === 'line');
        if (line) setLineUrl(line.url);

        // Phone
        const phone = data.contacts.find((item) => item.SubjectTH === 'เบอร์โทรศัพท์');
        if (phone && phone.WorkforceTH) {
          const digits = phone.WorkforceTH.replace(/\D/g, '');
          if (digits) setPhoneNumber(digits);
        }
      } catch (err) {
        console.error('โหลดข้อมูล API ไม่สำเร็จ:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        zIndex: 1000,
      }}
    >
      {lineUrl && (
        <a href={lineUrl} target="_blank" rel="noopener noreferrer" >
          <div className="circle-shadow hover-wiggle">
            <Image
              src="/images/icons/linecontact.png"
              alt="Line"
              width={50}
              height={50}
            />
          </div>
        </a>
      )}
      {phoneNumber && (
        <a href={`tel:${phoneNumber}`}>
          <div className="circle-shadow hover-wiggle">
            <Image
              src="/images/icons/callcontact.png"
              alt="Phone"
              width={50}
              height={50}
            />
          </div>
        </a>
      )}
    </div>
  );
}
