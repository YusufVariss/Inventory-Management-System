import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://localhost:5107';
console.log('🔍 API_BASE_URL:', API_BASE_URL);

const StockMovements = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [stockMovements, setStockMovements] = useState([]);
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showAddForm, setShowAddForm] = useState(() => {
    return localStorage.getItem('stockMovementsFormOpen') === 'true';
  });
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [addFormData, setAddFormData] = useState(() => {
    const savedFormData = localStorage.getItem('stockMovementsFormData');
    if (savedFormData) {
      return JSON.parse(savedFormData);
    }
    return {
      productId: '',
      movementType: 'in',
      quantity: 0,
      unitPrice: 0,
      notes: ''
    };
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState(null);

  // Helper function to update form data and save to localStorage
  const updateAddFormData = (newData) => {
    const updatedData = { ...addFormData, ...newData };
    setAddFormData(updatedData);
    localStorage.setItem('stockMovementsFormData', JSON.stringify(updatedData));
  };
  
  // Summary statistics
  const [summaryStats, setSummaryStats] = useState({
    totalIn: 0,
    totalOut: 0,
    netChange: 0,
    totalMovements: 0,
    monthlyIn: 0,
    monthlyOut: 0
  });

  // Toast mesaj fonksiyonu
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Kullanıcılar yükleme hatası:', err);
    }
  };

  // Fetch stock movements from API
  const fetchStockMovements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Oturum bulunamadı');
        return;
      }

      console.log('🔍 Stok hareketleri API çağrısı yapılıyor...');
      console.log('🔍 API URL:', `${API_BASE_URL}/api/StockMovements`);
      console.log('🔍 Token:', token ? 'Mevcut' : 'Yok');
      
      const response = await fetch(`${API_BASE_URL}/api/StockMovements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 API Response Status:', response.status);
      console.log('🔍 API Response OK:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        
        console.log('🔍 API\'den gelen veri:', data);
        console.log('🔍 Veri tipi:', typeof data);
        console.log('🔍 Veri uzunluğu:', Array.isArray(data) ? data.length : 'Array değil');
        
        // İlk stok hareketinin detaylarını logla
        if (data && data.length > 0) {
          console.log('🔍 İlk stok hareketi:', data[0]);
          console.log('🔍 İlk stok hareketi User:', data[0].User);
          console.log('🔍 İlk stok hareketi Product:', data[0].Product);
          console.log('🔍 İlk stok hareketi tüm property\'ler:', Object.keys(data[0]));
          console.log('🔍 İlk stok hareketi userId:', data[0].userId);
          console.log('🔍 İlk stok hareketi productId:', data[0].productId);
        }
        
        console.log('🔍 State güncelleniyor...');
        setStockMovements(data);
        setFilteredMovements(data);
        
        console.log('🔍 StockMovements state güncellendi, uzunluk:', data ? data.length : 0);
        
        // Eğer stok hareketi yoksa, özet istatistikleri güncelle
        if (!data || data.length === 0) {
          setSummaryStats({
            totalIn: 0,
            totalOut: 0,
            netChange: 0,
            totalMovements: 0,
            monthlyIn: 0,
            monthlyOut: 0
          });
        } else {
          // Veri varsa da özet istatistikleri güncelle
          calculateSummaryStats(data);
        }
      } else {
        console.error('❌ API hatası:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Hata detayı:', errorText);
        
        setError(`Stok hareketleri yüklenirken hata oluştu: ${response.status} ${response.statusText}`);
        // Hata durumunda da özet istatistikleri sıfırla
        setSummaryStats({
          totalIn: 0,
          totalOut: 0,
          netChange: 0,
          totalMovements: 0,
          monthlyIn: 0,
          monthlyOut: 0
        });
      }
    } catch (err) {
      console.error('❌ Stok hareketleri yükleme hatası:', err);
      console.error('❌ Hata mesajı:', err.message);
      console.error('❌ Hata stack:', err.stack);
      
      setError(`Stok hareketleri yüklenirken hata oluştu: ${err.message}`);
      // Hata durumunda da özet istatistikleri sıfırla
      setSummaryStats({
        totalIn: 0,
        totalOut: 0,
        netChange: 0,
        totalMovements: 0,
        monthlyIn: 0,
        monthlyOut: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const apiResponse = await response.json();
        if (apiResponse.success) {
          setProducts(apiResponse.data);
        }
      }
    } catch (err) {
      console.error('Ürünler yükleme hatası:', err);
    }
  };

  // Fetch summary statistics from API
  const fetchSummaryStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/StockMovements/statistics/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // API'den gelen verileri kontrol et ve null/undefined değerleri 0 yap
        setSummaryStats({
          totalIn: data.totalIn ?? 0,
          totalOut: data.totalOut ?? 0,
          netChange: data.netChange ?? 0,
          totalMovements: data.totalMovements ?? 0,
          monthlyIn: data.monthlyIn ?? 0,
          monthlyOut: data.monthlyOut ?? 0
        });
      } else {
        // API çağrısı başarısız olursa, tüm değerleri 0 yap
        setSummaryStats({
          totalIn: 0,
          totalOut: 0,
          netChange: 0,
          totalMovements: 0,
          monthlyIn: 0,
          monthlyOut: 0
        });
      }
    } catch (err) {
      console.error('Özet istatistikler yükleme hatası:', err);
      // Hata durumunda da tüm değerleri 0 yap
      setSummaryStats({
        totalIn: 0,
        totalOut: 0,
        netChange: 0,
        totalMovements: 0,
        monthlyIn: 0,
        monthlyOut: 0
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newData = {
      [name]: name === 'quantity' || name === 'unitPrice' ? parseFloat(value) || 0 : value
    };
    updateAddFormData(newData);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!addFormData.productId) {
      showToast('Lütfen bir ürün seçin', 'error');
      return;
    }
    
    if (!addFormData.quantity || addFormData.quantity <= 0) {
      showToast('Lütfen geçerli bir miktar girin', 'error');
      return;
    }
    
    if (addFormData.movementType === 'out') {
      const selectedProduct = products.find(p => p.id === parseInt(addFormData.productId));
      const currentStock = selectedProduct ? selectedProduct.stockQuantity || 0 : 0;
      if (addFormData.quantity > currentStock) {
        showToast('Çıkış miktarı mevcut stoktan fazla olamaz', 'error');
        return;
      }
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Oturum bulunamadı');
        return;
      }

      // Use the specialized endpoint based on movement type
      const endpoint = addFormData.movementType === 'in' 
        ? '/api/StockMovements/stock-in'
        : '/api/StockMovements/stock-out';

      // Seçilen ürünün mevcut stok miktarını bul
      const selectedProduct = products.find(p => p.id === parseInt(addFormData.productId));
      const currentStock = selectedProduct ? selectedProduct.stockQuantity || 0 : 0;
      
      // Yeni stok miktarını hesapla
      const newStock = addFormData.movementType === 'in' 
        ? currentStock + addFormData.quantity 
        : currentStock - addFormData.quantity;

      const dataToSend = {
        productId: parseInt(addFormData.productId),
        quantity: parseInt(addFormData.quantity),
        userId: 1, // TODO: Get actual user ID from JWT token
        unitPrice: addFormData.unitPrice > 0 ? parseFloat(addFormData.unitPrice) : null,
        totalAmount: addFormData.unitPrice > 0 ? parseFloat(addFormData.unitPrice) * parseInt(addFormData.quantity) : null,
        reference: null,
        notes: addFormData.notes || null
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      console.log('📤 Gönderilen veri:', dataToSend);
      console.log('📤 JSON string:', JSON.stringify(dataToSend));

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Stok hareketi başarıyla eklendi:', result);
        
        // Reset form and close
        setAddFormData({
          productId: '',
          movementType: 'in',
          quantity: 0,
          unitPrice: 0,
          notes: ''
        });
        setShowAddForm(false);
        localStorage.removeItem('stockMovementsFormOpen');
        localStorage.removeItem('stockMovementsFormData');
        
        // Refresh data
        await fetchStockMovements();
        await fetchSummaryStats();
        
        // Show success message
        showToast('Stok hareketi başarıyla eklendi!', 'success');
        
        // Dashboard'ı güncelle
        window.dispatchEvent(new CustomEvent('productChanged'));
        
        // Stok hareketi değişikliği event'ini tetikle
        const selectedProduct = products.find(p => p.id === parseInt(addFormData.productId));
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        window.dispatchEvent(new CustomEvent('stockMovementChanged', {
          detail: {
            type: 'stock_movement',
            productName: selectedProduct ? selectedProduct.name : 'Bilinmeyen Ürün',
            movementType: addFormData.movementType,
            quantity: addFormData.quantity,
            userName: currentUser.fullName || currentUser.username || 'Sistem',
            timestamp: new Date()
          }
        }));
        
        setTimeout(() => setError(null), 3000);
      } else {
        // Try to get error details from response
        let errorMessage = 'Stok hareketi eklenirken hata oluştu';
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.title) {
            errorMessage = errorData.title;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } catch (parseError) {
          // If we can't parse the error, use the status text
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        showToast(errorMessage, 'error');
      }
    } catch (err) {
      console.error('Stok hareketi ekleme hatası:', err);
      showToast('Stok hareketi eklenirken hata oluştu: ' + err.message, 'error');
    }
  };

  // Handle delete click
  const handleDeleteClick = (movement) => {
    setMovementToDelete(movement);
    setShowDeleteModal(true);
  };

  // Delete stock movement
  const handleDeleteConfirm = async () => {
    if (!movementToDelete) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.', 'error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/StockMovements/${movementToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showToast('Stok hareketi başarıyla silindi', 'success');
        fetchStockMovements(); // Refresh the list
        setShowDeleteModal(false);
        setMovementToDelete(null);
        
        // Dashboard'ı güncelle
        window.dispatchEvent(new CustomEvent('productChanged'));
        
        // Stok hareketi silme event'ini tetikle
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        window.dispatchEvent(new CustomEvent('stockMovementChanged', {
          detail: {
            type: 'stock_movement',
            productName: movementToDelete.productName || 'Bilinmeyen Ürün',
            movementType: 'deleted',
            quantity: movementToDelete.quantity || 0,
            userName: currentUser.fullName || currentUser.username || 'Sistem',
            timestamp: new Date()
          }
        }));
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Stok hareketi silinirken hata oluştu', 'error');
      }
    } catch (err) {
      console.error('Stok hareketi silme hatası:', err);
      showToast('Stok hareketi silinirken hata oluştu: ' + err.message, 'error');
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setMovementToDelete(null);
  };

  // Calculate summary statistics from local data (fallback)
  const calculateSummaryStats = (movements, isFiltered = false) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Eğer movements array'i boşsa, undefined ise veya null ise, tüm değerleri 0 yap
    if (!movements || movements.length === 0) {
      if (!isFiltered) {
        // Sadece orijinal veri boşsa özet istatistikleri sıfırla
        setSummaryStats({
          totalIn: 0,
          totalOut: 0,
          netChange: 0,
          totalMovements: 0,
          monthlyIn: 0,
          monthlyOut: 0
        });
      }
      return;
    }

    const stats = movements.reduce((acc, movement) => {
      const movementDate = new Date(movement.movementDate);
      const isCurrentMonth = movementDate.getMonth() === currentMonth && 
                           movementDate.getFullYear() === currentYear;

      if (movement.movementType === 'in') {
        acc.totalIn += (movement.quantity ?? 0);
        if (isCurrentMonth) acc.monthlyIn += (movement.quantity ?? 0);
      } else if (movement.movementType === 'out') {
        acc.totalOut += (movement.quantity ?? 0);
        if (isCurrentMonth) acc.monthlyOut += (movement.quantity ?? 0);
      }

      return acc;
    }, { totalIn: 0, totalOut: 0, monthlyIn: 0, monthlyOut: 0 });

    stats.netChange = (stats.totalIn ?? 0) - (stats.totalOut ?? 0);
    stats.totalMovements = movements.length ?? 0;

    if (isFiltered) {
      // Filtrelenmiş veri için özet istatistikleri güncelle
      setSummaryStats(prev => ({
        ...prev,
        totalMovements: stats.totalMovements ?? 0
      }));
    } else {
      // Orijinal veri için tüm özet istatistikleri güncelle
      setSummaryStats({
        totalIn: stats.totalIn ?? 0,
        totalOut: stats.totalOut ?? 0,
        netChange: stats.netChange ?? 0,
        totalMovements: stats.totalMovements ?? 0,
        monthlyIn: stats.monthlyIn ?? 0,
        monthlyOut: stats.monthlyOut ?? 0
      });
    }
  };

  // Get user name by ID
  const getUserNameById = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.fullName : `Kullanıcı #${userId}`;
  };

  // Get product name by ID
  const getProductNameById = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : `Ürün #${productId}`;
  };

  // Filter movements based on search term, type, and date range
  useEffect(() => {
    let filtered = stockMovements;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(movement => 
        movement.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by movement type
    if (selectedType !== 'all') {
      filtered = filtered.filter(movement => movement.movementType === selectedType);
    }

    // Filter by date range
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      filtered = filtered.filter(movement => {
        const movementDate = new Date(movement.movementDate);
        return movementDate >= startDate && movementDate <= endDate;
      });
    }

    setFilteredMovements(filtered);
  }, [searchTerm, selectedType, dateRange, stockMovements]);

  // Format movement type for display
  const formatMovementType = (type) => {
    const types = {
      'in': { label: 'Stok Girişi', color: 'bg-green-100 text-green-800' },
      'out': { label: 'Stok Çıkışı', color: 'bg-red-100 text-red-800' },
      'transfer': { label: 'Transfer', color: 'bg-blue-100 text-blue-800' },
      'adjustment': { label: 'Düzeltme', color: 'bg-yellow-100 text-yellow-800' }
    };
    
    const typeInfo = types[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle type filter
  const handleTypeFilter = (e) => {
    setSelectedType(e.target.value);
  };

  // Handle date range filter
  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setDateRange({ start: '', end: '' });
  };

  useEffect(() => {
    fetchStockMovements();
    fetchSummaryStats(); // Fetch summary stats on mount
    fetchProducts();
    fetchUsers();
  }, []);

  // Stok hareketleri değiştiğinde özet istatistikleri güncelle (sadece filtreleme için)
  useEffect(() => {
    // Filtreleme sonrası özet istatistikleri güncelle
    if (filteredMovements.length !== stockMovements.length) {
      calculateSummaryStats(filteredMovements);
    }
  }, [filteredMovements, stockMovements.length]);

  return (
    <Layout>
      <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Stok Hareketleri</h1>
            <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Stok giriş ve çıkış işlemlerini takip edin
            </p>
            {error && (
              <p className="text-sm mt-1 text-red-600">
                {error}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Add Movement Button */}
            <button
              onClick={() => {
                localStorage.setItem('stockMovementsFormOpen', 'true');
                setShowAddForm(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Yeni Stok Hareketi Ekle
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ArrowUpIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Stok Girişi</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{summaryStats.totalIn || 0}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Bu ay: {summaryStats.monthlyIn || 0}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <ArrowDownIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Stok Çıkışı</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{summaryStats.totalOut || 0}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Bu ay: {summaryStats.monthlyOut || 0}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ArrowPathIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Net Stok Değişimi</p>
                <p className={`text-2xl font-bold ${(summaryStats.netChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(summaryStats.netChange || 0) >= 0 ? '+' : ''}{summaryStats.netChange || 0}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Bu ay: {(summaryStats.monthlyIn || 0) - (summaryStats.monthlyOut || 0)}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <ChartBarIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Hareket</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{summaryStats.totalMovements || 0}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Bu ay: {(summaryStats.monthlyIn || 0) + (summaryStats.monthlyOut || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Stock Movement Form */}
        {showAddForm && (
          <div className={`rounded-xl shadow-sm border-2 p-6 ${darkMode ? 'bg-gray-800 border-blue-600' : 'bg-white border-blue-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <PlusIcon className="h-5 w-5 mr-2 text-blue-600" />
                Yeni Stok Hareketi Ekle
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  localStorage.removeItem('stockMovementsFormOpen');
                  localStorage.removeItem('stockMovementsFormData');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Product Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Ürün *
                  </label>
                  <select
                    name="productId"
                    value={addFormData.productId}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="">Ürün seçin</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - Stok: {product.stockQuantity}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Movement Type */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Hareket Tipi *
                  </label>
                  <select
                    name="movementType"
                    value={addFormData.movementType}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="in">Stok Girişi</option>
                    <option value="out">Stok Çıkışı</option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Miktar *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={addFormData.quantity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Unit Price */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Birim Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    name="unitPrice"
                    value={addFormData.unitPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Notlar
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={addFormData.notes}
                    onChange={handleInputChange}
                    placeholder="Ek bilgiler..."
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    localStorage.removeItem('stockMovementsFormOpen');
                    localStorage.removeItem('stockMovementsFormData');
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    darkMode 
                      ? 'text-gray-300 bg-gray-700 border border-gray-600 hover:bg-gray-600' 
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Stok Hareketi Ekle
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Ürün, referans, not ara..."
                value={searchTerm}
                onChange={handleSearch}
                className={`pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={handleTypeFilter}
              className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="all">Tüm Hareketler</option>
              <option value="in">Stok Girişi</option>
              <option value="out">Stok Çıkışı</option>
              <option value="transfer">Transfer</option>
              <option value="adjustment">Düzeltme</option>
            </select>

            {/* Date Range Start */}
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />

            {/* Date Range End */}
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || selectedType !== 'all' || dateRange.start || dateRange.end) && (
            <div className="mt-4">
              <button
                onClick={clearFilters}
                className={`text-sm underline ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse">
                <div className={`h-4 rounded w-1/4 mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className="space-y-3">
                  <div className={`h-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  <div className={`h-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  <div className={`h-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                </div>
              </div>
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <ArrowPathIcon className="mx-auto h-12 w-12" />
              </div>
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Stok hareketi bulunamadı</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                {(() => {
                  console.log('🔍 Render - stockMovements.length:', stockMovements.length);
                  console.log('🔍 Render - filteredMovements.length:', filteredMovements.length);
                  console.log('🔍 Render - stockMovements:', stockMovements);
                  console.log('🔍 Render - filteredMovements:', filteredMovements);
                  return stockMovements.length === 0 ? 'Henüz stok hareketi eklenmemiş.' : 'Arama kriterlerinize uygun stok hareketi bulunamadı.';
                })()}
              </p>
            </div>
          ) : (
            <div className="w-full">
              <table className="w-full">
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>

                    <th className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/4 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Ürün Adı
                    </th>
                    <th className={`px-3 py-3 text-center text-xs font-medium uppercase tracking-wider w-20 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Tür
                    </th>
                    <th className={`px-3 py-3 text-center text-xs font-medium uppercase tracking-wider w-16 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Miktar
                    </th>
                    <th className={`px-3 py-3 text-center text-xs font-medium uppercase tracking-wider w-20 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Önceki
                    </th>
                    <th className={`px-3 py-3 text-center text-xs font-medium uppercase tracking-wider w-20 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Yeni
                    </th>
                    <th className={`px-3 py-3 text-center text-xs font-medium uppercase tracking-wider w-24 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Fiyat
                    </th>
                    <th className={`px-3 py-3 text-center text-xs font-medium uppercase tracking-wider w-20 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Notlar
                    </th>
                    <th className={`px-3 py-3 text-center text-xs font-medium uppercase tracking-wider w-28 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Tarih
                    </th>
                    <th className={`px-3 py-3 text-center text-xs font-medium uppercase tracking-wider w-24 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Kullanıcı
                    </th>
                    <th className={`px-3 py-3 text-center text-xs font-medium uppercase tracking-wider w-20 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                  {filteredMovements.map((movement) => (
                    <tr key={movement.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>

                      <td className={`px-3 py-3 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="truncate" title={movement.product?.name || getProductNameById(movement.productId)}>
                          {movement.product?.name || getProductNameById(movement.productId)}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {formatMovementType(movement.movementType)}
                      </td>
                      <td className={`px-3 py-3 text-center text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {movement.quantity}
                      </td>
                      <td className={`px-3 py-3 text-center text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {movement.previousStock}
                      </td>
                      <td className={`px-3 py-3 text-center text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {movement.newStock}
                      </td>
                      <td className={`px-3 py-3 text-center text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {movement.unitPrice ? `₺${movement.unitPrice.toFixed(2)}` : '-'}
                      </td>
                      <td className={`px-3 py-3 text-center text-xs ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="truncate" title={movement.notes || '-'}>
                          {movement.notes || '-'}
                        </div>
                      </td>
                      <td className={`px-3 py-3 text-center text-xs ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(movement.movementDate).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit'
                        })}
                      </td>
                      <td className={`px-3 py-3 text-center text-xs ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="truncate" title={movement.user?.FullName || getUserNameById(movement.userId)}>
                          {movement.user?.FullName || getUserNameById(movement.userId)}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => handleDeleteClick(movement)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Stok hareketini sil"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && movementToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg max-w-md w-full p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Stok Hareketini Sil</h3>
                </div>
              </div>
              
              <div className="mb-6">
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  <strong>"{getProductNameById(movementToDelete.productId)}"</strong> ürünü için stok hareketini silmek istediğinizden emin misiniz?
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

        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center">
              <span className="mr-2">
                {toast.type === 'success' ? '✅' : '❌'}
              </span>
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StockMovements;
