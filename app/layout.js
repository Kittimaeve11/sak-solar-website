import { LocaleProvider } from './Context/LocaleContext';
import './globals.css';
import localFont from 'next/font/local';
import ClientConditionalLayout from './components/ClientConditionalLayout';
const sukhumvitTadmai = localFont({
  src: [
    { path: './fonts/SukhumvitTadmai-UltraLight.otf', weight: '200', style: 'normal' },
    { path: './fonts/SukhumvitTadmai-Text.otf', weight: '400', style: 'normal' },
    { path: './fonts/SukhumvitTadmai-SemiBold.otf', weight: '600', style: 'normal' },
    { path: './fonts/SukhumvitTadmai-ExtraBold.otf', weight: '800', style: 'normal' },
  ],
  variable: '--font-sukhumvit',
  display: 'swap',
});


export const metadata = {
  title: 'Saksiame Solar ศักดิ์สยามโซลาร์',
  description: 'เว็บไซต์ Saksiame Solar',
  icons: {
    icon: '/Logosaksolar.ico',   
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="th" className={sukhumvitTadmai.variable} suppressHydrationWarning>
      <body className={`${sukhumvitTadmai.variable} font-sukhumvit`} suppressHydrationWarning>
        <LocaleProvider>
          <ClientConditionalLayout>{children}</ClientConditionalLayout>
        </LocaleProvider>
      </body>
    </html>
  );
}
