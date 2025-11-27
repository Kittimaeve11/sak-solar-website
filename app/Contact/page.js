// app/contact/page.js
import { Suspense } from 'react';
import ContactClient from './ContactClient';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>      <ContactClient />
    </Suspense>
  );
}
