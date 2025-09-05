import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { PlusIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon, CheckIcon, XMarkIcon, FolderIcon } from '@heroicons/react/24/outline';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Products = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showAddForm, setShowAddForm] = useState(() => {
    return localStorage.getItem('productsFormOpen') === 'true';
  });
  const [addFormData, setAddFormData] = useState(() => {
    const savedFormData = localStorage.getItem('productsFormData');
    if (savedFormData) {
      return JSON.parse(savedFormData);
    }
    return {
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      categoryId: '',
      isActive: true
    };
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Sıralama için state'ler
  const [sortField, setSortField] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' veya 'desc'
  
  // Yeni arama seçenekleri
  const [searchOptions, setSearchOptions] = useState({
    startsWith: false, // Sadece belirli harfle başlayan ürünleri ara
    exactMatch: false, // Tam eşleşme ara
    caseSensitive: false // Büyük/küçük harf duyarlı
  });

  // URL parametrelerini okumak için
  const location = useLocation();
  const navigate = useNavigate();

  // Mevcut kullanıcının rolünü al
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'Admin';
  const isManager = currentUser.role === 'manager' || currentUser.role === 'Yönetici';
  const canModifyProducts = true; // Tüm kullanıcılar ürün ekleyebilir

  // Helper function to update form data and save to localStorage
  const updateAddFormData = (newData) => {
    const updatedData = { ...addFormData, ...newData };
    setAddFormData(updatedData);
    localStorage.setItem('productsFormData', JSON.stringify(updatedData));
  };

  // URL'den kategori ID'sini oku
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryId = searchParams.get('category');
    if (categoryId && categoryId !== 'all') {
      setSelectedCategory(categoryId);
    }
  }, [location.search]);

  // Kategori değişikliğinde URL'i güncelle
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    
    // URL'i güncelle
    const searchParams = new URLSearchParams(location.search);
    if (categoryId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryId);
    }
    
    const newUrl = `${location.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    navigate(newUrl, { replace: true });
  };

  // Filtreleri temizle
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSearchOptions({
      startsWith: false,
      exactMatch: false,
      caseSensitive: false
    });
    
    // URL'den kategori parametresini kaldır
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('category');
    const newUrl = `${location.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    navigate(newUrl, { replace: true });
  };

  // Arama seçeneklerini değiştir
  const handleSearchOptionChange = (option) => {
    setSearchOptions(prev => {
      const newOptions = {
        startsWith: false,
        exactMatch: false,
        caseSensitive: false
      };
      
      // Sadece seçilen seçeneği aktif et
      if (option === 'startsWith') {
        newOptions.startsWith = true;
      } else if (option === 'exactMatch') {
        newOptions.exactMatch = true;
      } else if (option === 'normal') {
        // Normal arama seçeneği aktifse, startsWith ve exactMatch'i devre dışı bırak
        newOptions.startsWith = false;
        newOptions.exactMatch = false;
      }
      
      return newOptions;
    });
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Oturum bulunamadı');
        return;
      }

      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const apiResponse = await response.json();
        if (apiResponse.success) {
          setProducts(apiResponse.data);
          setFilteredProducts(apiResponse.data);
        } else {
          setError(apiResponse.message || 'Ürünler yüklenirken hata oluştu');
        }
      } else {
        setError('Ürünler yüklenirken hata oluştu');
      }
    } catch (err) {
      console.error('Ürün yükleme hatası:', err);
      setError('Ürünler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const categories = await response.json();
        setCategories(categories);
      }
    } catch (err) {
      console.error('Kategori yükleme hatası:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Toast mesaj fonksiyonu
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  useEffect(() => {
    // Filtreleme işlemi
    let filtered = products;

    if (searchTerm) {
      if (searchOptions.startsWith) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().startsWith(searchTerm.toLowerCase())
        );
      } else if (searchOptions.exactMatch) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase() === searchTerm.toLowerCase()
        );
      } else {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoryId === parseInt(selectedCategory));
    }

    // Sıralama işlemi
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Kategori için özel işlem - kategori adına göre sırala
      if (sortField === 'categoryId') {
        aValue = getCategoryName(a.categoryId);
        bValue = getCategoryName(b.categoryId);
      }
      
      // Tarih alanları için özel işlem
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      // String alanları için özel işlem
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      // Sayısal alanlar için özel işlem
      if (typeof aValue === 'number') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }
      
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products, sortField, sortDirection, searchOptions]);

  // Debug: editingProduct state değişikliklerini izle
  useEffect(() => {
    console.log('editingProduct changed:', editingProduct);
    
    // Düzenleme formu açıldığında otomatik scroll yap
    if (editingProduct) {
      setTimeout(() => {
        const editForm = document.querySelector('[data-edit-form]');
        if (editForm) {
          editForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [editingProduct]);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/products/${productToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const apiResponse = await response.json();
          if (apiResponse.success) {
            // Ürünü listeden kaldır
            const updatedProducts = products.filter(p => p.id !== productToDelete.id);
            setProducts(updatedProducts);
            
            // Başarı mesajını göster
            showToast('Ürün başarıyla silindi!', 'success');
             
             // Dashboard'ı güncelle
             console.log('Dispatching productChanged event...'); // Debug
             window.dispatchEvent(new CustomEvent('productChanged'));
             
             // Modal'ı kapat
             setShowDeleteModal(false);
             setProductToDelete(null);
             
             // 3 saniye sonra başarı mesajını temizle
             setTimeout(() => {
               setError(null);
             }, 3000);
          } else {
            showToast(apiResponse.message || 'Ürün silinirken hata oluştu', 'error');
          }
        } else {
          showToast('Ürün silinirken hata oluştu', 'error');
        }
      } catch (err) {
        console.error('Ürün silme hatası:', err);
        showToast('Ürün silinirken hata oluştu', 'error');
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleDetailClick = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleEditClick = (product) => {
    console.log('Edit clicked for product:', product);
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.categoryId,
      isActive: product.isActive
    });
  };

  // Değişiklik olup olmadığını kontrol et
  const hasChanges = () => {
    if (!editingProduct) return false;
    
    return (
      editFormData.name !== editingProduct.name ||
      editFormData.description !== (editingProduct.description || '') ||
      editFormData.price !== editingProduct.price ||
      editFormData.stockQuantity !== editingProduct.stockQuantity ||
      editFormData.categoryId !== editingProduct.categoryId ||
      editFormData.isActive !== editingProduct.isActive
    );
  };

  const handleEditSave = async () => {
    if (editingProduct && editFormData.name && editFormData.categoryId && hasChanges()) {
      try {
        const token = localStorage.getItem('token');
        
        // Hangi alanların değiştiğini tespit et
        const changedFields = [];
        if (editFormData.name !== editingProduct.name) {
          changedFields.push('adını');
        }
        if (editFormData.categoryId !== editingProduct.categoryId) {
          changedFields.push('kategorisini');
        }
        if (editFormData.stockQuantity !== editingProduct.stockQuantity) {
          changedFields.push('stok miktarını');
        }
        if (editFormData.price !== editingProduct.price) {
          changedFields.push('fiyatını');
        }
        
        // Güncel tarihi ekle
        const dataToSend = {
          ...editFormData,
          updatedAt: new Date().toISOString()
        };
        
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
          const apiResponse = await response.json();
          if (apiResponse.success) {
            const updatedProduct = apiResponse.data;
            const updatedProducts = products.map(p => 
              p.id === editingProduct.id ? updatedProduct : p
            );
            
            setProducts(updatedProducts);
            
            // Başarı mesajını göster
            showToast('Ürün başarıyla güncellendi!', 'success');
            
            // Dashboard'ı güncelle - hangi alanların değiştiği bilgisini gönder
            console.log('Dispatching productChanged event...'); // Debug
            const changeDetails = {
              productName: editFormData.name,
              changedFields: changedFields
            };
            window.dispatchEvent(new CustomEvent('productChanged', { detail: changeDetails }));
            
            // Düzenleme modunu kapat
            setEditingProduct(null);
            setEditFormData({});
            
            // 3 saniye sonra başarı mesajını temizle
            setTimeout(() => {
              setError(null);
            }, 3000);
          } else {
            showToast(apiResponse.message || 'Ürün güncellenirken hata oluştu', 'error');
          }
        } else {
          showToast('Ürün güncellenirken hata oluştu', 'error');
        }
      } catch (err) {
        console.error('Ürün güncelleme hatası:', err);
        showToast('Ürün güncellenirken hata oluştu', 'error');
      }
    }
  };

  const handleEditCancel = () => {
    setEditingProduct(null);
    setEditFormData({});
  };

  const handleAddClick = () => {
    const newFormData = {
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      categoryId: categories.length > 0 ? categories[0].id : '',
      isActive: true
    };
    setAddFormData(newFormData);
    localStorage.setItem('productsFormData', JSON.stringify(newFormData));
    localStorage.setItem('productsFormOpen', 'true');
    setShowAddForm(true);
  };

  const handleAddSave = async () => {
    if (addFormData.name && addFormData.categoryId) {
      try {
        const token = localStorage.getItem('token');
        
        // Oluşturulma ve güncellenme tarihlerini ekle
        const dataToSend = {
          ...addFormData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
          const apiResponse = await response.json();
          if (apiResponse.success) {
            const newProduct = apiResponse.data;
            const updatedProducts = [...products, newProduct];
            setProducts(updatedProducts);
            
            // Başarı mesajını göster
            showToast('Ürün başarıyla kaydedildi!', 'success');
             
             // Dashboard'ı güncelle
             console.log('Dispatching productChanged event...'); // Debug
             window.dispatchEvent(new CustomEvent('productChanged'));
             
                         // Form'u kapat
            setShowAddForm(false);
            localStorage.removeItem('productsFormOpen');
            localStorage.removeItem('productsFormData');
            setAddFormData({
              name: '',
              description: '',
              price: 0,
              stockQuantity: 0,
              categoryId: '',
              isActive: true
            });
             
             // 3 saniye sonra başarı mesajını temizle
             setTimeout(() => {
               setError(null);
             }, 3000);
          } else {
            showToast(apiResponse.message || 'Ürün eklenirken hata oluştu', 'error');
          }
        } else {
          showToast('Ürün eklenirken hata oluştu', 'error');
        }
      } catch (err) {
        console.error('Ürün ekleme hatası:', err);
        showToast('Ürün eklenirken hata oluştu', 'error');
      }
    }
  };

  const handleAddCancel = () => {
    setShowAddForm(false);
    localStorage.removeItem('productsFormOpen');
    localStorage.removeItem('productsFormData');
    setAddFormData({
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      categoryId: '',
      isActive: true
    });
  };



  const getStockStatus = (stockQuantity, isActive) => {
    // Önce aktif/pasif durumunu kontrol et
    if (!isActive) return { text: 'Stokta Değil', color: 'text-gray-600 bg-gray-100' };
    
    // Sonra stok durumunu kontrol et
    if (stockQuantity === 0) return { text: 'Stokta Yok', color: 'text-red-600 bg-red-100' };
    if (stockQuantity <= 10) return { text: 'Kritik Stok', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'Stokta', color: 'text-green-600 bg-green-100' };
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Bilinmeyen';
  };

  // Kategori rengine göre etiket stillerini belirle (Kategoriler sayfasıyla aynı sistem)
  const getCategoryBadgeStyles = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return { bg: 'bg-gray-100', text: 'text-gray-800' };
    
    // Kategori için varsayılan renk belirle (index'e göre)
    const getDefaultColor = (index) => {
      const colors = ['#E91E63', '#1565C0', '#FFB300', '#4CAF50', '#9C27B0', '#43A047', '#F4511E', '#EC407A', '#795548', '#607D8B'];
      return colors[index % colors.length];
    };

    // Kategori adına göre sabit renk belirle (Kategoriler sayfasıyla aynı)
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
        'Giyim': '#E91E63',
        'Aksesuar': '#607D8B',
        'Kablo': '#795548',
        'Giriş Cihazı': '#1565C0',
        'Yazıcı': '#F4511E',
        'Mobil': '#9C27B0',
        'Bilgisayar': '#4CAF50',
        'Gaming': '#E91E63',
        'Ses Sistemleri': '#FFB300',
        'Güvenlik': '#43A047'
      };
      
      return nameColorMap[categoryName] || getDefaultColor(categoryId);
    };
    
    const categoryColor = category.color || getCategoryColorByName(category.name);
    
    // Renk haritası - Kategoriler sayfasıyla aynı
    const colorMap = {
      '#E91E63': { bg: 'bg-pink-100', text: 'text-pink-800' },     // Kadın - Pembe
      '#1565C0': { bg: 'bg-blue-100', text: 'text-blue-800' },     // Erkek - Mavi
      '#FFB300': { bg: 'bg-amber-100', text: 'text-amber-800' },   // Çocuk - Amber
      '#4CAF50': { bg: 'bg-green-100', text: 'text-green-800' },   // Ev & Yaşam - Yeşil
      '#9C27B0': { bg: 'bg-purple-100', text: 'text-purple-800' }, // Elektronik - Mor
      '#43A047': { bg: 'bg-green-100', text: 'text-green-800' },   // Süpermarket - Yeşil
      '#F4511E': { bg: 'bg-orange-100', text: 'text-orange-800' }, // Spor & Outdoor - Turuncu
      '#EC407A': { bg: 'bg-pink-100', text: 'text-pink-800' },     // Kozmetik & Kişisel Bakım - Pembe
      '#795548': { bg: 'bg-amber-100', text: 'text-amber-800' },   // Ayakkabı & Çanta - Kahverengi
      '#607D8B': { bg: 'bg-slate-100', text: 'text-slate-800' },   // Saat & Aksesuar - Slate
      // Eski renkler için backward compatibility
      '#FFA500': { bg: 'bg-orange-100', text: 'text-orange-800' },
      '#32CD32': { bg: 'bg-green-100', text: 'text-green-800' },
      '#FF69B4': { bg: 'bg-pink-100', text: 'text-pink-800' },
      '#8A2BE2': { bg: 'bg-purple-100', text: 'text-purple-800' },
      '#1E90FF': { bg: 'bg-blue-100', text: 'text-blue-800' },
      '#FF4500': { bg: 'bg-red-100', text: 'text-red-800' },
      '#FFD700': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      '#FF6347': { bg: 'bg-red-100', text: 'text-red-800' }
    };
    
    return colorMap[categoryColor] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  };

  // Sıralama fonksiyonu
  const handleSort = (field) => {
    if (sortField === field) {
      // Aynı alana tekrar tıklandığında yönü değiştir
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Yeni alan seçildiğinde varsayılan olarak azalan sıralama
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sıralama ikonu
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    if (sortDirection === 'asc') {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price) return '₺0';
    if (price >= 1000) {
      return `₺${(price / 1000).toFixed(1)}K`;
    }
    return `₺${price.toFixed(0)}`;
  };

  const formatStock = (quantity) => {
    if (quantity >= 1000) {
      return `${(quantity / 1000).toFixed(1)}K`;
    }
    return quantity.toString();
  };



  return (
    <Layout>
      <div className={`space-y-6 flex flex-col h-full ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ürünler</h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              Toplam {products.length} ürün bulundu
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
          <div className="mt-4 sm:mt-0">
            {/* Sadece Admin ve Yöneticiler ürün ekleyebilir */}
            {canModifyProducts && (
              <>
                {!showAddForm ? (
                  <button
                    onClick={handleAddClick}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Yeni Ürün Ekle
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleAddSave}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckIcon className="h-5 w-5 mr-2" />
                      Kaydet
                    </button>
                    <button
                      onClick={handleAddCancel}
                      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5 mr-2" />
                      İptal
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <div className={`rounded-lg shadow p-6 border-2 ${darkMode ? 'bg-gray-800 border-blue-600' : 'bg-white border-blue-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <PlusIcon className="h-5 w-5 mr-2 text-blue-600" />
              Yeni Ürün Ekle
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ürün Adı *</label>
                <input
                  type="text"
                  value={addFormData.name}
                  onChange={(e) => updateAddFormData({ name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="Ürün adı"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kategori *</label>
                <select
                  value={addFormData.categoryId}
                  onChange={(e) => updateAddFormData({ categoryId: parseInt(e.target.value) })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="">Kategori seçin</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stok Miktarı</label>
                <input
                  type="number"
                  value={addFormData.stockQuantity}
                  onChange={(e) => updateAddFormData({ stockQuantity: parseInt(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Fiyat (₺)</label>
                <input
                  type="number"
                  step="0.01"
                  value={addFormData.price}
                  onChange={(e) => updateAddFormData({ price: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="0.00"
                  min="0"
                />
              </div>
                             <div className="flex items-center">
                 <input
                   type="checkbox"
                   id="isActive"
                   checked={addFormData.isActive}
                   onChange={(e) => updateAddFormData({ isActive: e.target.checked })}
                   className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                 />
                 <label htmlFor="isActive" className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                   Aktif
                 </label>
               </div>
            </div>
            <div className="mt-4">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Açıklama</label>
              <input
                type="text"
                value={addFormData.description}
                onChange={(e) => updateAddFormData({ description: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="Ürün açıklaması (opsiyonel)"
              />
            </div>
          </div>
        )}

        {/* Edit Product Form - Daha görünür ve üstte */}
        {editingProduct && (
          <div data-edit-form className={`rounded-xl shadow-lg p-6 border-2 mb-6 ${darkMode ? 'bg-gray-800 border-green-600' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'}`}>
                         <div className="flex items-center justify-between mb-4">
               <div>
                 <h3 className={`text-xl font-bold flex items-center ${darkMode ? 'text-white' : 'text-green-800'}`}>
                   <PencilIcon className="h-6 w-6 mr-3 text-green-600" />
                   Ürün Düzenle: {editingProduct.name}
                 </h3>
                 {!hasChanges() && (
                   <p className={`text-sm mt-1 ml-9 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                     Henüz değişiklik yapmadınız
                   </p>
                 )}
                 {hasChanges() && (
                   <p className="text-sm text-green-600 mt-1 ml-9 font-medium">
                     ✓ Değişiklikler yapıldı
                   </p>
                 )}
               </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleEditCancel}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors shadow-sm ${
                    darkMode 
                      ? 'text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600' 
                      : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  İptal
                </button>
                                 <button
                   onClick={handleEditSave}
                   disabled={!hasChanges()}
                   className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors shadow-sm ${
                     hasChanges() 
                       ? 'text-white bg-green-600 border-transparent hover:bg-green-700 cursor-pointer' 
                       : 'text-gray-400 bg-gray-300 border-gray-300 cursor-not-allowed'
                   }`}
                 >
                   <CheckIcon className="h-4 w-4 inline mr-2" />
                   Güncelle
                 </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ürün Adı *</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="Ürün adı"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kategori *</label>
                <select
                  value={editFormData.categoryId}
                  onChange={(e) => setEditFormData({...editFormData, categoryId: parseInt(e.target.value)})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stok Miktarı</label>
                <input
                  type="number"
                  value={editFormData.stockQuantity}
                  onChange={(e) => setEditFormData({...editFormData, stockQuantity: parseInt(e.target.value) || 0})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Fiyat (₺)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({...editFormData, price: parseFloat(e.target.value) || 0})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="0.00"
                  min="0"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editFormData.isActive}
                  onChange={(e) => setEditFormData({...editFormData, isActive: e.target.checked})}
                  className={`h-4 w-4 text-green-600 focus:ring-green-500 rounded ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                />
                <label htmlFor="editIsActive" className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Aktif
                </label>
              </div>
            </div>
            <div className="mt-4">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Açıklama</label>
              <input
                type="text"
                value={editFormData.description}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="Ürün açıklaması (opsiyonel)"
              />
            </div>
          </div>
        )}

        {/* Selected Category Info */}
        {selectedCategory !== 'all' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <FolderIcon className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  Kategori Filtrelenmiş: {getCategoryName(parseInt(selectedCategory))}
                </h3>
                <p className="text-sm text-blue-700">
                  Bu kategorideki ürünler hafif mavi satır olarak gösteriliyor
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Arama
              </label>
              <input
                type="text"
                placeholder="Ürün adı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="all">Tüm Kategoriler</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className={`w-full px-4 py-2 rounded-md transition-colors ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className={`rounded-lg shadow overflow-hidden flex-1 flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Fixed Header */}
          <div className={`border-b ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <table className="min-w-full table-fixed" style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th 
                    className={`pl-1 pr-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    style={{ width: '64px' }}
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>ID</span>
                      {getSortIcon('id')}
                    </div>
                  </th>
                  <th 
                    className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    style={{ width: '192px' }}
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Ürün</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    style={{ width: '112px' }}
                    onClick={() => handleSort('categoryId')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Kategori</span>
                      {getSortIcon('categoryId')}
                    </div>
                  </th>
                  <th 
                    className={`px-3 py-3 text-right text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    style={{ width: '96px', transform: 'translateX(-15px)' }}
                    onClick={() => handleSort('stockQuantity')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Stok</span>
                      {getSortIcon('stockQuantity')}
                    </div>
                  </th>
                  <th 
                    className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    style={{ width: '96px', transform: 'translateX(15px)' }}
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Fiyat</span>
                      {getSortIcon('price')}
                    </div>
                  </th>
                  <th className={`pr-3 py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} style={{ width: '96px', paddingLeft: '0px', transform: 'translateX(-8px)' }}>
                    Durum
                  </th>
                  <th 
                    className={`px-3 py-3 text-right text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    style={{ width: '96px', transform: 'translateX(15px)' }}
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Oluşturulma</span>
                      {getSortIcon('createdAt')}
                    </div>
                  </th>
                  <th 
                    className={`px-3 py-3 text-right text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    style={{ width: '96px', transform: 'translateX(15px)' }}
                    onClick={() => handleSort('updatedAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Güncellenme</span>
                      {getSortIcon('updatedAt')}
                    </div>
                  </th>
                  <th className={`px-3 py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} style={{ width: '112px' }}>
                    İşlemler
                  </th>
                </tr>
              </thead>
            </table>
          </div>
          
          {/* Scrollable Body */}
          <div className="overflow-y-auto flex-1 pb-4" style={{ height: 'calc(100vh - 350px)', minHeight: '500px' }}>
            <table className="min-w-full divide-y divide-gray-200 table-fixed" style={{ tableLayout: 'fixed', width: '100%' }}>
              <tbody className={`divide-y ${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stockQuantity, product.isActive);
                  const isSelectedCategory = selectedCategory !== 'all' && product.categoryId === parseInt(selectedCategory);
                  
                  return (
                    <tr 
                      key={product.id} 
                      className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${
                        isSelectedCategory ? (darkMode ? 'bg-blue-900 border-l-4 border-l-blue-400' : 'bg-blue-50 border-l-4 border-l-blue-400') : ''
                      }`}
                    >
                      <td className={`pl-1 pr-3 py-4 whitespace-nowrap text-sm font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ width: '64px' }}>
                        #{product.id}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap" style={{ width: '192px' }}>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-gray-600">
                              {product.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-2 min-w-0">
                            <div className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {product.name}
                            </div>
                            <div className={`text-xs truncate max-w-32 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {product.description ? (product.description.length > 20 ? product.description.substring(0, 20) + '...' : product.description) : 'Açıklama yok'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap" style={{ width: '112px' }}>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          isSelectedCategory ? 'bg-blue-200 text-blue-900' : getCategoryBadgeStyles(product.categoryId).bg + ' ' + getCategoryBadgeStyles(product.categoryId).text
                        }`}>
                          {getCategoryName(product.categoryId)}
                        </span>
                      </td>
                      <td className={`px-3 py-4 whitespace-nowrap text-sm text-center ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ width: '96px' }}>
                        {formatStock(product.stockQuantity)}
                      </td>
                      <td className={`px-3 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ width: '96px', transform: 'translateX(25px)' }}>
                        {formatPrice(product.price)}
                      </td>
                      <td className="pl-1 pr-3 py-4 whitespace-nowrap text-right" style={{ width: '96px' }}>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className={`px-3 py-4 whitespace-nowrap text-sm text-right ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} style={{ width: '96px' }}>
                        {formatDate(product.createdAt)}
                      </td>
                      <td className={`px-3 py-4 whitespace-nowrap text-sm text-right ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} style={{ width: '96px' }}>
                        {formatDate(product.updatedAt)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium" style={{ width: '112px' }}>
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditClick(product)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors border border-blue-200"
                            title="Düzenle"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Sil"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün bulunamadı</h3>
              <p className="text-gray-500">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Arama kriterlerinize uygun ürün bulunamadı.' 
                  : 'Henüz hiç ürün eklenmemiş.'}
              </p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && productToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg max-w-md w-full p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ürünü Sil</h3>
                </div>
              </div>
              
              <div className="mb-6">
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  <strong>"{productToDelete.name}"</strong> ürününü silmek istediğinizden emin misiniz?
                </p>
                <p className={`text-sm mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Bu işlem geri alınamaz.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    darkMode 
                      ? 'text-gray-300 bg-gray-700 border border-gray-600 hover:bg-gray-600' 
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  İptal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors"
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
    </Layout>
  );
};

export default Products;
