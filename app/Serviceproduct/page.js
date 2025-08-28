'use client';

import Navbar from "../components/Navbar";
import TabMenu from "../components/TabMenu";
import { useLocale } from '../Context/LocaleContext';
export default function Page() {
  const { messages } = useLocale();

  return (
    <div>
      <main style={{ padding: '1rem' }}>
        <h1>{messages.serviceproduct}</h1>
      </main>
    </div>
  );
}
