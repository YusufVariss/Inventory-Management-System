// Bildirim yardımcı fonksiyonları
export const showNotification = (title, options = {}) => {
  // Bildirimler kapalıysa hiçbir şey yapma
  if (localStorage.getItem('notifications') !== 'true') {
    return;
  }

  // Tarayıcı bildirim desteğini kontrol et
  if (!('Notification' in window)) {
    console.log('Bu tarayıcı bildirim desteği sunmuyor');
    return;
  }

  // Otomatik olarak bildirim izni iste ve göster
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options
        });
      }
    });
  } else if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });
  }
};

// Otomatik bildirim izni iste
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'default') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Bildirim izni istenirken hata oluştu:', error);
      return false;
    }
  }

  return Notification.permission === 'granted';
};

// Stok uyarıları
export const showStockNotification = (message, type = 'warning') => {
  const title = 'Stok Uyarısı';
  const options = {
    body: message,
    tag: 'stock-notification',
    requireInteraction: type === 'critical',
    data: { type, category: 'stock' }
  };
  
  showNotification(title, options);
};

// Etkinlik hatırlatıcıları
export const showEventNotification = (eventTitle, eventTime) => {
  const title = 'Etkinlik Hatırlatıcısı';
  const options = {
    body: `${eventTitle} - ${eventTime}`,
    tag: 'event-notification',
    requireInteraction: false,
    data: { category: 'event' }
  };
  
  showNotification(title, options);
};

// İade işlemleri
export const showReturnNotification = (message, type = 'info') => {
  const title = 'İade İşlemi';
  const options = {
    body: message,
    tag: 'return-notification',
    requireInteraction: false,
    data: { type, category: 'return' }
  };
  
  showNotification(title, options);
};

// Sistem güncellemeleri
export const showSystemNotification = (message, type = 'info') => {
  const title = 'Sistem Bildirimi';
  const options = {
    body: message,
    tag: 'system-notification',
    requireInteraction: false,
    data: { type, category: 'system' }
  };
  
  showNotification(title, options);
};

// Bildirim izinlerini kontrol et
export const checkNotificationPermission = () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  
  return Notification.permission;
};

// Gerçek bildirim sistemi için bildirim ekle
export const addNotification = (notificationData) => {
  // Mevcut bildirimleri al
  const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  
  // Yeni bildirim oluştur
  const notification = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    read: false,
    ...notificationData
  };
  
  // Bildirimleri güncelle (en yeni en üstte)
  const updatedNotifications = [notification, ...existingNotifications];
  localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  
  // Tarayıcı bildirimi göster
  if (localStorage.getItem('notifications') === 'true' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `notification-${notification.id}`,
        data: notification
      });
    }
  }
};
