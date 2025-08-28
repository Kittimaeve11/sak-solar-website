'use client';

import { Suspense } from 'react';
import Navbar from "../components/Navbar";
import TabMenu from "../components/TabMenu";
import { useLocale } from '../Context/LocaleContext';

function SearchContent() {
  const { messages } = useLocale();

  return (
    <div>
      <Navbar />
      <TabMenu />
      <main style={{ padding: '1rem' }}>
        <h1>{messages.search}</h1>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
