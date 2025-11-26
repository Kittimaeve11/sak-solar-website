'use client';

export default function SkeletonContact() {
  return (
    <div className="contactGrid skeleton-flat">
      {/* Company Info */}
      <div>
        <div className="skeleton skeleton-line title"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton-bullet">
            <div className="skeleton skeleton-circle"></div>
            <div
              className="skeleton skeleton-line"
              style={{ width: `${90 - i * 7}%` }}
            ></div>
          </div>
        ))}
      </div>

      {/* Company Image */}
      <div>
        <div className="skeleton skeleton-image--large"></div>
      </div>

      {/* Google Map */}
      <div>
        <div className="skeleton skeleton-image--large"></div>
      </div>

      {/* Social Links */}
      <div className="social-skeleton">
        <div className="skeleton skeleton-line title"></div>
        <div className="skeleton-bullet-wrapper">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-bullet">
              <div className="skeleton skeleton-circle"></div>
              <div
                className="skeleton skeleton-line"
                style={{ width: `${85 - i * 10}%` }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
