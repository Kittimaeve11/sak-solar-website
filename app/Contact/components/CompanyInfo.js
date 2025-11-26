'use client';

import Image from 'next/image';

export default function CompanyInfo({
  locale,
  messages,
  infoValues,
  locationPhotoUrl,
}) {
  const iconList = [
    {
      key: 'building',
      src: '/images/icons/building.png',
      alt: 'Building',
    },
    {
      key: 'phone',
      src: '/images/icons/phone.png',
      alt: 'Phone',
    },
    {
      key: 'fax',
      src: '/images/icons/fax.png',
      alt: 'Fax',
    },
    {
      key: 'mail',
      src: '/images/icons/mail.png',
      alt: 'Email',
    },
    {
      key: 'work',
      src: '/images/icons/working-hours.png',
      alt: 'Office hours',
    },
  ];

  return (
    <>
      <div className="gridItem companyInfo">
        <h1 className="companyName">
          <span className="companyName-full">{messages.company}</span>
          <span className="companyName-mobile">
            {locale === 'th' ? (
              <>
                บริษัท ศักดิ์สยาม
                <br />
                โซลาร์ เอ็นเนอร์ยี่ จำกัด
              </>
            ) : (
              <>
                SAKSIAM
                <br />
                SOLAR ENERGY CO., LTD.
              </>
            )}
          </span>
        </h1>

        {infoValues.map((value, index) => (
          <div key={index} className="infoItem">
            <span className="icon">
              {iconList[index] && (
                <Image
                  key={iconList[index].key}
                  src={iconList[index].src}
                  alt={iconList[index].alt}
                  width={28}
                  height={28}
                />
              )}
            </span>
            <span>{value}</span>
          </div>
        ))}
      </div>

      <div className="gridItem companyImageWrapper">
        <Image
          src={locationPhotoUrl}
          alt="อาคารบริษัท"
          width={0}
          height={0}
          sizes="100vw"
          priority
          style={{ width: '100%', height: 'auto' }}
          className="companyImage"
        />
      </div>
    </>
  );
}
