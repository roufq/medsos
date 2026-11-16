export default function PageLoader() {
  return <div className="postter-loading" role="status" aria-label="Memuat Postter">
    <div className="postter-spinner" aria-hidden="true">{Array.from({ length: 12 }, (_, index) =>
      <span key={index} style={{ transform: `rotate(${index * 30}deg) translateY(-16px)`, animationDelay: `${index / 12}s` }} />
    )}</div><span className="sr-only">Memuat…</span>
  </div>;
}
