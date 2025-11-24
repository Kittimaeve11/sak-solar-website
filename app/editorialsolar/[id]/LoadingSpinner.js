'use client';

export default function LoadingSpinner() {
  return (
    <div className="spinner-overlay">
      <div className="spinner" />
      <p className="loading-text">กำลังโหลดข้อมูล...</p>
    </div>
  );
}
