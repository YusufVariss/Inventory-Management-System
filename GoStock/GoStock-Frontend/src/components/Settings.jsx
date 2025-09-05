import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { 
  CogIcon,
  GlobeAltIcon,
  CloudArrowUpIcon,
  CheckIcon,
  BellIcon
} from '@heroicons/react/24/outline';


const Settings = () => {
  const [language, setLanguage] = useState('tr');
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('notifications') === 'true' || true;
  });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [autoBackup, setAutoBackup] = useState(true);


  return (
    <Layout>
      <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ayarlar</h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              Hesap ve sistem ayarlarınızı yönetin
            </p>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preferences */}
          <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center mb-6">
              <CogIcon className="h-6 w-6 text-purple-600 mr-3" />
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tercihler</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bildirimler</label>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sistem bildirimleri</p>
                  </div>
                  <button
                    onClick={() => {
                      const newNotifications = !notifications;
                      setNotifications(newNotifications);
                      localStorage.setItem('notifications', newNotifications.toString());
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications ? 'bg-blue-600' : darkMode ? 'bg-gray-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {notifications && (
                  <div className={`pl-4 border-l-2 ${darkMode ? 'border-gray-600' : 'border-gray-200'} space-y-3`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BellIcon className="h-4 w-4 text-blue-500 mr-2" />
                        <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Stok uyarıları</span>
                      </div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BellIcon className="h-4 w-4 text-green-500 mr-2" />
                        <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Etkinlik hatırlatıcıları</span>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BellIcon className="h-4 w-4 text-orange-500 mr-2" />
                        <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>İade işlemleri</span>
                      </div>
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BellIcon className="h-4 w-4 text-purple-500 mr-2" />
                        <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sistem güncellemeleri</span>
                      </div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
              

              
              <div className="flex items-center justify-between">
                <div>
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Karanlık Mod</label>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {darkMode ? 'Karanlık tema aktif' : 'Açık tema aktif'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newDarkMode = !darkMode;
                    setDarkMode(newDarkMode);
                    localStorage.setItem('darkMode', newDarkMode.toString());
                    // Sayfayı yenile ki Layout güncellensin
                    window.location.reload();
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                    darkMode ? 'bg-blue-600' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Otomatik Yedekleme</label>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Verileri otomatik yedekle</p>
                </div>
                <button
                  onClick={() => setAutoBackup(!autoBackup)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoBackup ? 'bg-blue-600' : darkMode ? 'bg-gray-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoBackup ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Language & Region */}
          <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center mb-6">
              <GlobeAltIcon className="h-6 w-6 text-orange-600 mr-3" />
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dil & Bölge</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Dil
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Saat Dilimi
                </label>
                <select className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}>
                  <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
                  <option value="Europe/London">Londra (UTC+0)</option>
                  <option value="America/New_York">New York (UTC-5)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Backup & Export */}
        <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center mb-6">
            <CloudArrowUpIcon className="h-6 w-6 text-indigo-600 mr-3" />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Yedekleme & Dışa Aktarma</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className={`flex items-center justify-center px-4 py-3 border rounded-lg transition-colors ${
              darkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>
              <CloudArrowUpIcon className={`h-5 w-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              Manuel Yedekleme
            </button>
            
            <button className={`flex items-center justify-center px-4 py-3 border rounded-lg transition-colors ${
              darkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>
              <CheckIcon className={`h-5 w-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              Son Yedekleme: Bugün
            </button>
            
            <button className={`flex items-center justify-center px-4 py-3 border rounded-lg transition-colors ${
              darkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>
              <CloudArrowUpIcon className={`h-5 w-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              Veri Dışa Aktar
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
