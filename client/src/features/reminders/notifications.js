/** Pembungkus Notification API; semua fungsi aman dipanggil di browser yang tidak mendukungnya. */
export const isNotificationSupported = () => typeof Notification !== 'undefined';

export const readNotificationPermission = () => (isNotificationSupported() ? Notification.permission : 'unsupported');

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function showNotification({ title, text }) {
  if (readNotificationPermission() !== 'granted') return;
  try {
    new Notification(title, { body: text });
  } catch {
    // Kegagalan notifikasi tidak boleh menghentikan dialog dan bunyi alarm.
  }
}
