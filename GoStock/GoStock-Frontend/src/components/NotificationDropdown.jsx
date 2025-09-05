import React, { useState, useEffect } from 'react';
import { BellIcon, XMarkIcon, CheckIcon, ClockIcon } from '@heroicons/react/24/outline';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Bildirimleri localStorage'dan al
  useEffect(() => {
    const loadNotifications = () => {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        try {
          const parsed = JSON.parse(storedNotifications);
          // parsed'in array olduğundan emin ol
          if (Array.isArray(parsed)) {
            setNotifications(parsed);
            updateUnreadCount(parsed);
          } else {
            setNotifications([]);
            setUnreadCount(0);
          }
        } catch (error) {
          console.error('Bildirimler parse edilirken hata:', error);
          setNotifications([]);
          setUnreadCount(0);
        }
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    // İlk yükleme
    loadNotifications();

    // Storage değişikliklerini dinle
    const handleStorageChange = (e) => {
      if (e.key === 'notifications') {
        loadNotifications();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event dinle (aynı sayfa içinde localStorage değişiklikleri için)
    const handleCustomStorageChange = () => {
      loadNotifications();
    };

    window.addEventListener('notificationsUpdated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('notificationsUpdated', handleCustomStorageChange);
    };
  }, []);

  // Okunmamış bildirim sayısını güncelle
  const updateUnreadCount = (notificationsList) => {
    // notificationsList'in array olduğundan emin ol
    if (!Array.isArray(notificationsList)) {
      setUnreadCount(0);
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isManager = currentUser.role === 'admin' || currentUser.role === 'Admin' || 
                     currentUser.role === 'manager' || currentUser.role === 'Yönetici';
    
         if (isManager) {
       // Yöneticiler tüm okunmamış bildirimleri görür
       setUnreadCount(notificationsList.filter(n => !n.read).length);
     } else {
       // Personel sadece kendi okunmamış bildirimlerini görür
       setUnreadCount(notificationsList.filter(n => 
         !n.read && n.type !== 'event_completed' && n.type !== 'return_created'
       ).length);
     }
  };

  // 15 dakikada bir kontrol et
  useEffect(() => {
    const interval = setInterval(() => {
      checkForEventReminders();
    }, 15 * 60 * 1000); // 15 dakika

    // İlk kontrol
    checkForEventReminders();

    return () => clearInterval(interval);
  }, []);

  // Bildirim sayısını sürekli güncelle
  useEffect(() => {
    const interval = setInterval(() => {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        try {
          const parsed = JSON.parse(storedNotifications);
          if (Array.isArray(parsed)) {
            updateUnreadCount(parsed);
          }
        } catch (error) {
          console.error('Bildirim sayısı güncellenirken hata:', error);
        }
      }
    }, 1000); // Her saniye kontrol et

    return () => clearInterval(interval);
  }, []);

  // Etkinlik durumu değişikliklerini dinle
  useEffect(() => {
    const handleStorageChange = () => {
      const events = JSON.parse(localStorage.getItem('events') || '[]');
      const completedEvents = events.filter(event => event.completed);
      
      // Tamamlanan etkinlikler için bildirimleri güncelle
      if (completedEvents.length > 0) {
        updateNotificationsForCompletedEvents(completedEvents);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Etkinlik hatırlatıcılarını kontrol et
  const checkForEventReminders = () => {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Sadece personel kullanıcılar için hatırlatıcı göster
    if (currentUser.role === 'admin' || currentUser.role === 'Admin' || 
        currentUser.role === 'manager' || currentUser.role === 'Yönetici') {
      return;
    }

    const pendingEvents = events.filter(event => 
      !event.completed && 
      new Date(event.agendaDate + 'T' + event.agendaTime) > new Date()
    );

    if (pendingEvents.length > 0) {
      const newNotification = {
        id: Date.now(),
        type: 'event_reminder',
        title: 'Etkinlik Hatırlatıcısı',
        message: `${pendingEvents.length} adet tamamlanmamış etkinlik bulunuyor.`,
        events: pendingEvents,
        timestamp: new Date().toISOString(),
        read: false
      };

      addNotification(newNotification);
    }
  };

  // Bildirimleri filtrele (kullanıcı rolüne göre)
  const getFilteredNotifications = () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isManager = currentUser.role === 'admin' || currentUser.role === 'Admin' || 
                     currentUser.role === 'manager' || currentUser.role === 'Yönetici';
    
         if (isManager) {
       // Yöneticiler tüm bildirimleri görür
       return notifications;
     } else {
       // Personel sadece kendi bildirimlerini görür
       return notifications.filter(notification => 
         notification.type !== 'event_completed' && notification.type !== 'return_created' // Etkinlik tamamlama ve iade bildirimlerini gizle
       );
     }
  };

  // Tamamlanan etkinlikler için bildirimleri güncelle
  const updateNotificationsForCompletedEvents = (completedEvents) => {
    const updatedNotifications = notifications.map(notification => {
      if (notification.type === 'event_reminder' && notification.events) {
        // Tamamlanan etkinlikleri filtrele
        const remainingEvents = notification.events.filter(event => 
          !completedEvents.some(completed => completed.id === event.id)
        );
        
        if (remainingEvents.length === 0) {
          // Tüm etkinlikler tamamlandıysa bildirimi sil
          return null;
        } else if (remainingEvents.length !== notification.events.length) {
          // Bazı etkinlikler tamamlandıysa bildirimi güncelle
          return {
            ...notification,
            events: remainingEvents,
            message: `${remainingEvents.length} adet tamamlanmamış etkinlik bulunuyor.`
          };
        }
      }
      return notification;
    }).filter(Boolean); // null değerleri filtrele

    setNotifications(updatedNotifications);
    updateUnreadCount(updatedNotifications);
    localStorage.setItem('eventNotifications', JSON.stringify(updatedNotifications));
  };

  // Yeni bildirim ekle
  const addNotification = (notification) => {
    const updatedNotifications = [notification, ...notifications];
    setNotifications(updatedNotifications);
    updateUnreadCount(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  // Bildirimi okundu olarak işaretle
  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    updateUnreadCount(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  // Bildirimi sil
  const removeNotification = (notificationId) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    setNotifications(updatedNotifications);
    updateUnreadCount(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  // Tüm bildirimleri temizle
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('notifications');
  };



  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Bildirim Butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Bildirimler
            </h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Tümünü Temizle
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Bildirim Listesi */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <BellIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Henüz bildirim yok</p>
              </div>
            ) : (
              getFilteredNotifications().map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                                             <div className="flex items-center mb-2">
                         {notification.type === 'event_completed' ? (
                           <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                           </svg>
                         ) : notification.type === 'return_created' ? (
                           <svg className="h-4 w-4 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                           </svg>
                         ) : (
                           <ClockIcon className="h-4 w-4 text-blue-500 mr-2" />
                         )}
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {notification.message}
                      </p>
                      
                      {/* Etkinlik Detayları */}
                      {notification.events && notification.events.length > 0 && (
                        <div className="space-y-2">
                          {notification.events.slice(0, 3).map((event, index) => (
                            <div key={index} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 p-2 rounded">
                              <div className="font-medium">{event.agendaTitle}</div>
                              <div>{event.agendaDate} - {event.agendaTime}</div>
                            </div>
                          ))}
                          {notification.events.length > 3 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +{notification.events.length - 3} etkinlik daha...
                            </div>
                          )}
                        </div>
                      )}

                                             {/* İade Detayları */}
                       {notification.type === 'return_created' && notification.return && (
                         <div className="space-y-2">
                           <div className="text-xs text-gray-500 dark:text-gray-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-700">
                             <div className="font-medium text-orange-700 dark:text-orange-300">
                               {notification.return.productName}
                             </div>
                             <div className="text-orange-600 dark:text-orange-400">
                               Miktar: {notification.return.quantity} adet
                             </div>
                             <div className="text-orange-600 dark:text-orange-400">
                               Neden: {notification.return.reason}
                             </div>
                             {notification.createdBy && (
                               <div className="text-orange-600 dark:text-orange-400 mt-1">
                                 Talep Eden: {notification.createdBy.fullName || notification.createdBy.name || 'Personel'}
                               </div>
                             )}
                           </div>
                         </div>
                       )}

                       {/* Etkinlik Tamamlama Detayları */}
                      {notification.type === 'event_completed' && notification.event && (
                        <div className="space-y-2">
                          <div className="text-xs text-gray-500 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-700">
                            <div className="font-medium text-green-700 dark:text-green-300">
                              {notification.event.title}
                            </div>
                            <div className="text-green-600 dark:text-green-400">
                              {notification.event.agendaDate} - {notification.event.agendaTime}
                            </div>
                            {notification.completedBy && (
                              <div className="text-green-600 dark:text-green-400 mt-1">
                                Tamamlayan: {notification.completedBy.fullName || notification.completedBy.name || 'Personel'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {new Date(notification.timestamp).toLocaleString('tr-TR')}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Okundu olarak işaretle"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
                        title="Bildirimi sil"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
