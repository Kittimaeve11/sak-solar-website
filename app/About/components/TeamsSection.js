// app/about/components/TeamsSection.js

import Image from 'next/image';

export default function TeamsSection({
  locale,
  sections,
  selectedMenu,
  normalizeSrc,
}) {
  return (
    <div
      id="teams"
      className={`teams-section ${
        selectedMenu === 'teams' ? 'fade-in show' : 'hidden-section'
      }`}
    >
      <h2 className="about-title with-lines">
        {locale === 'th' ? 'คณะกรรมการ' : 'Committee'}
      </h2>

      <div className="teams-grid">
        {sections.teams.map((member, idx) => (
          <div
            key={member.teamsID || idx}
            className={idx === 0 ? 'team-boss' : 'team-card'}
          >
            <Image
              src={normalizeSrc(member.teams_picture)}
              alt={locale === 'th'
                ? member.teams_nameTH
                : member.teams_nameEN}
              width={300}
              height={300}
              className="team-image"
              loading="lazy"
            />

            <div className="team-info">
              <p className="team-name">
                {locale === 'th'
                  ? member.teams_nameTH
                  : member.teams_nameEN}
              </p>
              <p className="team-position">
                {locale === 'th'
                  ? member.teams_positionTH
                  : member.teams_positionEN}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
