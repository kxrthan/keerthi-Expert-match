// Mock Implementation of notificationApi.js for sandbox mode
const NOTIFS_KEY = 'expertmatch_mock_notifications';

const initialNotifications = [
  {
    id: 901,
    userId: 1001,
    type: "session_request_accepted",
    title: "Request Accepted!",
    message: "Dr. Elena Rodriguez accepted your doubt request. Tap to open chat.",
    data: JSON.stringify({ sessionId: 501 }),
    isRead: false,
    createdAt: new Date(Date.now() - 600000).toISOString() // 10 minutes ago
  },
  {
    id: 902,
    userId: 1001,
    type: "wallet_credit",
    title: "Wallet Top-up Successful",
    message: "You have successfully added $50 to your wallet.",
    data: null,
    isRead: true,
    createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
  }
];

function getNotifications() {
  const saved = localStorage.getItem(NOTIFS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (_) {}
  }
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(initialNotifications));
  return initialNotifications;
}

export async function fetchUnreadNotifications(limit = 20) {
  const list = getNotifications();
  return list.filter(n => !n.isRead).slice(0, limit);
}

export async function fetchUnreadCount() {
  const list = getNotifications();
  return list.filter(n => !n.isRead).length;
}

export async function fetchNotificationHistory(page = 1, pageSize = 20) {
  const list = getNotifications();
  return {
    notifications: list,
    total: list.length,
    hasMore: false,
    page: 1
  };
}

export async function markNotificationAsRead(notificationId) {
  const list = getNotifications();
  const notif = list.find(n => n.id === Number(notificationId));
  if (notif) {
    notif.isRead = true;
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(list));
    return true;
  }
  return false;
}

export async function markAllNotificationsAsRead() {
  const list = getNotifications();
  let count = 0;
  list.forEach(n => {
    if (!n.isRead) {
      n.isRead = true;
      count++;
    }
  });
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(list));
  return count;
}

export async function deleteNotification(notificationId) {
  let list = getNotifications();
  list = list.filter(n => n.id !== Number(notificationId));
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(list));
  return true;
}

export async function fetchNotificationPreferences() {
  return {
    emailAlerts: true,
    pushAlerts: true,
    sessionAlerts: true
  };
}

export async function updateNotificationPreferences(preferences) {
  return preferences;
}
