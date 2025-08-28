// 'use client';

// import { usePathname } from 'next/navigation';
// import Navbartest from './Navbartest';
// import TabMenu from './TabMenu';
// import Footer from './Footer';
// import BackToTopButton from './BackToTopButton';
// import FloatingButtons from './FloatingButtons';
// import ToastProvider from './ToastProvider';
// import CookieBanner from './CookieBanner';
// import GoogleAnalytics from './GoogleAnalytics';
// export default function ClientConditionalLayout({ children }) {
//   const pathname = usePathname();
//   const hideLayout = pathname === '/not-found'; // ปรับตาม path ที่ต้องการ

//   return (
//     <>
//       {!hideLayout && (
//         <>
//           <Navbartest />
//           <TabMenu />
//         </>
//       )}
//       <GoogleAnalytics GA_MEASUREMENT_ID='G-GRQS76P3XV' />
//       <main>{children}</main>

//       {!hideLayout && (
//         <>
//           <ToastProvider />
//           <FloatingButtons />
//           <BackToTopButton />
//           <Footer />
//           <CookieBanner />
//         </>
//       )}
//     </>
//   );
// }