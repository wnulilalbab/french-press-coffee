// Notification helpers — uses SW showNotification() for PWA reliability,
// falls back to new Notification() for regular browser tab.

const ICON = '/french-press-coffee/icons/icon-192.png'
const TAG  = 'brew-timer'

async function swReg() {
  if (!('serviceWorker' in navigator)) return null
  try { return await navigator.serviceWorker.ready } catch { return null }
}

export async function requestNotifPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const p = await Notification.requestPermission()
  return p === 'granted'
}

export async function showNotif(title, body, { silent = false } = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const opts = { body, icon: ICON, badge: ICON, tag: TAG, renotify: true, silent }
  try {
    const reg = await swReg()
    if (reg) {
      await reg.showNotification(title, opts)
    } else {
      const n = new Notification(title, opts)
      setTimeout(() => n.close(), 10_000)
    }
  } catch (e) {
    console.warn('[notif]', e)
  }
}

export async function dismissNotif() {
  try {
    const reg = await swReg()
    if (reg) {
      const list = await reg.getNotifications({ tag: TAG })
      list.forEach(n => n.close())
    }
  } catch {}
}
