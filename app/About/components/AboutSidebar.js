// app/about/components/AboutSidebar.js

import Link from 'next/link';
import { IoMdArrowDropright } from 'react-icons/io';

const MENU_LABELS_TH = {
  history: 'ประวัติความเป็นมา',
  vision: 'วิสัยทัศน์',
  mission: 'พันธกิจ',
  teams: 'คณะกรรมการ',
};

const MENU_LABELS_EN = {
  history: 'History',
  vision: 'Vision',
  mission: 'Mission',
  teams: 'Committee',
};

export default function AboutSidebar({ locale, selectedMenu, onSelectMenu }) {
  const labels = locale === 'th' ? MENU_LABELS_TH : MENU_LABELS_EN;

  return (
    <aside className="about-sidebar">
      <h3 className="sidebar-headertext">
        {locale === 'th' ? 'เกี่ยวกับศักดิ์สยามโซลาร์' : 'About Saksiam Solar'}
      </h3>

      <ul className="sidebar-menu">
        {['history', 'vision', 'mission', 'teams'].map((menu) => (
          <li key={menu}>
            <Link
              href={`#${menu}`}
              scroll={false}
              className={selectedMenu === menu ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                onSelectMenu(menu);
              }}
            >
              <IoMdArrowDropright className="arrow" />
              {labels[menu]}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
