// app/about/components/HistoryVisionMission.js

import Image from 'next/image';

function renderSection(content, sectionType, locale, normalizeSrc) {
  if (!content) return null;

  const sizes = {
    history: { width: 919, height: 519 },
    vision: { width: 1600, height: 457 },
    default: { width: 1200, height: 600 },
  };

  const img = sizes[sectionType] || sizes.default;

  const detailText =
    locale === 'th'
      ? content?.brander_detail
      : content?.brander_detailEN || content?.brander_detail;

  return (
    <div className="bannerabout-container fade-in show">
      <div className={`bannerabout-image-wrapper-custom image-${sectionType}`}>
        <Image
          src={normalizeSrc(content?.brander_picturePC)}
          alt={sectionType}
          width={img.width}
          height={img.height}
          className="bannerabout-image-custom"
          priority={sectionType === 'history'}
        />
      </div>

      {detailText
        ?.split('\n')
        .map((line, idx) => <p key={idx}>{line}</p>)}
    </div>
  );
}

export default function HistoryVisionMission({
  locale,
  sections,
  selectedMenu,
  normalizeSrc,
}) {
  return (
    <div
      className={`content-sections ${
        selectedMenu === 'teams' ? 'hidden-section' : ''
      }`}
    >
      {/* HISTORY */}
      <section id="history" className="about-section">
        <h2 className="about-title with-lines">
          {locale === 'th' ? 'ประวัติความเป็นมา' : 'History'}
        </h2>
        {renderSection(sections.history, 'history', locale, normalizeSrc)}
      </section>

      {/* VISION */}
      <section id="vision" className="about-section">
        <h2 className="about-title with-lines">
          {locale === 'th' ? 'วิสัยทัศน์' : 'Vision'}
        </h2>
        {renderSection(sections.vision, 'vision', locale, normalizeSrc)}
      </section>

      {/* MISSION */}
      <section id="mission" className="about-section">
        <h2 className="about-title with-lines">
          {locale === 'th' ? 'พันธกิจ' : 'Mission'}
        </h2>

        <ul className="mission-list fade-in show">
          {sections.mission.map((item, index) => (
            <li
              key={item.mission_ID || index}
              className="mission-item"
            >
              {item.picture && (
                <Image
                  src={normalizeSrc(item.picture)}
                  alt="mission"
                  width={90}
                  height={90}
                  className="mission-icon"
                  loading="lazy"
                />
              )}

              <span className="mission-text">
                {locale === 'th'
                  ? item.titleTH
                  : item.titleEN || item.titleTH}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
