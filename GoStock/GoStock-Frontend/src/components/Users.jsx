import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { PlusIcon, PencilIcon, TrashIcon, UserGroupIcon, ShieldCheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Users = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mevcut kullanıcının rolünü al
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'Admin';
  const isManager = currentUser.role === 'manager' || currentUser.role === 'Yönetici';

  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: '',
    isActive: true
  });
  const [showAddUser, setShowAddUser] = useState(() => {
    return localStorage.getItem('usersFormOpen') === 'true';
  });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [addForm, setAddForm] = useState(() => {
    const savedFormData = localStorage.getItem('usersFormData');
    if (savedFormData) {
      const parsed = JSON.parse(savedFormData);
      // Yönetici sadece Personel rolünü seçebilir
      if (!isAdmin && parsed.role !== 'Personel') {
        parsed.role = 'Personel';
      }
      return parsed;
    }
    return {
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'Personel',
      isActive: true
    };
  });

  // Helper function to update form data and save to localStorage
  const updateAddForm = (newData) => {
    const updatedData = { ...addForm, ...newData };
    setAddForm(updatedData);
    localStorage.setItem('usersFormData', JSON.stringify(updatedData));
  };

  // Admin kullanıcılarına dokunma kontrolü
  const canModifyUser = (user) => {
    // Admin herkese dokunabilir
    if (isAdmin) return true;
    
    // Yönetici admin kullanıcılarına dokunamaz
    if (isManager && (user.role === 'admin' || user.role === 'Admin')) {
      return false;
    }
    
    // Yönetici diğer kullanıcılara dokunabilir
    return isManager;
  };

  // API'den kullanıcıları yükle
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Oturum bulunamadı');
        return;
      }

      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const usersData = await response.json();
        
        // Rol sırasına göre sırala: Admin -> Yönetici -> Personel
        const sortedUsers = usersData.sort((a, b) => {
          const roleOrder = { 'Admin': 1, 'Yönetici': 2, 'Personel': 3 };
          const aOrder = roleOrder[a.role] || 4;
          const bOrder = roleOrder[b.role] || 4;
          return aOrder - bOrder;
        });
        
        setUsers(sortedUsers);
        setFilteredUsers(sortedUsers);
        setError(null);
      } else {
        setError('Kullanıcılar yüklenirken hata oluştu');
      }
    } catch (err) {
      console.error('Kullanıcılar yükleme hatası:', err);
      setError('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Arama fonksiyonu
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Toast mesaj fonksiyonu
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };



  // Kullanıcı düzenleme
  const handleEditUser = (user) => {
    // Yetki kontrolü
    if (!canModifyUser(user)) {
      showToast('Bu kullanıcıyı düzenleme yetkiniz yok', 'error');
      return;
    }
    
    setEditingUser(user);
    setShowEditPassword(false); // Şifre gizli başlasın
    setEditForm({
      username: user.username || '',
      email: user.email || '',
      password: user.password || '', // Mevcut şifreyi göster
      fullName: user.fullName || '',
      role: user.role || '',
      isActive: user.isActive
    });
  };

  // Form güncelleme
  const handleFormChange = (field, value) => {
    // Yönetici admin kullanıcılarının rolünü değiştiremez
    if (field === 'role' && isManager && editingUser && (editingUser.role === 'admin' || editingUser.role === 'Admin')) {
      showToast('Admin kullanıcılarının rolü değiştirilemez', 'error');
      return;
    }
    
    // Yönetici sadece Personel rolüne değiştirebilir
    if (field === 'role' && isManager && value !== 'Personel') {
      showToast('Yönetici sadece Personel rolüne değiştirebilir', 'error');
      return;
    }
    
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Kullanıcı güncelleme
  const handleUpdateUser = async () => {
    try {
      // Yetki kontrolü
      if (!canModifyUser(editingUser)) {
        showToast('Bu kullanıcıyı güncelleme yetkiniz yok', 'error');
        return;
      }
      
      const token = localStorage.getItem('token');
      
      // Backend'in beklediği formata çevir
      const userData = {
        id: editingUser.id,
        username: editForm.username,
        email: editForm.email,
        password: editForm.password, // Kullanıcının girdiği şifreyi kullan
        fullName: editForm.fullName,
        role: editForm.role,
        isActive: editForm.isActive,
        createdAt: editingUser.createdAt,
        updatedAt: new Date().toISOString()
      };
      
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        fetchUsers();
        setEditingUser(null);
        showToast('Kullanıcı başarıyla güncellendi', 'success');
      } else {
        showToast('Kullanıcı güncellenirken hata oluştu', 'error');
      }
    } catch (err) {
      console.error('Kullanıcı güncelleme hatası:', err);
      showToast('Kullanıcı güncellenirken hata oluştu', 'error');
    }
  };

  // Yeni kullanıcı ekleme
  const handleAddUser = () => {
    const newFormData = {
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: isAdmin ? 'Personel' : 'Personel', // Yönetici sadece Personel ekleyebilir
      isActive: true
    };
    setAddForm(newFormData);
    localStorage.setItem('usersFormData', JSON.stringify(newFormData));
    localStorage.setItem('usersFormOpen', 'true');
    setShowAddUser(true);
  };

  // Yeni kullanıcı form güncelleme
  const handleAddFormChange = (field, value) => {
    // Yönetici sadece Personel rolünü seçebilir
    if (field === 'role' && !isAdmin && value !== 'Personel') {
      showToast('Yönetici sadece Personel rolü ekleyebilir', 'error');
      return;
    }
    
    updateAddForm({ [field]: value });
  };

  // Yeni kullanıcı kaydetme
  const handleSaveUser = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Backend'in beklediği formata çevir
      const userData = {
        username: addForm.username,
        email: addForm.email,
        password: addForm.password, // Düz şifre
        fullName: addForm.fullName,
        role: addForm.role,
        isActive: addForm.isActive
      };
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        fetchUsers();
        setShowAddUser(false);
        localStorage.removeItem('usersFormOpen');
        localStorage.removeItem('usersFormData');
        showToast('Kullanıcı başarıyla eklendi!', 'success');
      } else {
        // Response'u text olarak oku, JSON değilse
        const responseText = await response.text();
        let errorMessage = 'Kullanıcı eklenirken hata oluştu';
        
        try {
          // JSON olarak parse etmeyi dene
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          // JSON değilse, düz metin olarak kullan
          errorMessage = responseText || errorMessage;
        }
        
        showToast(errorMessage, 'error');
      }
    } catch (err) {
      console.error('Kullanıcı ekleme hatası:', err);
      showToast('Kullanıcı eklenirken hata oluştu', 'error');
    }
  };

  // Kullanıcı silme
  const handleDeleteUser = async (userId) => {
    try {
      // Silinecek kullanıcıyı bul
      const userToDelete = users.find(u => u.id === userId);
      
      // Yetki kontrolü
      if (!canModifyUser(userToDelete)) {
        showToast('Bu kullanıcıyı silme yetkiniz yok', 'error');
        return;
      }
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Kullanıcı listesini yenile
        fetchUsers();
        setShowDeleteConfirm(null);
        showToast('Kullanıcı başarıyla silindi', 'success');
      } else {
        showToast('Kullanıcı silinirken hata oluştu', 'error');
      }
    } catch (err) {
      console.error('Kullanıcı silme hatası:', err);
      showToast('Kullanıcı silinirken hata oluştu', 'error');
    }
  };

  return (
    <Layout>
      <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Kullanıcılar</h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              {loading ? 'Yükleniyor...' : `Toplam ${users.length} kullanıcı bulundu`}
            </p>
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
          </div>
          <div className="mt-4 sm:mt-0">
            {/* Sadece Admin ve Yöneticiler kullanıcı ekleyebilir */}
            {(isAdmin || isManager) && (
              <button 
                onClick={handleAddUser}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Yeni Kullanıcı Ekle
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Kullanıcı</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {loading ? '-' : filteredUsers.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <ShieldCheckIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Admin</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {loading ? '-' : filteredUsers.filter(u => u.role === 'Admin').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Yönetici</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {loading ? '-' : filteredUsers.filter(u => u.role === 'Yönetici').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Personel</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {loading ? '-' : filteredUsers.filter(u => u.role === 'Personel').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Yeni Kullanıcı Ekleme Paneli */}
        {showAddUser && (
          <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <PlusIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Yeni Kullanıcı Ekle</h3>
              </div>
              <button
                onClick={() => {
                  setShowAddUser(false);
                  localStorage.removeItem('usersFormOpen');
                  localStorage.removeItem('usersFormData');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kullanıcı Adı *</label>
                <input
                  type="text"
                  value={addForm.username}
                  onChange={(e) => handleAddFormChange('username', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>E-posta *</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => handleAddFormChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Şifre *</label>
                <div className="relative">
                  <input
                    type={showAddPassword ? "text" : "password"}
                    value={addForm.password}
                    onChange={(e) => handleAddFormChange('password', e.target.value)}
                    className={`w-full px-3 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showAddPassword ? (
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

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ad Soyad *</label>
                <input
                  type="text"
                  value={addForm.fullName}
                  onChange={(e) => handleAddFormChange('fullName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rol</label>
                <select
                  value={addForm.role}
                  onChange={(e) => handleAddFormChange('role', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {/* Admin her rolü seçebilir */}
                  {isAdmin && <option value="Admin">Admin</option>}
                  {/* Yönetici sadece Personel rolünü seçebilir */}
                  {isAdmin && <option value="Yönetici">Yönetici</option>}
                  <option value="Personel">Personel</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="addIsActive"
                  checked={addForm.isActive}
                  onChange={(e) => handleAddFormChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="addIsActive" className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Aktif
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddUser(false);
                  localStorage.removeItem('usersFormOpen');
                  localStorage.removeItem('usersFormData');
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-300 bg-gray-700 border border-gray-600 hover:bg-gray-600' 
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                İptal
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Kaydet
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className={`px-6 py-4 border-b flex items-center justify-between ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Kullanıcı Listesi</h3>
            
            {/* Arama Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Ad soyad ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`block w-64 pl-10 pr-3 py-2 border rounded-lg leading-5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <UserGroupIcon className="mx-auto h-12 w-12 animate-pulse" />
              </div>
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Kullanıcılar yükleniyor...</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Lütfen bekleyin</p>
            </div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      ID
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Kullanıcı
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      E-posta
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Şifre
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Rol
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Durum
                    </th>
                    <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        #{user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.role === 'Admin' ? (
                            <img 
                              src="/Images/admin.png" 
                              alt="Admin" 
                              className="h-10 w-10 object-cover"
                            />
                          ) : user.role === 'Yönetici' ? (
                            <img 
                              src="/Images/yönetici.png" 
                              alt="Yönetici" 
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            <img 
                              src="/Images/personel.png" 
                              alt="Personel" 
                              className="h-10 w-10 object-cover"
                            />
                          )}
                          <div className="ml-4">
                            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {user.fullName || 'İsimsiz'}
                            </div>
                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              @{user.username || 'Kullanıcı adı yok'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.email || 'E-posta yok'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.password || 'Şifre yok'}
                      </td>
                      <td className="pl-4 pr-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'Admin' 
                            ? 'bg-red-100 text-red-800' 
                            : user.role === 'Yönetici'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'Admin' ? 'Admin' : 
                           user.role === 'Yönetici' ? 'Yönetici' : 
                           'Personel'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Düzenleme butonu - sadece yetkili kullanıcılar */}
                          {canModifyUser(user) && (
                            <button 
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                              title="Düzenle"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          )}
                          
                          {/* Silme butonu - sadece yetkili kullanıcılar */}
                          {canModifyUser(user) && (
                            <button 
                              onClick={() => setShowDeleteConfirm(user.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Sil"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                          
                          {/* Yetkisiz kullanıcılar için bilgi mesajı */}
                          {!canModifyUser(user) && (
                            <span className="text-xs text-gray-400 italic">
                              {isManager && (user.role === 'admin' || user.role === 'Admin') 
                                ? 'Admin kullanıcısı' 
                                : 'Yetkisiz'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <UserGroupIcon className="mx-auto h-12 w-12" />
              </div>
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Henüz kullanıcı eklenmemiş</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                İlk kullanıcınızı ekleyerek başlayın
              </p>
            </div>
          )}
        </div>



        {/* Düzenleme Modalı */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-lg p-6 max-w-md w-full mx-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Kullanıcı Düzenle</h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kullanıcı Adı</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => handleFormChange('username', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>E-posta</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Şifre</label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? "text" : "password"}
                      value={editForm.password}
                      onChange={(e) => handleFormChange('password', e.target.value)}
                      className={`w-full px-3 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Mevcut şifre görünüyor, değiştirmek için yazın"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showEditPassword ? (
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

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ad Soyad</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => handleFormChange('fullName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rol</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => handleFormChange('role', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {/* Admin her rolü seçebilir */}
                    {isAdmin && <option value="Admin">Admin</option>}
                    {/* Yönetici sadece Personel rolünü seçebilir */}
                    {isAdmin && <option value="Yönetici">Yönetici</option>}
                    <option value="Personel">Personel</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editForm.isActive}
                    onChange={(e) => handleFormChange('isActive', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Aktif
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingUser(null)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    darkMode 
                      ? 'text-gray-300 bg-gray-700 border border-gray-600 hover:bg-gray-600' 
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  İptal
                </button>
                <button
                  onClick={handleUpdateUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Güncelle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Silme Onay Modalı */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-lg p-6 max-w-md w-full mx-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Kullanıcıyı Sil</h3>
              <p className={`text-sm mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    darkMode 
                      ? 'text-gray-300 bg-gray-700 border border-gray-600 hover:bg-gray-600' 
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  İptal
                </button>
                <button
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Mesaj */}
        {toast.show && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center">
              <span className="mr-2">
                {toast.type === 'success' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Users;
