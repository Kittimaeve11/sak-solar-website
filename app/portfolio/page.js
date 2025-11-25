// app/portfoliosolar/page.js
import { Suspense } from "react";
import PortfolioPage from "./PortfolioPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="page-loading">กำลังโหลดหน้า...</div>}>
      <PortfolioPage />
    </Suspense>
  );
}
