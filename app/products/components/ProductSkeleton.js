export default function ProductSkeleton({ count }) {
  return (
    <div className="skeletonGridservices">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeletonCardservices">
          <div className="skeleton skeletonImageservices"></div>
          <div className="skeleton skeletonTextservices title"></div>
          <div className="skeleton skeletonTextservices subTitle"></div>
          <div className="skeleton skeletonTextservices price"></div>
        </div>
      ))}
    </div>
  );
}
