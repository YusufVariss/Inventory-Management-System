import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon, 
  TrashIcon, 
  ArrowPathIcon,
  CubeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  UserIcon,
  DocumentTextIcon,
  ClockIcon,
  TagIcon,
  InformationCircleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://localhost:5107';

const Returns = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [returns, setReturns] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [products, setProducts] = useState([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showAddPanel, setShowAddPanel] = useState(() => {
    return localStorage.getItem('returnsFormOpen') === 'true';
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingReturn, setEditingReturn] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReturnId, setDeleteReturnId] = useState(null);
  const [deleteReturnName, setDeleteReturnName] = useState('');

  // Mevcut kullanıcının rolünü al
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'Admin';
  const isManager = currentUser.role === 'manager' || currentUser.role === 'Yönetici';
  const canApproveReturns = isAdmin || isManager; // Sadece Admin ve Yöneticiler onaylayabilir

  // Toast mesaj fonksiyonu
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Onay modal fonksiyonu
  const showConfirmDialog = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  // Form verileri
  const [formData, setFormData] = useState(() => {
    const savedFormData = localStorage.getItem('returnsFormData');
    if (savedFormData) {
      return JSON.parse(savedFormData);
    }
    return {
      returnType: 'customer',
      productName: '',
      quantity: '',
      reason: '',
      status: 'pending',
      returnDate: '',
      processedDate: '',
      customerName: ''
    };
  });

  // Orijinal form verilerini takip et (düzenleme modu için)
  const [originalFormData, setOriginalFormData] = useState(null);

  // Form verilerinin değişip değişmediğini kontrol et
  const hasFormChanged = () => {
    if (!originalFormData || !editingReturn) return false;
    
    return (
      formData.returnType !== originalFormData.returnType ||
      formData.productName !== originalFormData.productName ||
      formData.quantity !== originalFormData.quantity ||
      formData.reason !== originalFormData.reason ||
      formData.status !== originalFormData.status ||
      formData.returnDate !== originalFormData.returnDate ||
      formData.processedDate !== originalFormData.processedDate ||
      formData.customerName !== originalFormData.customerName
    );
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // API response'u kontrol et ve array olarak set et
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray(data.data)) {
          setProducts(data.data);
        } else if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      }
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
    }
  };

  // Fetch returns from API
  const fetchReturns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Oturum bulunamadı');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/returns`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReturns(data);
        setFilteredReturns(data);
      } else {
        setError('İadeler yüklenirken hata oluştu');
      }
    } catch (err) {
      console.error('İade yükleme hatası:', err);
      setError('İadeler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary statistics
  const fetchSummaryStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;

      // Toplam iade sayısı
      const countResponse = await fetch(`${API_BASE_URL}/api/returns/count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Toplam iade tutarı
      const amountResponse = await fetch(`${API_BASE_URL}/api/returns/total-amount`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // En çok iade edilen ürünler
      const topReturnedResponse = await fetch(`${API_BASE_URL}/api/returns/top-returned/5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Bu ayki iadeler
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const monthlyResponse = await fetch(`${API_BASE_URL}/api/returns/date-range?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // İstatistikleri state'e kaydet
      if (countResponse.ok && amountResponse.ok && topReturnedResponse.ok && monthlyResponse.ok) {
        const count = await countResponse.json();
        const amount = await amountResponse.json();
        const topReturned = await topReturnedResponse.json();
        const monthly = await monthlyResponse.json();

        // İstatistikleri hesapla ve state'e kaydet
        setSummaryStats({
          totalReturns: count,
          totalAmount: amount,
          thisMonthReturns: monthly.length,
          mostReturnedProduct: topReturned.length > 0 ? topReturned[0] : null
        });
      }
    } catch (err) {
      console.error('Özet istatistikler yükleme hatası:', err);
    }
  };

  // Summary statistics state
  const [summaryStats, setSummaryStats] = useState({
    totalReturns: 0,
    totalAmount: 0,
    thisMonthReturns: 0,
    mostReturnedProduct: null
  });

  // Helper function to update form data and save to localStorage
  const updateFormData = (newData) => {
    const updatedData = { ...formData, ...newData };
    setFormData(updatedData);
    localStorage.setItem('returnsFormData', JSON.stringify(updatedData));
  };

  // Handle product name input with autocomplete
  const handleProductNameChange = (value) => {
    updateFormData({ productName: value });
    
    if (value.length > 0 && Array.isArray(products)) {
      const filtered = products.filter(product => 
        product.name && product.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(filtered);
      setShowProductSuggestions(true);
    } else {
      setShowProductSuggestions(false);
    }
  };

  // Select product from suggestions
  const selectProduct = (productName) => {
    updateFormData({ productName });
    setShowProductSuggestions(false);
  };

  // Filter returns based on product name only
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredReturns(returns);
    } else {
      const filtered = returns.filter(returnItem => 
        returnItem.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredReturns(filtered);
    }
  }, [searchTerm, returns]);

  // İade bildirimi tetikle
  const triggerReturnNotification = (newReturn) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Yöneticilere bildirim gönder
    const notification = {
      id: Date.now(),
      type: 'return_created',
      title: 'Yeni İade Talebi',
      message: `${currentUser.fullName || currentUser.name || 'Personel'} kullanıcısı "${newReturn.productName}" ürünü için ${newReturn.quantity} adet iade talebi oluşturdu.`,
      return: newReturn,
      createdBy: currentUser,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'high'
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.productName || !formData.productName.trim()) {
      alert('Lütfen ürün seçin');
      return;
    }
    
    if (!formData.quantity || parseInt(formData.quantity) < 1) {
      alert('Lütfen geçerli bir miktar girin (minimum 1)');
      return;
    }
    
    if (!formData.reason || !formData.reason.trim()) {
      alert('Lütfen iade nedenini girin');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const dataToSend = {
        id: editingReturn ? editingReturn.id : undefined, // Güncelleme için ID gerekli
        returnType: formData.returnType,
        productName: formData.productName || '',
        quantity: parseInt(formData.quantity) || 1, // Minimum 1 olmalı
        reason: formData.reason,
        status: formData.status,
        // amount backend'de otomatik hesaplanacak (miktar × ürün fiyatı)
        returnDate: formData.returnDate ? new Date(formData.returnDate).toISOString() : new Date().toISOString(),
        processedDate: formData.processedDate ? new Date(formData.processedDate).toISOString() : null,
        customerName: formData.customerName,
        userFullName: currentUser.fullName || currentUser.username || 'Bilinmeyen Kullanıcı'
      };

      console.log('Gönderilen veri:', dataToSend);
      console.log('ProductName:', dataToSend.productName);

      if (editingReturn) {
        // Update return
        const response = await fetch(`${API_BASE_URL}/api/returns/${editingReturn.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
          const updatedReturn = await response.json();
          const updatedReturns = returns.map(ret => 
            ret.id === editingReturn.id ? updatedReturn : ret
          );
          setReturns(updatedReturns);
          setEditingReturn(null);
          setError('✅ İade başarıyla güncellendi!');
        } else {
          const errorData = await response.text();
          console.error('Güncelleme hatası:', errorData);
          setError(`İade güncellenirken hata oluştu: ${errorData}`);
        }
      } else {
        // Create new return
        const response = await fetch(`${API_BASE_URL}/api/returns`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
          const newReturn = await response.json();
          console.log('Oluşturulan iade:', newReturn);
          console.log('Oluşturulan iade ProductName:', newReturn.productName);
          const updatedReturns = [...returns, newReturn];
          setReturns(updatedReturns);
          setError('✅ İade başarıyla eklendi!');
          
          // Yöneticilere bildirim gönder
          triggerReturnNotification(newReturn);
        } else {
          setError('İade eklenirken hata oluştu');
        }
      }
      
      // Clear form and close panel
      setFormData({
        returnType: 'customer',
        productName: '',
        quantity: '',
        reason: '',
        status: 'pending',
        returnDate: '',
        processedDate: '',
        customerName: ''
      });
      setOriginalFormData(null); // Orijinal verileri temizle
      setShowAddPanel(false);
      localStorage.removeItem('returnsFormOpen');
      localStorage.removeItem('returnsFormData');
      
      // Refresh data
      fetchReturns();
      fetchSummaryStats();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
      
    } catch (err) {
      console.error('İade işlemi hatası:', err);
      setError('İade işlemi sırasında hata oluştu');
    }
  };

  // Handle edit
  const handleEdit = (returnItem) => {
    setEditingReturn(returnItem);
    const editFormData = {
      returnType: returnItem.returnType,
      productName: returnItem.productName || '',
      quantity: returnItem.quantity.toString(),
      reason: returnItem.reason,
      status: returnItem.status,
      returnDate: returnItem.returnDate ? returnItem.returnDate.split('T')[0] : '',
      processedDate: returnItem.processedDate ? returnItem.processedDate.split('T')[0] : '',
      customerName: returnItem.customerName || ''
    };
    setFormData(editFormData);
    setOriginalFormData({ ...editFormData }); // Orijinal verileri sakla
    localStorage.setItem('returnsFormData', JSON.stringify(editFormData));
    localStorage.setItem('returnsFormOpen', 'true');
    setShowAddPanel(true);
  };

  // Handle delete modal
  const handleDeleteClick = (returnId, productName) => {
    setDeleteReturnId(returnId);
    setDeleteReturnName(productName);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteReturnId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/returns/${deleteReturnId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedReturns = returns.filter(ret => ret.id !== deleteReturnId);
        setReturns(updatedReturns);
        setFilteredReturns(updatedReturns);
        showToast('✅ İade başarıyla silindi!', 'success');
        
        // Refresh data
        fetchSummaryStats();
      } else {
        showToast('İade silinirken hata oluştu', 'error');
      }
    } catch (err) {
      console.error('İade silme hatası:', err);
      showToast('İade silinirken hata oluştu', 'error');
    } finally {
      setShowDeleteModal(false);
      setDeleteReturnId(null);
      setDeleteReturnName('');
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteReturnId(null);
    setDeleteReturnName('');
  };

  // Handle approve return
  const handleApproveReturn = async (returnId) => {
    showConfirmDialog('Bu iadeyi onaylamak istediğinizden emin misiniz?', async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/returns/${returnId}/approve`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Update the return status in the list
          const updatedReturns = returns.map(ret => 
            ret.id === returnId ? { ...ret, status: 'approved' } : ret
          );
          setReturns(updatedReturns);
          
          // Update selected return if it's the same one
          if (selectedReturn && selectedReturn.id === returnId) {
            setSelectedReturn({ ...selectedReturn, status: 'approved' });
          }
          
          showToast('İade onaylandı ve stoktan düşüldü!', 'success');
          
          // Refresh data
          fetchSummaryStats();
        } else {
          showToast('İade onaylanamadı!', 'error');
        }
      } catch (err) {
        console.error('İade onaylama hatası:', err);
        showToast('İade onaylanamadı!', 'error');
      }
    });
  };

  // Handle reject return
  const handleRejectReturn = async (returnId) => {
    showConfirmDialog('Bu iadeyi reddetmek istediğinizden emin misiniz?', async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/returns/${returnId}/reject`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Update the return status in the list
          const updatedReturns = returns.map(ret => 
            ret.id === returnId ? { ...ret, status: 'rejected' } : ret
          );
          setReturns(updatedReturns);
          
          // Update selected return if it's the same one
          if (selectedReturn && selectedReturn.id === returnId) {
            setSelectedReturn({ ...selectedReturn, status: 'rejected' });
          }
          
          showToast('İade reddedildi!', 'success');
          
          // Refresh data
          fetchSummaryStats();
        } else {
          showToast('İade reddedilemedi!', 'error');
        }
      } catch (err) {
        console.error('İade reddetme hatası:', err);
        showToast('İade reddedilemedi!', 'error');
      }
    });
  };

  // Handle view details
  const handleViewDetails = (returnItem) => {
    setSelectedReturn(returnItem);
    setShowDetailModal(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get reason color
  const getReasonColor = (reason) => {
    switch (reason) {
      case 'Arızalı': return 'bg-red-100 text-red-800';
      case 'Yanlış Ürün': return 'bg-orange-100 text-orange-800';
      case 'Eksik Parça': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date (only date, no time)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    // If it's already in YYYY-MM-DD format, use it directly
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Load data on component mount
  useEffect(() => {
    fetchReturns();
    fetchProducts();
    fetchSummaryStats();
  }, []);

  return (
    <Layout>
      <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>İade İşlemleri</h1>
            <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Müşteri iade işlemlerini yönetin ve takip edin
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
            {/* Add Return Button */}
            <button
              onClick={() => {
                setShowAddPanel(true);
                setEditingReturn(null);
                const newFormData = {
                  returnType: 'customer',
                  productName: '',
                  quantity: '',
                  reason: '',
                  status: 'pending',
                  amount: '',
                  returnDate: '',
                  processedDate: '',
                  customerName: ''
                };
                setFormData(newFormData);
                localStorage.setItem('returnsFormData', JSON.stringify(newFormData));
                localStorage.setItem('returnsFormOpen', 'true');
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Yeni İade Ekle
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ArrowPathIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam İade Sayısı</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{summaryStats.totalReturns}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam İade Tutarı</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>₺{summaryStats.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CalendarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Bu Ayki İadeler</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{summaryStats.thisMonthReturns}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>En Çok İade Gelen Ürün</p>
                {summaryStats.mostReturnedProduct ? (
                  <>
                    <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {summaryStats.mostReturnedProduct.productName || 'Bilinmeyen Ürün'}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      {summaryStats.mostReturnedProduct.quantity || 0} adet
                    </p>
                  </>
                ) : (
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Veri yok</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Yeni İade Ekleme Paneli */}
        {showAddPanel && (
          <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <PlusIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingReturn ? 'İade Düzenle' : 'Yeni İade Ekle'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddPanel(false);
                  localStorage.removeItem('returnsFormOpen');
                  localStorage.removeItem('returnsFormData');
                }}
                className={`transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    İade Tipi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.returnType}
                    onChange={(e) => updateFormData({ returnType: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    required
                  >
                    <option value="customer">Müşteri İadesi</option>
                    <option value="supplier">Tedarikçi İadesi</option>
                  </select>
                </div>

                <div className="relative">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Ürün Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => handleProductNameChange(e.target.value)}
                    onFocus={() => {
                      if (formData.productName.length > 0) {
                        setShowProductSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay hiding suggestions to allow clicking on them
                      setTimeout(() => setShowProductSuggestions(false), 200);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    placeholder="Ürün adını yazın veya seçin"
                    required
                  />
                  
                  {/* Product Suggestions Dropdown */}
                  {showProductSuggestions && Array.isArray(filteredProducts) && filteredProducts.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredProducts.map((product, index) => (
                        <div
                          key={product.id || index}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => selectProduct(product.name)}
                        >
                          <div className="font-medium text-gray-900">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-500 truncate">{product.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>



                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Miktar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => updateFormData({ quantity: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    İade Nedeni <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.reason}
                    onChange={(e) => updateFormData({ reason: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    required
                  >
                    <option value="">Neden seçin</option>
                    <option value="Arızalı">Arızalı</option>
                    <option value="Yanlış Ürün">Yanlış Ürün</option>
                    <option value="Eksik Parça">Eksik Parça</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>





                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Müşteri Adı
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => updateFormData({ customerName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    placeholder="Müşteri adını girin"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    İade Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.returnDate}
                    onChange={(e) => updateFormData({ returnDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    İşlem Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.processedDate}
                    onChange={(e) => updateFormData({ processedDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>


              </div>



              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPanel(false);
                    setOriginalFormData(null); // Orijinal verileri temizle
                    localStorage.removeItem('returnsFormOpen');
                    localStorage.removeItem('returnsFormData');
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${darkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={editingReturn && !hasFormChanged()}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    editingReturn && !hasFormChanged()
                      ? `cursor-not-allowed ${darkMode ? 'text-gray-500 bg-gray-600' : 'text-gray-400 bg-gray-300'}`
                      : 'text-white bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {editingReturn ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        )}



        {/* Main Content */}
        <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                İade Listesi
              </h3>
              
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Ürün adı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                />
              </div>
            </div>
          </div>
          
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
          ) : filteredReturns.length === 0 ? (
            <div className="text-center py-12">
              <div className={`mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <ArrowPathIcon className="mx-auto h-12 w-12" />
              </div>
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>İade bulunamadı</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                {searchTerm 
                  ? `"${searchTerm}" ürün adına sahip iade bulunamadı.` 
                  : 'Henüz iade kaydı eklenmemiş.'}
              </p>
            </div>
          ) : (
            <div className="overflow-y-auto overflow-x-hidden">
              <table className={`w-full table-fixed divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`w-16 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>ID</th>
                    <th className={`w-28 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>İade Tipi</th>
                    <th className={`w-40 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Ürün Adı</th>
                    <th className={`w-20 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Miktar</th>
                    <th className={`w-32 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Neden</th>
                    <th className={`w-28 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Tutar</th>
                    <th className={`w-32 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Müşteri</th>
                    <th className={`w-32 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Kullanıcı</th>
                    <th className={`w-28 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Durum</th>
                    <th className={`w-28 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>İşlemler</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                  {filteredReturns.map((returnItem) => (
                    <tr key={returnItem.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <td className={`px-3 py-4 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>#{returnItem.id}</td>
                      <td className={`px-3 py-4 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {returnItem.returnType === 'customer' ? 'Müşteri' : 'Tedarikçi'}
                      </td>
                      <td className={`px-3 py-4 text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`} title={returnItem.productName || '-'}>
                        {returnItem.productName || '-'}
                      </td>
                      <td className={`pl-1 pr-3 py-4 text-sm text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>{returnItem.quantity}</td>
                      <td className={`px-3 py-4 text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`} title={returnItem.reason || '-'}>
                        {returnItem.reason || '-'}
                      </td>
                      <td className={`px-3 py-4 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ₺{(returnItem.amount || 0).toLocaleString()}
                      </td>
                      <td className={`px-3 py-4 text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`} title={returnItem.customerName || '-'}>
                        {returnItem.customerName || '-'}
                      </td>
                      <td className={`pl-1 pr-3 py-4 text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`} title={returnItem.userFullName || '-'}>
                        {returnItem.userFullName || '-'}
                      </td>
                      <td className="px-3 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(returnItem.status)}`}>
                          {returnItem.status === 'pending' && 'Beklemede'}
                          {returnItem.status === 'approved' && 'Onaylandı'}
                          {returnItem.status === 'completed' && 'Tamamlandı'}
                          {returnItem.status === 'rejected' && 'Reddedildi'}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleViewDetails(returnItem)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Detay Görüntüle"
                          >
                            <InformationCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(returnItem.id, returnItem.productName)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Sil"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>



        {/* Detail Modal */}
        {showDetailModal && selectedReturn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <InformationCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
                    İade Detayları
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className={`transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Header Info */}
                  <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CubeIcon className="h-8 w-8 text-gray-600 mr-3" />
                        <div>
                          <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedReturn.productName || 'Bilinmeyen Ürün'}
                          </h4>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>İade ID: #{selectedReturn.id}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedReturn.status)}`}>
                        {selectedReturn.status === 'pending' && 'Beklemede'}
                        {selectedReturn.status === 'approved' && 'Onaylandı'}
                        {selectedReturn.status === 'completed' && 'Tamamlandı'}
                        {selectedReturn.status === 'rejected' && 'Reddedildi'}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Miktar</label>
                        <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedReturn.quantity}</p>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>İade Tutarı</label>
                        <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>₺{(selectedReturn.amount || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>İade Tarihi</label>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedReturn.returnDate ? formatDate(selectedReturn.returnDate) : '-'}</p>
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>İşlem Tarihi</label>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedReturn.processedDate ? formatDate(selectedReturn.processedDate) : '-'}</p>
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>İade Tipi</label>
                        <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedReturn.returnType === 'customer' ? 'Müşteri İadesi' : 'Tedarikçi İadesi'}
                        </p>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Ürün Adı</label>
                        <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedReturn.productName || '-'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          Müşteri Adı
                        </label>
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedReturn.customerName || 'Bilinmeyen Müşteri'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>İade Nedeni</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReasonColor(selectedReturn.reason)}`}>
                          {selectedReturn.reason}
                        </span>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Kullanıcı</label>
                        <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedReturn.userFullName || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={`border-t pt-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setShowDetailModal(false);
                          handleEdit(selectedReturn);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 flex items-center"
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Düzenle
                      </button>
                      {canApproveReturns && (
                        <>
                          <button
                            onClick={() => handleApproveReturn(selectedReturn.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                              selectedReturn.status === 'pending'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            }`}
                            disabled={selectedReturn.status !== 'pending'}
                          >
                            Onayla
                          </button>
                          <button
                            onClick={() => handleRejectReturn(selectedReturn.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                              selectedReturn.status === 'pending'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            }`}
                            disabled={selectedReturn.status !== 'pending'}
                          >
                            Reddet
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setShowDetailModal(false)}
                        className={`px-4 py-2 border text-sm font-medium rounded-md transition-colors ${darkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
                      >
                        Kapat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onay Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-xl w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Onay Gerekli</h3>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{confirmMessage}</p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleCancel}
                    className={`px-4 py-2 border text-sm font-medium rounded-md transition-colors ${darkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 bg-blue-600 text-sm font-medium rounded-md text-white hover:bg-blue-700"
                  >
                    Onayla
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Silme Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-xl w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>İade Sil</h3>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    <strong>{deleteReturnName}</strong> ürününe ait iade kaydını silmek istediğinizden emin misiniz?
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ Bu işlem geri alınamaz!
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleDeleteCancel}
                    className={`px-4 py-2 border text-sm font-medium rounded-md transition-colors ${darkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-4 py-2 bg-red-600 text-sm font-medium rounded-md text-white hover:bg-red-700"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Mesaj */}
        {toast.show && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${
            toast.type === 'success' 
              ? (darkMode ? 'bg-green-900 border border-green-700 text-green-200' : 'bg-green-100 border border-green-200 text-green-800')
              : (darkMode ? 'bg-red-900 border border-red-700 text-red-200' : 'bg-red-100 border border-red-200 text-red-800')
          }`}>
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Returns;
