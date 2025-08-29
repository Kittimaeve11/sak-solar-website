import { LocaleProvider } from './Context/LocaleContext';
import './globals.css';
import localFont from 'next/font/local';
import Navbartest from './components/Navbartest';
import TabMenu from './components/TabMenu';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';
import FloatingButtons from './components/FloatingButtons';
import ToastProvider from './components/ToastProvider';
import CookieBanner from './components/CookieBanner';
import GoogleAnalytics from './components/GoogleAnalytics';

const sukhumvitTadmai = localFont({
  src: [
    { path: '/fonts/SukhumvitTadmai-UltraLight.otf', weight: '200', style: 'normal' },
    { path: '/fonts/SukhumvitTadmai-Text.otf', weight: '400', style: 'normal' },
    { path: '/fonts/SukhumvitTadmai-SemiBold.otf', weight: '600', style: 'normal' },
    { path: '/fonts/SukhumvitTadmai-ExtraBold.otf', weight: '800', style: 'normal' },
  ],
  variable: '--font-sukhumvit',
  display: 'swap',
});

export const metadata = {
  title: 'Saksiame Solar ศักดิ์สยามโซลาร์',
  description: 'เว็บไซต์ Saksiame Solar',
  icons: {
    icon: '/logosakico.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={sukhumvitTadmai.variable} suppressHydrationWarning>
      <body className={`${sukhumvitTadmai.variable} font-sukhumvit`} suppressHydrationWarning>
        <LocaleProvider>
          <Navbartest />
          <TabMenu />

          {/* Google Analytics เป็น client component */}
          <GoogleAnalytics GA_MEASUREMENT_ID="G-GRQS76P3XV" />
          <main>{children}</main>

          <ToastProvider />
          <FloatingButtons />
          <BackToTopButton />
          <Footer />
          <CookieBanner />
        </LocaleProvider>
      </body>
    </html>
  );
}
