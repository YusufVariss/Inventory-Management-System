import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Sayfa yüklendiğinde bildirim izinlerini otomatik olarak iste
  useEffect(() => {
    const checkNotificationPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
          console.log('🔔 Bildirim izni otomatik olarak istendi');
        } catch (error) {
          console.log('Bildirim izni istenirken hata oluştu:', error);
        }
      }
    };

    checkNotificationPermission();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5107/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Email: formData.email,
          Password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Login aktivitesi backend'de otomatik olarak audit log'a kaydediliyor
        console.log('🔐 Login başarılı - Backend otomatik audit log kaydedecek');
        
                // Bildirim izinlerini tekrar kontrol et ve gerekirse iste
        if ('Notification' in window && Notification.permission === 'default') {
          try {
            await Notification.requestPermission();
            console.log('🔔 Giriş sonrası bildirim izni kontrol edildi');
          } catch (error) {
            console.log('Bildirim izni istenirken hata oluştu:', error);
          }
        }
        
        // Yumuşak geçiş ile dashboard'a yönlendir
        navigate('/dashboard', { replace: true });
      } else {
        // Handle different error types
        if (response.status === 401) {
          setError('Geçersiz e-posta veya şifre');
        } else if (response.status === 400) {
          setError(data.message || 'Giriş bilgileri hatalı');
        } else {
          setError(data.message || 'Giriş yapılırken bir hata oluştu');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Sunucuya bağlanırken hata oluştu. Lütfen internet bağlantınızı kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Sol taraf - Logo ve Branding */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 sm:p-8 lg:p-12 flex flex-col justify-center items-center text-white">
              <div className="text-center w-full">
                {/* Logo */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mb-6 sm:mb-8 flex items-center justify-center mx-auto">
                  <img 
                    src="/Images/logo1.png" 
                    alt="GoStock Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Brand Name */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">GoStock</h1>
                
                {/* Tagline */}
                <p className="text-blue-100 text-base sm:text-lg mb-6 sm:mb-8">
                  Stok yönetimi artık çok kolay
                </p>
                
                {/* Features - Mobilde gizli, desktop'ta görünür */}
                <div className="hidden lg:block space-y-4 text-left">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-200 rounded-full mr-3"></div>
                    <span className="text-blue-100">Kolay stok takibi</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-200 rounded-full mr-3"></div>
                    <span className="text-blue-100">Gerçek zamanlı raporlar</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-200 rounded-full mr-3"></div>
                    <span className="text-blue-100">Çoklu kullanıcı desteği</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ taraf - Giriş Formu */}
            <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
              <div className="max-w-sm mx-auto w-full">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Hoş Geldiniz
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Hesabınıza giriş yapın
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-6">
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta Adresi
                    </label>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                      placeholder="ornek@email.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Şifre
                    </label>
                    <div className="relative">
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-500 transition-colors">
                      Şifremi unuttum
                    </a>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Giriş yapılıyor...
                        </div>
                      ) : (
                        'Giriş Yap'
                      )}
                    </button>
                  </div>
                </form>


              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
