import React, { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    department: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Kayıt başarılı! Giriş yapabilirsiniz.');
        window.location.href = '/login';
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Kayıt başarısız');
      }
    } catch (error) {
      console.error('Register error:', error);
      alert('Bağlantı hatası oluştu');
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
              <div className="text-center">
                {/* Logo */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 flex items-center justify-center">
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

            {/* Sağ taraf - Kayıt Formu */}
            <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
              <div className="max-w-sm mx-auto w-full">
                {/* Form Header */}
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Hesap Oluşturun
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    GoStock'a katılmak için kayıt olun
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Soyad
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                      placeholder="Ad Soyad"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta Adresi
                    </label>
                    <input
                      id="email"
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
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Şifre
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Şifre Tekrarı
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                      Rol
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                    >
                      <option value="user">Kullanıcı</option>
                      <option value="manager">Yönetici</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                      Departman (Opsiyonel)
                    </label>
                    <input
                      id="department"
                      name="department"
                      type="text"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                      placeholder="Departman"
                      value={formData.department}
                      onChange={handleChange}
                    />
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
                          Kayıt yapılıyor...
                        </div>
                      ) : (
                        'Kayıt Ol'
                      )}
                    </button>
                  </div>
                </form>

                {/* Divider */}
                <div className="my-4 sm:my-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">veya</span>
                    </div>
                  </div>
                </div>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-gray-600 text-sm sm:text-base">
                    Zaten hesabınız var mı?{' '}
                    <a href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                      Giriş yapın
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
