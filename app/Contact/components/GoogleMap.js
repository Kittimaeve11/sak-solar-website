'use client';

export default function GoogleMap({ googleMapUrl }) {
  if (!googleMapUrl) return null;

  return (
    <div className="gridItem googleMapWrapper">
      <iframe
        className="googleMap"
        src={googleMapUrl}
        width="100%"
        height="400"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
