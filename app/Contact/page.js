// app/contact/page.js
import { Suspense } from 'react';
import ContactClient from './ContactClient';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ContactClient />
    </Suspense>
  );
}
