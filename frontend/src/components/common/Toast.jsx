import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Toast({ message, onDismiss }) {
  const { t } = useLanguage();
  return createPortal(
    <div className="app-toast" role="status" aria-live="polite">
      <span className="app-toast-icon"><Check size={19} strokeWidth={2.5} /></span>
      <p>{message}</p>
      <button type="button" onClick={onDismiss} aria-label={t('Tutup')}><X size={16} /></button>
      <span className="app-toast-progress" aria-hidden="true" />
    </div>, document.body,
  );
}
