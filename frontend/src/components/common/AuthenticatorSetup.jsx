import {QRCodeSVG} from 'qrcode.react';
import {useLanguage} from '../../context/LanguageContext';

export default function AuthenticatorSetup({setup,account}) {
  const {t}=useLanguage();
  return <section className="space-y-3" aria-label={t('Pengaturan authenticator')}>
    {setup.uri ? <>
      <p>{t('Pindai QR ini dengan aplikasi authenticator, lalu masukkan kode 6 digit di bawah.')}</p>
      <div className="w-fit max-w-full rounded-xl bg-white p-3">
        <QRCodeSVG value={setup.uri} size={224} marginSize={4} level="M" bgColor="#ffffff" fgColor="#000000"
          role="img" aria-label={t('Kode QR pengaturan 2FA')} title={t('Kode QR pengaturan 2FA')}
          style={{display:'block',maxWidth:'100%',height:'auto'}}/>
      </div>
    </> : <p>{t('QR belum tersedia. Gunakan kunci manual atau mulai ulang pengaturan 2FA.')}</p>}
    <p className="text-xs break-all">{t('Akun')}: <span translate="no">{account}</span></p>
    <details>
      <summary className="cursor-pointer text-sm underline">{t('Tidak bisa memindai? Masukkan kunci manual')}</summary>
      <p className="text-xs mt-2">{t('Pilih akun berbasis waktu (TOTP). Penerbit: Postter.')}</p>
      <code className="block mt-2 break-all select-all" translate="no">{setup.secret}</code>
    </details>
  </section>;
}
