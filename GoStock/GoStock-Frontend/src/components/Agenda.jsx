import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { 
  PlusIcon, 
  CalendarDaysIcon, 
  ClockIcon, 
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { addNotification } from '../utils/notifications';

const Agenda = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('notifications') === 'true';
  });
  
  // Get current user info
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'Admin';
  const isManager = currentUser.role === 'manager' || currentUser.role === 'Yönetici';
  const isStaff = currentUser.role === 'Personel';
  const canManageEvents = isAdmin || isManager;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    agendaDate: '',
    agendaTime: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchEvents();
    
    // Bildirim izinlerini otomatik olarak iste
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/Events');
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch events. Status:', response.status);
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Geçmiş tarih ve saat kontrolü
    const selectedDateTime = new Date(`${formData.agendaDate}T${formData.agendaTime}`);
    const now = new Date();
    
    if (selectedDateTime < now) {
      showToast('❌ Geçmiş tarih ve saat seçemezsiniz! Lütfen gelecek bir tarih ve saat seçin.', 'error');
      return;
    }
    
    try {
      const url = showEditModal 
        ? `/api/Events/${selectedEvent.id}` 
        : '/api/Events';
      
      const method = showEditModal ? 'PUT' : 'POST';
      
      // Backend'e uygun format
      const submitData = {
        title: formData.title,
        description: formData.description,
        agendaDate: formData.agendaDate,
        agendaTime: formData.agendaTime, // HH:mm formatında bırak
        priority: formData.priority,
        status: "pending",
        isCompleted: false
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const responseData = await response.json();
        
        if (showEditModal) {
          showToast('Etkinlik başarıyla güncellendi!', 'success');
          setShowEditModal(false);
          setSelectedEvent(null);
        } else {
          showToast('Etkinlik başarıyla eklendi!', 'success');
          closeAddPanel();
          
          // Yeni etkinlik eklendiğinde personellere bildirim gönder
          triggerEventNotification(responseData);
        }
        fetchEvents();
      } else {
        const errorText = await response.text();
        console.error('Failed to save event. Status:', response.status);
        console.error('Error response:', errorText);
        showToast('Etkinlik kaydedilirken hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      showToast('Etkinlik kaydedilirken hata oluştu', 'error');
    }
  };

  const handleDelete = async (eventId) => {
    try {
      const response = await fetch(`/api/Events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('Etkinlik başarıyla silindi!', 'success');
        setShowDeleteModal(false);
        setSelectedEvent(null);
        fetchEvents();
      } else {
        console.error('Failed to delete event');
        showToast('Etkinlik silinirken hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      showToast('Etkinlik silinirken hata oluştu', 'error');
    }
  };

  const handleDeleteClick = (event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const handleCompleteEvent = async (eventId) => {
    try {
      // Etkinliği bul
      const event = events.find(e => e.id === eventId);
      if (!event) {
        showToast('Etkinlik bulunamadı', 'error');
        return;
      }

      // Mevcut kullanıcı bilgisini al
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (!currentUser.id) {
        showToast('Kullanıcı bilgisi bulunamadı', 'error');
        return;
      }

      // Backend'e tamamlandı olarak işaretle
      const response = await fetch(`/api/Events/${eventId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          completedByUserId: currentUser.id 
        }),
      });

      if (response.ok) {
        showToast('Etkinlik başarıyla tamamlandı olarak işaretlendi!', 'success');
        
        // Yöneticilere bildirim gönder
        triggerCompletionNotification(event);
        
        // Etkinlikleri yenile
        fetchEvents();
      } else {
        showToast('Etkinlik tamamlanırken hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Error completing event:', error);
      showToast('Etkinlik tamamlanırken hata oluştu', 'error');
    }
  };

  // Yeni etkinlik bildirimi tetikle
  const triggerEventNotification = (newEvent) => {
    if (notifications) {
      // Gerçek bildirim sistemi kullan
      addNotification({
        type: 'new_event',
        title: 'Yeni Etkinlik Eklendi',
        message: `"${newEvent.title}" adlı yeni etkinlik eklendi.`,
        event: newEvent,
        priority: 'high'
      });
    }
  };

  // Etkinlik tamamlama bildirimi tetikle
  const triggerCompletionNotification = (completedEvent) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Yöneticilere bildirim gönder
    const notification = {
      id: Date.now(),
      type: 'event_completed',
      title: 'Etkinlik Tamamlandı',
      message: `${currentUser.fullName || currentUser.name || 'Personel'} kullanıcısı "${completedEvent.title}" adlı etkinliği tamamladı.`,
      event: completedEvent,
      completedBy: currentUser,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'medium'
    };

    // Mevcut bildirimleri al ve array olduğundan emin ol
    let existingNotifications = [];
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          existingNotifications = parsed;
        }
      }
    } catch (error) {
      console.error('Bildirimler parse edilirken hata:', error);
      existingNotifications = [];
    }
    
    const updatedNotifications = [notification, ...existingNotifications];
    
    // localStorage'a kaydet
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    
    // Custom event tetikle (aynı sayfa içinde bildirim güncellemesi için)
    window.dispatchEvent(new Event('notificationsUpdated'));
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      agendaDate: event.agendaDate.split('T')[0],
      agendaTime: event.agendaTime.substring(0, 5),
      priority: event.priority
    });
    setShowEditModal(true);
  };

  const toggleAddPanel = () => {
    if (!showAddModal) {
      setFormData({
        title: '',
        description: '',
        agendaDate: '',
        agendaTime: '',
        priority: 'medium'
      });
    }
    setShowAddModal(!showAddModal);
  };

  const closeAddPanel = () => {
    setShowAddModal(false);
    setFormData({
      title: '',
      description: '',
      agendaDate: '',
      agendaTime: '',
      priority: 'medium'
    });
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedEvent(null);
  };

  // Toast mesaj fonksiyonu
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredEvents = events
    .filter(event => {
      const matchesPriority = filterPriority === 'all' || event.priority === filterPriority;
      return matchesPriority;
    })
    .sort((a, b) => {
      // Önce tarihe göre sırala (en yeni en üstte)
      const dateA = new Date(`${a.agendaDate}T${a.agendaTime}`);
      const dateB = new Date(`${b.agendaDate}T${b.agendaTime}`);
      return dateB - dateA;
    });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          toast.type === 'success'
            ? 'bg-green-500 text-white'
            : toast.type === 'warning'
            ? 'bg-yellow-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span>{toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '❌'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
      
      <Layout>
        <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ajanda</h1>
              <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Toplam {events.length} etkinlik bulundu
              </p>
            </div>
                         <div className="mt-4 sm:mt-0 flex items-center space-x-3">
               {canManageEvents && (
                 <button 
                   onClick={toggleAddPanel}
                   className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                 >
                   <PlusIcon className="h-5 w-5 mr-2" />
                   Yeni Etkinlik
                 </button>
               )}
             </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Etkinlik</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{events.length}</p>
                </div>
              </div>
            </div>
            
            <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Bekleyen</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {events.filter(e => !e.isCompleted).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Tamamlandı</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {events.filter(e => e.isCompleted).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Add Event Panel */}
          {showAddModal && (
            <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Yeni Etkinlik Ekle</h3>
                <button
                  onClick={closeAddPanel}
                  className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Başlık *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Açıklama
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tarih *
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.agendaDate}
                      onChange={(e) => setFormData({...formData, agendaDate: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Saat *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.agendaTime}
                      onChange={(e) => setFormData({...formData, agendaTime: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Öncelik
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className={`w-32 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeAddPanel}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      darkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Ekle
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Events Table */}
          <div className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              darkMode ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tüm Etkinlikler</h3>
              
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Öncelik:
                  </label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className={`px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                  >
                    <option value="all">Tümü</option>
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                  </select>
                </div>
              </div>
            </div>
          
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {filteredEvents.map((event) => (
                  <div key={event.id} className={`relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    event.isCompleted 
                      ? darkMode 
                        ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-2 border-green-600' 
                        : 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200'
                      : darkMode
                        ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-2 border-gray-600 hover:border-blue-500'
                        : 'bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-blue-300'
                  }`}>
                    {/* Öncelik çubuğu */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      event.priority === 'high' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                      event.priority === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}></div>
                    
                    <div className="p-6 h-full flex flex-col">
                      {/* Başlık ve Öncelik */}
                      <div className="flex items-start justify-between mb-4 flex-shrink-0">
                        <h4 className={`text-xl font-bold line-clamp-2 ${
                          event.isCompleted 
                            ? darkMode ? 'text-green-400' : 'text-green-800' 
                            : darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {event.title}
                        </h4>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                            event.priority === 'high' 
                              ? darkMode ? 'bg-red-900/50 text-red-300 border border-red-600' : 'bg-red-100 text-red-800 border border-red-200'
                              : event.priority === 'medium' 
                              ? darkMode ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-600' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              : darkMode ? 'bg-green-900/50 text-green-300 border border-green-600' : 'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                            {event.priority === 'high' ? '🔴 Yüksek' : 
                             event.priority === 'medium' ? '🟡 Orta' : '🟢 Düşük'}
                          </span>
                          {event.isCompleted && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                              darkMode ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-600' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Tamamlandı
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Tarih ve Saat */}
                      <div className="flex items-center mb-4 flex-shrink-0">
                        <div className={`flex items-center px-3 py-2 rounded-lg mr-3 border ${
                          darkMode ? 'bg-blue-900/30 border-blue-600' : 'bg-blue-50 border-blue-100'
                        }`}>
                          <CalendarDaysIcon className="h-4 w-4 mr-2 text-blue-600" />
                          <span className={`text-sm font-semibold ${
                            darkMode ? 'text-blue-300' : 'text-blue-800'
                          }`}>
                            {new Date(event.agendaDate).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <div className={`flex items-center px-3 py-2 rounded-lg border ${
                          darkMode ? 'bg-purple-900/30 border-purple-600' : 'bg-purple-50 border-purple-100'
                        }`}>
                          <ClockIcon className="h-4 w-4 mr-2 text-purple-600" />
                          <span className={`text-sm font-semibold ${
                            darkMode ? 'text-purple-300' : 'text-purple-800'
                          }`}>{event.agendaTime}</span>
                        </div>
                      </div>
                      
                      {/* Açıklama */}
                      {event.description && (
                        <div className="mb-4 flex-grow">
                          <div className={`rounded-lg p-4 border ${
                            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <p className={`text-sm leading-relaxed ${
                              event.isCompleted 
                                ? darkMode ? 'text-green-400' : 'text-green-700' 
                                : darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {event.description}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* İşlem Butonları */}
                      <div className={`flex items-center justify-end space-x-2 pt-4 border-t-2 mt-auto flex-shrink-0 ${
                        darkMode ? 'border-gray-600' : 'border-gray-100'
                      }`}>
                        {!event.isCompleted ? (
                          canManageEvents ? (
                            <>
                              <button
                                onClick={() => handleEdit(event)}
                                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                              >
                                <PencilIcon className="h-4 w-4 mr-2" />
                                Düzenle
                              </button>
                              
                              {/* Yönetici rolündekiler için Tamamla butonu gizli */}
                              
                              <button
                                onClick={() => handleDeleteClick(event)}
                                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                              >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Sil
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleCompleteEvent(event.id)}
                              className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Tamamlandı Olarak İşaretle
                            </button>
                          )
                        ) : (
                          canManageEvents && (
                            <button
                              onClick={() => handleDeleteClick(event)}
                              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Sil
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarDaysIcon className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <h3 className={`mt-2 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Etkinlik bulunamadı</h3>
                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {filterPriority !== 'all'
                    ? 'Filtreleri değiştirmeyi deneyin.' 
                    : 'İlk etkinliğinizi ekleyerek başlayın.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Event Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className={`relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
              <div className="mt-3">
                <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Etkinlik Düzenle</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Başlık *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Açıklama
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows="3"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Tarih *
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.agendaDate}
                        onChange={(e) => setFormData({...formData, agendaDate: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Saat *
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.agendaTime}
                        onChange={(e) => setFormData({...formData, agendaTime: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Öncelik
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                      >
                        <option value="low">Düşük</option>
                        <option value="medium">Orta</option>
                        <option value="high">Yüksek</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModals}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        darkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Güncelle
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Event Modal */}
        {showDeleteModal && selectedEvent && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className={`relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
              <div className="mt-3">
                <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Etkinlik Sil</h3>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  "{selectedEvent.title}" adlı etkinliği silmek istediğinizden emin misiniz?
                  Bu işlem geri alınamaz.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      darkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedEvent.id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
};

export default Agenda;
