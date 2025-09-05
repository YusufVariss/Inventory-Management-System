import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  CubeIcon, 
  FolderIcon, 
  ShoppingCartIcon, 
  TruckIcon, 
  ChartBarIcon, 
  CogIcon, 
  UserGroupIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import NotificationDropdown from './NotificationDropdown';


const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Rol bazlı navigasyon
  const getNavigation = () => {
    const baseNavigation = [
      { name: 'Ana Sayfa', href: '/dashboard', icon: HomeIcon },
      { name: 'Ürünler', href: '/products', icon: CubeIcon },
      { name: 'Kategoriler', href: '/categories', icon: FolderIcon },
      { name: 'Stok Hareketleri', href: '/stock-movements', icon: ArrowsRightLeftIcon },
      { name: 'İadeler', href: '/returns', icon: ArrowPathIcon },
      { name: 'Tedarikçiler', href: '/suppliers', icon: TruckIcon },
      { name: 'Ajanda', href: '/agenda', icon: CalendarDaysIcon },
      { name: 'Raporlar', href: '/reports', icon: ChartBarIcon },
    ];

                  // Admin ve Yönetici için ek sayfalar
              if (user?.role === 'admin' || user?.role === 'Admin' || user?.role === 'manager' || user?.role === 'Yönetici') {
                baseNavigation.push(
                  { name: 'Kullanıcılar', href: '/users', icon: UserGroupIcon }
                );
              }
              
              // Tüm kullanıcılar için ayarlar
              baseNavigation.push(
                { name: 'Ayarlar', href: '/settings', icon: CogIcon }
              );

    return baseNavigation;
  };

  const navigation = getNavigation();

  // Kullanıcı giriş yaptıktan sonra bildirim sistemini başlat
  useEffect(() => {
    const initializeNotifications = async () => {
      // Kullanıcı giriş yapmış mı kontrol et
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        // Bildirim izinlerini kontrol et ve gerekirse iste
        if ('Notification' in window && Notification.permission === 'default') {
          try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              console.log('🔔 Bildirim sistemi başlatıldı');
              
              // Hoş geldin bildirimi göster
              if (localStorage.getItem('notifications') === 'true') {
                const userData = JSON.parse(user);
                new Notification('Hoş Geldiniz! 🎉', {
                  body: `Merhaba ${userData.fullName || userData.name || 'Kullanıcı'}, GoStock sistemine başarıyla giriş yaptınız.`,
                  icon: '/favicon.ico',
                  badge: '/favicon.ico'
                });
              }
            }
          } catch (error) {
            console.log('Bildirim izni istenirken hata oluştu:', error);
          }
        }
      }
    };

    initializeNotifications();
  }, []);

  const handleLogout = async () => {
    try {
      console.log('🚪 Logout işlemi başlatılıyor...');
      
      // Backend'e logout bildirimi gönder
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      try {
        const API_BASE_URL = 'http://localhost:5107';
        console.log('🔄 Logout API çağrısı yapılıyor...', `${API_BASE_URL}/api/auth/logout`);
        
        // Request body'de kullanıcı bilgilerini gönder
        const requestBody = {
          userId: user.id || null,
          userEmail: user.email || null
        };
        
        const headers = {
          'Content-Type': 'application/json'
        };
        
        // Token varsa Authorization header'ı ekle
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestBody)
        });
        
        console.log('📡 Logout API yanıtı:', response.status, response.statusText);
        
        if (response.ok) {
          const responseData = await response.json();
          console.log('✅ Logout backend\'e başarıyla bildirildi:', responseData);
        } else {
          console.warn('⚠️ Logout API başarısız:', response.status, response.statusText);
        }
      } catch (logoutError) {
        console.error('❌ Logout backend bildirimi başarısız:', logoutError);
        // Backend bildirimi başarısız olsa bile çıkış işlemini devam ettir
      }
    } catch (error) {
      console.error('❌ Çıkış işlemi sırasında hata:', error);
    } finally {
      // Her durumda çıkış işlemini tamamla
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Logout işlemi tamamlandığını logla
      console.log('🚪 Logout işlemi tamamlandı:', user.fullName || user.name || 'Bilinmeyen Kullanıcı');
      
      // Token'ı ve user bilgilerini sil
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setShowLogoutModal(false);
      navigate('/login');
    }
  };

  const isActive = (href) => {
    return location.pathname === href;
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className={`flex items-center justify-center h-16 px-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <img 
                src="/Images/logo1.png" 
                alt="GoStock Logo" 
                className="h-8 w-8 mr-3"
              />
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>GoStock</h1>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? darkMode 
                        ? 'bg-blue-900 text-blue-300 border-r-2 border-blue-500'
                        : 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-3 h-6 w-6 ${
                      isActive(item.href)
                        ? 'text-blue-500'
                        : darkMode
                          ? 'text-gray-400 group-hover:text-gray-300'
                          : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* User Card */}
          <div className={`px-3 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-blue-100'}`}>
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 flex items-center justify-center overflow-hidden">
                  {user?.role === 'admin' || user?.role === 'Admin' ? (
                    <img 
                      src="/Images/admin.png" 
                      alt="Admin" 
                      className="h-full w-full object-cover"
                    />
                  ) : user?.role === 'Yönetici' || user?.role === 'manager' ? (
                    <img 
                      src="/Images/yönetici.png" 
                      alt="Yönetici" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img 
                      src="/Images/personel.png" 
                      alt="Personel" 
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className={`text-base font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.fullName || user?.name || 'Kullanıcı'}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    {user?.role === 'admin' || user?.role === 'Admin' ? 'Admin' : 
                     user?.role === 'manager' ? 'Yönetici' : 
                     user?.role || 'Rol'}
                  </p>
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 hover:text-white rounded-md transition-colors border border-red-600 hover:border-red-700 shadow-sm"
              >
                <ArrowLeftOnRectangleIcon className="mr-2 h-4 w-4" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className={`lg:hidden border-b px-4 py-3 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={`p-2 rounded-md text-gray-400 hover:text-gray-600 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {children}
        </main>
      </div>

      {/* Notification Dropdown - Sağ alt köşede sabit */}
      <NotificationDropdown />

              {/* Logout Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Çıkış Yap</h3>
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                      <ArrowLeftOnRectangleIcon className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <p className="text-center text-gray-600">
                    Hesabınızdan çıkış yapmak istediğinizden emin misiniz?
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                  >
                    Çıkış Yap
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
     );
   };

export default Layout;
