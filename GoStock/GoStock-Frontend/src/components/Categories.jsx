import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  FolderIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  CalendarIcon,
  CubeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Categories = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(() => {
    return localStorage.getItem('categoriesFormOpen') === 'true';
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formData, setFormData] = useState(() => {
    const savedFormData = localStorage.getItem('categoriesFormData');
    if (savedFormData) {
      return JSON.parse(savedFormData);
    }
    return {
      name: '',
      description: '',
      color: ''
    };
  });

  // Helper function to update form data and save to localStorage
  const updateFormData = (newData) => {
    const updatedData = { ...formData, ...newData };
    setFormData(updatedData);
    localStorage.setItem('categoriesFormData', JSON.stringify(updatedData));
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Oturum bulunamadı');
        return;
      }

      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const categoriesData = await response.json();
        setCategories(categoriesData);
      } else {
        setError('Kategoriler yüklenirken hata oluştu');
      }
    } catch (err) {
      console.error('Kategori yükleme hatası:', err);
      setError('Kategoriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Toast mesaj fonksiyonu
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (editingCategory) {
        // Kategori güncelle
        const response = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: editingCategory.id,
            name: formData.name,
            description: formData.description,
            color: formData.color
          })
        });

        if (response.ok) {
          const updatedCategory = await response.json();
          
          // Kategorileri yeniden yükle
          await fetchCategories();
          
          setEditingCategory(null);
          showToast('Kategori başarıyla güncellendi!', 'success');
        } else {
          const errorData = await response.json();
          showToast(errorData.message || 'Kategori güncellenirken hata oluştu', 'error');
        }
      } else {
        // Yeni kategori ekle
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            color: formData.color
          })
        });

        if (response.ok) {
          const newCategory = await response.json();
          setCategories(prevCategories => [...prevCategories, newCategory]);
          showToast('Kategori başarıyla eklendi!', 'success');
        } else {
          const errorData = await response.json();
          showToast(errorData.message || 'Kategori eklenirken hata oluştu', 'error');
        }
      }
      
      // Form'u temizle
      setFormData({ name: '', description: '', color: '' });
      setShowAddModal(false);
      localStorage.removeItem('categoriesFormOpen');
      localStorage.removeItem('categoriesFormData');
      
      // 3 saniye sonra başarı mesajını temizle
      setTimeout(() => {
        setError(null);
      }, 3000);
      
    } catch (err) {
      console.error('Kategori işlemi hatası:', err);
      showToast('Kategori işlemi sırasında hata oluştu', 'error');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    const editFormData = {
      name: category.name,
      description: category.description || '',
      color: category.color || ''
    };
    setFormData(editFormData);
    localStorage.setItem('categoriesFormData', JSON.stringify(editFormData));
    localStorage.setItem('categoriesFormOpen', 'true');
    setShowAddModal(true);
  };

  const handleDelete = async (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedCategories = categories.filter(cat => cat.id !== categoryToDelete.id);
        setCategories(updatedCategories);
        showToast('Kategori başarıyla silindi!', 'success');
        
        // 3 saniye sonra başarı mesajını temizle
        setTimeout(() => {
          setError(null);
        }, 3000);
      } else {
        showToast('Kategori silinirken hata oluştu', 'error');
      }
    } catch (err) {
      console.error('Kategori silme hatası:', err);
      showToast('Kategori silinirken hata oluştu', 'error');
    } finally {
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  const getProductCount = (category) => {
    // CategoryDto'da ProductCount alanı var, onu kullan
    return category.productCount || 0;
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getMostProductCategory = () => {
    if (categories.length === 0) return null;
    return categories.reduce((prev, current) => 
      getProductCount(prev) > getProductCount(current) ? prev : current
    );
  };

  const getLatestCategory = () => {
    if (categories.length === 0) return null;
    return categories.reduce((prev, current) => 
      new Date(prev.createdAt) > new Date(current.createdAt) ? prev : current
    );
  };

  return (
    <Layout>
      <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Kategoriler</h1>
            <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Ürün kategorilerini yönetin ve organize edin
            </p>
            {error && (
              <p className={`text-sm mt-1 ${
                error.startsWith('✅') 
                  ? 'text-green-600 bg-green-50 px-3 py-2 rounded-md border border-green-200' 
                  : 'text-red-600'
              }`}>
                {error}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Kategori ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>

            {/* Add Category Button */}
            <button
              onClick={() => {
                const newFormData = { name: '', description: '', color: '' };
                setFormData(newFormData);
                localStorage.setItem('categoriesFormData', JSON.stringify(newFormData));
                localStorage.setItem('categoriesFormOpen', 'true');
                setShowAddModal(true);
                setEditingCategory(null);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Kategori Ekle
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Categories */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCategories.map((category, index) => {
                  // Kategori için varsayılan renk belirle
                  const getDefaultColor = (index) => {
                    const colors = ['#E91E63', '#1565C0', '#FFB300', '#4CAF50', '#9C27B0', '#43A047', '#F4511E', '#EC407A', '#795548', '#607D8B'];
                    return colors[index % colors.length];
                  };
                  
                  // Kategori rengine göre kart stillerini belirle
                  const getCardStyles = (color) => {
                    const colorMap = {
                      '#E91E63': { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800' },     // Kadın - Pembe
                      '#1565C0': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },     // Erkek - Mavi
                      '#FFB300': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800' },  // Çocuk - Amber
                      '#4CAF50': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },  // Ev & Yaşam - Yeşil
                      '#9C27B0': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' }, // Elektronik - Mor
                      '#43A047': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },  // Süpermarket - Yeşil
                      '#F4511E': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800' }, // Spor & Outdoor - Turuncu
                      '#EC407A': { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800' },     // Kozmetik & Kişisel Bakım - Pembe
                      '#795548': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800' },  // Ayakkabı & Çanta - Kahverengi
                      '#607D8B': { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800' },  // Saat & Aksesuar - Slate
                      // Eski renkler için backward compatibility
                      '#FFA500': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800' },
                      '#32CD32': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
                      '#FF69B4': { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800' },
                      '#8A2BE2': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
                      '#1E90FF': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
                      '#FF4500': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
                      '#FFD700': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
                      '#FF6347': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' }
                    };
                    
                    return colorMap[color] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800' };
                  };

                  // Kategori adına göre sabit renk belirle
                  const getCategoryColorByName = (categoryName) => {
                    const nameColorMap = {
                      'Kadın': '#E91E63',
                      'Erkek': '#1565C0', 
                      'Çocuk': '#FFB300',
                      'Ev & Yaşam': '#4CAF50',
                      'Elektronik': '#9C27B0',
                      'Süpermarket': '#43A047',
                      'Spor & Outdoor': '#F4511E',
                      'Kozmetik & Kişisel Bakım': '#EC407A',
                      'Ayakkabı & Çanta': '#795548',
                      'Saat & Aksesuar': '#607D8B',
                      // Eski kategoriler için de support
                      'Ev & Mobilya': '#4CAF50',
                      'Kozmetik': '#EC407A',
                      'Kitap & Kırtasiye': '#FFB300',
                      'Giyim': '#E91E63'
                    };
                    
                    return nameColorMap[categoryName] || getDefaultColor(index);
                  };
                  
                  const categoryColor = category.color || getCategoryColorByName(category.name);
                  
                  const cardStyles = getCardStyles(categoryColor);
                  
                  return (
                    <div 
                      key={category.id} 
                      className={`${cardStyles.bg} rounded-xl shadow-sm border-2 ${cardStyles.border} p-6 hover:shadow-md transition-all duration-300 hover:scale-105`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div 
                            className="h-12 w-12 rounded-lg flex items-center justify-center mr-3 shadow-md"
                            style={{ backgroundColor: categoryColor + '20' }}
                          >
                            <FolderIcon 
                              className="h-8 w-8" 
                              style={{ color: categoryColor }}
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                            <p className="text-sm text-gray-500">{category.description || 'Açıklama yok'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Ürün Sayısı:</span>
                          <span className={`font-medium px-2 py-1 rounded-full text-xs ${cardStyles.bg} ${cardStyles.text}`}>
                            {getProductCount(category)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Oluşturulma:</span>
                          <span className="text-gray-900">
                            {new Date(category.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                        <Link 
                          to={`/products?category=${category.id}`}
                          className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Ürünleri Görüntüle
                        </Link>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition-colors"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredCategories.length === 0 && (
              <div className={`text-center py-12 rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="text-gray-400 mb-4">
                  <FolderIcon className="mx-auto h-12 w-12" />
                </div>
                <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Kategori bulunamadı</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  {searchTerm ? 'Arama kriterlerinize uygun kategori bulunamadı.' : 'Henüz kategori eklenmemiş.'}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Statistics */}
          <div className="space-y-6">
            {/* Total Categories */}
            <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FolderIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Kategori</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{categories.length}</p>
                </div>
              </div>
            </div>

            {/* Most Product Category */}
            {getMostProductCategory() && (
              <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <ChartBarIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>En Çok Ürün</p>
                    <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{getMostProductCategory().name}</p>
                    <p className="text-sm text-gray-500">{getProductCount(getMostProductCategory())} ürün</p>
                  </div>
                </div>
              </div>
            )}

            {/* Latest Category */}
            {getLatestCategory() && (
              <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <CalendarIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Son Eklenen</p>
                    <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{getLatestCategory().name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(getLatestCategory().createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-xl w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      localStorage.removeItem('categoriesFormOpen');
                      localStorage.removeItem('categoriesFormData');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Kategori Adı <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateFormData({ name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder="Kategori adını girin"
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Açıklama
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateFormData({ description: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder="Kategori açıklaması girin (opsiyonel)"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Renk
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.color || '#E91E63'}
                        onChange={(e) => updateFormData({ color: e.target.value })}
                        className={`w-12 h-10 border rounded-md cursor-pointer ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => updateFormData({ color: e.target.value })}
                        placeholder="#E91E63"
                        className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {['#E91E63', '#1565C0', '#FFB300', '#4CAF50', '#9C27B0', '#43A047', '#F4511E', '#EC407A', '#795548', '#607D8B'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className="w-8 h-8 rounded-md border-2 border-gray-300 hover:border-gray-500 transition-colors"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        localStorage.removeItem('categoriesFormOpen');
                        localStorage.removeItem('categoriesFormData');
                      }}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                    >
                      {editingCategory ? 'Güncelle' : 'Ekle'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && categoryToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-xl w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Kategoriyi Sil
                  </h3>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-gray-900">"{categoryToDelete.name}"</span> kategorisini silmek istediğinizden emin misiniz?
                  </p>
                  {getProductCount(categoryToDelete) > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Bu kategoride <span className="font-medium">{getProductCount(categoryToDelete)}</span> ürün bulunuyor. 
                        Kategori silindiğinde bu ürünler kategorisiz kalacaktır.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setCategoryToDelete(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                  >
                    Evet, Sil
                  </button>
                </div>
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

export default Categories;
