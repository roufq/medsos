export async function acquireCallMedia(mediaDevices, mode, cameraOff) {
  if (!mediaDevices?.getUserMedia) {
    throw new Error('Mikrofon tidak tersedia. Buka Postter melalui HTTPS dan gunakan browser yang mendukung panggilan.');
  }
  try {
    let stream;
    if (mode === 'video') {
      try {
        stream = await mediaDevices.getUserMedia({ audio: true, video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } });
      } catch {
        cameraOff();
        stream = await mediaDevices.getUserMedia({ audio: true, video: false });
      }
    } else {
      stream = await mediaDevices.getUserMedia({ audio: true, video: false });
    }
    if (!stream.getAudioTracks().some((track) => track.readyState === 'live')) {
      stream.getTracks().forEach((track) => track.stop());
      throw new Error('Mikrofon tidak menghasilkan audio. Periksa perangkat mikrofon Anda.');
    }
    return stream;
  } catch (error) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
      throw new Error('Izin mikrofon ditolak. Izinkan mikrofon pada pengaturan situs Postter di browser, lalu coba lagi.');
    }
    if (error.name === 'NotFoundError') throw new Error('Mikrofon tidak ditemukan. Hubungkan mikrofon lalu coba lagi.');
    if (error.name === 'NotReadableError') throw new Error('Mikrofon tidak dapat digunakan. Periksa apakah sedang dipakai aplikasi lain.');
    throw error;
  }
}
