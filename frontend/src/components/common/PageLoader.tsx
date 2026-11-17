import { useLanguage } from '../../context/LanguageContext';
export default function PageLoader() {
  const { t: translateUI } = useLanguage();

  return <div className="postter-loading" role="status" aria-label={translateUI("Memuat Postter")}>
    <div className="postter-spinner" aria-hidden="true">{Array.from({ length: 12 }, (_, index) =>
      <span key={index} style={{ transform: `rotate(${index * 30}deg) translateY(-16px)`, animationDelay: `${index / 12}s` }} />
    )}</div><span className="sr-only">{translateUI("Memuat…")}</span>
  </div>;
}
