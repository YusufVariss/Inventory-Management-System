import Layout from './Layout';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ArrowsRightLeftIcon,
  FolderIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckIcon,
  XMarkIcon,
  UsersIcon,
  CheckCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const Reports = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  // Get current user info
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'Admin';
  const isManager = currentUser.role === 'manager' || currentUser.role === 'Yönetici';
  const isStaff = currentUser.role === 'Personel';
  const canViewAllReports = isAdmin || isManager;

  const [selectedReport, setSelectedReport] = useState(null);
  
  // Stok Hareketleri için state'ler
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 gün önce
    endDate: new Date().toISOString().split('T')[0] // Bugün
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [movementType, setMovementType] = useState('all');

  // Kategori Raporu için state'ler
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, productCount, totalValue
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  
  // Ürünler için state (toplam değer hesaplaması için)
  const [products, setProducts] = useState([]);

  // Kritik Stok Raporu için state'ler
  const [criticalProducts, setCriticalProducts] = useState([]);
  const [criticalLoading, setCriticalLoading] = useState(false);
  const [criticalSearchTerm, setCriticalSearchTerm] = useState('');
  const [criticalSortBy, setCriticalSortBy] = useState('stockQuantity'); // stockQuantity, name, requiredQuantity
  const [criticalSortOrder, setCriticalSortOrder] = useState('asc'); // asc, desc
  const [criticalFilterStatus, setCriticalFilterStatus] = useState('all'); // all, out-of-stock, critical, low

  // Ürünler Raporu için state'ler
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsSearchTerm, setProductsSearchTerm] = useState('');
  const [productsSortBy, setProductsSortBy] = useState('name'); // name, stockQuantity, price, categoryName, createdAt
  const [productsSortOrder, setProductsSortOrder] = useState('asc'); // asc, desc
  const [productsFilterCategory, setProductsFilterCategory] = useState('all'); // all, categoryId
  const [productsFilterStatus, setProductsFilterStatus] = useState('all'); // all, active, inactive
  const [productsFilterStock, setProductsFilterStock] = useState('all'); // all, in-stock, out-of-stock, low-stock

  // İadeler Raporu için state'ler
  const [returns, setReturns] = useState([]);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [returnsSearchTerm, setReturnsSearchTerm] = useState('');
  const [returnsSortBy, setReturnsSortBy] = useState('returnDate'); // returnDate, productName, quantity, status, returnType
  const [returnsSortOrder, setReturnsSortOrder] = useState('desc'); // asc, desc
  const [returnsFilterStatus, setReturnsFilterStatus] = useState('all'); // all, pending, approved, completed, rejected
  const [returnsFilterType, setReturnsFilterType] = useState('all'); // all, customer, supplier
  const [returnsDateRange, setReturnsDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 gün önce
    endDate: new Date().toISOString().split('T')[0] // Bugün
  });

  // Ajanda Raporu için state'ler
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsSearchTerm, setEventsSearchTerm] = useState('');
  const [eventsSortBy, setEventsSortBy] = useState('agendaDate'); // agendaDate, title, priority, status, createdAt
  const [eventsSortOrder, setEventsSortOrder] = useState('desc'); // asc, desc
  const [eventsFilterStatus, setEventsFilterStatus] = useState('all'); // all, pending, approved, completed, cancelled
  const [eventsFilterPriority, setEventsFilterPriority] = useState('all'); // all, low, medium, high
  const [eventsDateRange, setEventsDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 gün önce
    endDate: new Date().toISOString().split('T')[0] // Bugün
  });

  // Kullanıcılar Raporu için state'ler
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSearchTerm, setUsersSearchTerm] = useState('');
  const [usersFilterRole, setUsersFilterRole] = useState('all'); // all, admin, user, manager
  const [usersDateRange, setUsersDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 gün önce
    endDate: new Date().toISOString().split('T')[0] // Bugün
  });

  // Son Hareketler Raporu için state'ler
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentActivitiesLoading, setRecentActivitiesLoading] = useState(false);
  const [recentActivitiesSearchTerm, setRecentActivitiesSearchTerm] = useState('');
  const [recentActivitiesFilterType, setRecentActivitiesFilterType] = useState('all'); // all, stock, product, category, user, return, event
  const [recentActivitiesFilterUser, setRecentActivitiesFilterUser] = useState('all'); // all, userId
  const [recentActivitiesDateRange, setRecentActivitiesDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 gün önce
    endDate: new Date().toISOString().split('T')[0] // Bugün
  });
  const [recentActivitiesSortBy, setRecentActivitiesSortBy] = useState('timestamp'); // timestamp, type, user, action
  const [recentActivitiesSortOrder, setRecentActivitiesSortOrder] = useState('desc'); // asc, desc

    // İadeleri çek
  const fetchReturns = async () => {
    try {
      setReturnsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Token bulunamadı');
        setReturns([]);
        return;
      }
  
      console.log('İadeler çekiliyor...');
      const response = await fetch('/api/returns', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('İadeler yüklendi:', data);
        setReturns(data);
      } else {
        console.error('İadeler yüklenemedi:', response.status, response.statusText);
        setReturns([]);
      }
    } catch (error) {
      console.error('İadeler yükleme hatası:', error);
      setReturns([]);
    } finally {
      setReturnsLoading(false);
    }
  };

  // Kullanıcıları çek
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Token bulunamadı');
        setUsers([]);
        return;
      }
  
      console.log('Kullanıcılar çekiliyor...');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Kullanıcılar yüklendi:', data);
        
        // Rol sırasına göre sırala: Admin -> Yönetici -> Personel (kullanıcılar sayfası ile aynı)
        const sortedUsers = data.sort((a, b) => {
          const roleOrder = { 'Admin': 1, 'Yönetici': 2, 'Personel': 3 };
          const aOrder = roleOrder[a.role] || 4;
          const bOrder = roleOrder[b.role] || 4;
          return aOrder - bOrder;
        });
        
        setUsers(sortedUsers);
      } else {
        console.error('Kullanıcılar yüklenemedi:', response.status, response.statusText);
        setUsers([]);
      }
    } catch (error) {
      console.error('Kullanıcılar yükleme hatası:', error);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // Son hareketleri çek
  const fetchRecentActivities = async () => {
    try {
      setRecentActivitiesLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Token bulunamadı');
        setRecentActivities([]);
        setRecentActivitiesLoading(false);
        return;
      }

      console.log('Son hareketler çekiliyor...');

      // Audit log'lardan veri çek (ana sayfadaki gibi)
      try {
        const auditResponse = await fetch('/api/AuditLogs', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Audit response status:', auditResponse.status);

        if (auditResponse.ok) {
          const auditData = await auditResponse.json();
          console.log('Audit logs loaded:', auditData);

          if (!auditData || !Array.isArray(auditData)) {
            console.warn('Audit data array değil veya boş:', auditData);
            setRecentActivities([]);
            return;
          }

          // Audit log'ları aktivite formatına çevir
          const allAuditActivities = auditData.map(log => {
            console.log('Processing log:', log); // Debug için
            
            const userName = log.user?.fullName || log.user?.FullName || log.user?.name || log.user?.username || 'Bilinmeyen Kullanıcı';
            
            // Aktivite tipini belirle
            let activityType = '';
            let activityDescription = '';
            
            if (log.action === 'LOGIN') {
              activityType = 'login';
              activityDescription = 'sisteme giriş yaptı';
            } else if (log.action === 'LOGOUT') {
              activityType = 'logout';
              activityDescription = 'sistemden çıkış yaptı';
            } else if (log.action === 'INSERT' && log.tableName === 'Products') {
              activityType = 'product_added';
              activityDescription = `"${log.entityName}" ürününü ekledi`;
            } else if (log.action === 'UPDATE' && log.tableName === 'Products') {
              activityType = 'product_updated';
              activityDescription = `"${log.entityName}" ürününü güncelledi`;
            } else if (log.action === 'DELETE' && log.tableName === 'Products') {
              activityType = 'product_deleted';
              activityDescription = `"${log.entityName}" ürününü sildi`;
            } else if (log.tableName === 'StockMovements') {
              activityType = 'stock_movement';
              activityDescription = log.details || 'stok hareketi gerçekleştirdi';
            console.log('Log action:', log.action, 'tableName:', log.tableName); // Debug için
            
            } else if (log.action === 'INSERT' && log.tableName === 'Sales') {
              activityType = 'sale';
              activityDescription = `"${log.entityName}" ürününden satış yaptı`;
            } else if (log.action === 'INSERT' && log.tableName === 'Returns') {
              activityType = 'return';
              activityDescription = `"${log.entityName}" ürününden iade aldı`;
            } else if (log.action === 'INSERT' && log.tableName === 'Events') {
              activityType = 'event';
              activityDescription = `"${log.title || log.entityName}" olayını ekledi`;
            } else if (log.action === 'INSERT' && log.tableName === 'Categories') {
              activityType = 'category';
              activityDescription = `"${log.entityName}" kategorisini ekledi`;
            } else if (log.action === 'INSERT' && log.tableName === 'Users') {
              activityType = 'user';
              activityDescription = `"${log.entityName}" kullanıcısını ekledi`;
            } else {
              activityType = log.action.toLowerCase();
              activityDescription = log.details || `${log.action} işlemi gerçekleştirdi`;
            }
            
            return {
              id: `${activityType}_${log.id}_${log.timestamp}_${Math.random().toString(36).substr(2, 9)}`,
              type: activityType,
              user: userName,
              date: new Date(log.timestamp).toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              timestamp: new Date(log.timestamp),
              description: activityDescription,
              status: 'completed',
              product: log.entityName || log.tableName,
              details: log
            };
          });

          console.log('All Audit Activities:', allAuditActivities);
          
          // Tüm audit aktivitelerini recentActivities'e ekle
          setRecentActivities(allAuditActivities);
        } else {
          console.error('Audit response not ok:', auditResponse.status, auditResponse.statusText);
          setRecentActivities([]);
        }
      } catch (auditError) {
        console.error('Audit logs fetch error:', auditError);
        setRecentActivities([]);
      }

    } catch (error) {
      console.error('Son hareketler yükleme hatası:', error);
      setRecentActivities([]);
    } finally {
      setRecentActivitiesLoading(false);
    }
  };

  // Ajanda etkinliklerini çek
  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Token bulunamadı');
        setEvents([]);
        return;
      }

      console.log('Ajanda etkinlikleri çekiliyor...');
      const response = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Ajanda etkinlikleri yüklendi:', data);
        setEvents(data);
      } else {
        console.error('Ajanda etkinlikleri yüklenemedi:', response.status, response.statusText);
        setEvents([]);
      }
    } catch (error) {
      console.error('Ajanda etkinlikleri yükleme hatası:', error);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  // Dark mode değişikliklerini localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Stok hareketlerini çek
  const fetchStockMovements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Token bulunamadı');
        return;
      }

      const response = await fetch('/api/stockmovements', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStockMovements(data);
      } else {
        console.error('Stok hareketleri yüklenemedi');
      }
    } catch (error) {
      console.error('Stok hareketleri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ürünleri çek (toplam değer hesaplaması için)
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Token bulunamadı');
        setProducts([]);
        return;
      }

      console.log('Ürünler çekiliyor...');
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const apiResponse = await response.json();
        if (apiResponse.success) {
          console.log('Ürünler yüklendi:', apiResponse.data);
          setProducts(apiResponse.data);
        } else {
          console.warn('API\'den gelen ürün verisi başarısız:', apiResponse);
          setProducts([]);
        }
      } else {
        console.error('Ürünler yüklenemedi:', response.status, response.statusText);
        setProducts([]);
      }
    } catch (error) {
      console.error('Ürünler yükleme hatası:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // Kategorileri çek (kategoriler sayfasındaki endpoint'ten)
  const fetchCategories = async () => {
    try {
      setCategoryLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Token bulunamadı');
        setCategories([]); // Boş array olarak ayarla
        return;
      }

      console.log('Kategoriler kategoriler sayfasından çekiliyor...');
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Kategoriler kategoriler sayfasından yüklendi:', data);
        
        // Data validation - array değilse boş array olarak ayarla
        if (data && Array.isArray(data)) {
          // CategoryDto formatını CategoryStatsDto formatına dönüştür
          const convertedData = data.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            color: category.color,
            createdAt: category.createdAt,
            productCount: category.productCount || 0,
            totalValue: 0, // Şimdi ürünlerden hesaplanacak
            status: (category.productCount || 0) > 0 ? 'Aktif' : 'Pasif'
          }));
          setCategories(convertedData);
        } else {
          console.warn('API\'den gelen kategori verisi array değil:', data);
          setCategories([]);
        }
      } else {
        console.error('Kategoriler yüklenemedi:', response.status, response.statusText);
        setCategories([]); // Hata durumunda boş array
      }
    } catch (error) {
      console.error('Kategoriler yükleme hatası:', error);
      setCategories([]); // Hata durumunda boş array
    } finally {
      setCategoryLoading(false);
    }
  };

  // Kritik stok ürünlerini çek (ana sayfadaki endpoint'ten)
  const fetchCriticalStockProducts = async () => {
    try {
      setCriticalLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Token bulunamadı');
        setCriticalProducts([]);
        return;
      }

      console.log('Kritik stok ürünleri ana sayfadan çekiliyor...');
      const response = await fetch('/api/dashboard/critical-stock', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Kritik stok ürünleri ana sayfadan yüklendi:', data);
        
        if (data && Array.isArray(data)) {
          // Ana sayfadaki veri formatını CriticalStockDto formatına dönüştür
          const convertedData = data.map(item => ({
            id: item.id,
            name: item.name,
            description: '',
            categoryId: 0,
            categoryName: item.category,
            price: 0,
            stockQuantity: item.currentStock,
            criticalStockLevel: item.minStock,
            reorderPoint: item.minStock * 2,
            requiredQuantity: Math.max(0, item.minStock - item.currentStock),
            totalValue: 0,
            stockStatus: item.currentStock === 0 ? 'Stok Tükendi' : 
                         item.currentStock <= 5 ? 'Kritik Seviye' : 'Düşük Stok',
            lastStockMovement: new Date(),
            isActive: true
          }));
          setCriticalProducts(convertedData);
        } else {
          console.warn('API\'den gelen kritik stok verisi array değil:', data);
          setCriticalProducts([]);
        }
      } else {
        console.error('Kritik stok ürünleri yüklenemedi:', response.status, response.statusText);
        setCriticalProducts([]);
      }
    } catch (error) {
      console.error('Kritik stok ürünleri yükleme hatası:', error);
      setCriticalProducts([]);
    } finally {
      setCriticalLoading(false);
    }
  };



  // Rapor seç
  const handleReportSelect = (reportType) => {
    setSelectedReport(reportType);
    
    if (reportType === 'stock-movements') {
      fetchStockMovements();
    } else if (reportType === 'category') {
      fetchCategories();
      fetchProducts(); // Ürünleri de çek (toplam değer hesaplaması için)
    } else if (reportType === 'critical-stock') {
      fetchCriticalStockProducts();
    } else if (reportType === 'products') {
      fetchProducts(); // Ürünleri çek
      fetchCategories(); // Kategorileri de çek (filtre için)
    } else if (reportType === 'returns') {
      fetchReturns(); // İadeleri çek
    } else if (reportType === 'agenda') {
      fetchEvents(); // Ajanda etkinliklerini çek
    } else if (reportType === 'users') {
      fetchUsers(); // Kullanıcıları çek
    } else if (reportType === 'recent-activities') {
      fetchRecentActivities(); // Son hareketleri çek
    } else if (reportType === 'z-report') {
      fetchAllDataForZReport(); // Z Raporu için tüm verileri çek
    }
  };

  // Geri dön
  const handleBack = () => {
    setSelectedReport(null);
    setStockMovements([]);
    setProducts([]);
    setCategories([]);
    setCriticalProducts([]);
    setReturns([]);
    setEvents([]);
    setUsers([]);
    setRecentActivities([]);
  };

  // Filtrelenmiş stok hareketleri
  const filteredStockMovements = stockMovements.filter(movement => {
    const matchesSearch = movement.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = movementType === 'all' || movement.movementType === movementType;
    const matchesDate = new Date(movement.movementDate) >= new Date(dateRange.startDate) &&
                       new Date(movement.movementDate) <= new Date(dateRange.endDate);
    
    return matchesSearch && matchesType && matchesDate;
  });

  // Filtrelenmiş ve sıralanmış kategoriler
  const filteredAndSortedCategories = (() => {
    try {
      console.log('Kategoriler filtreleniyor ve sıralanıyor...');
      console.log('Categories:', categories);
      
      if (!categories || !Array.isArray(categories)) {
        console.warn('Categories array bulunamadı veya geçersiz');
        return [];
      }
      
      return categories
        .filter(category => 
          category.name?.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
          category.description?.toLowerCase().includes(categorySearchTerm.toLowerCase())
        )
                 .sort((a, b) => {
           try {
             let aValue, bValue;
             
                           switch (sortBy) {
                case 'name':
                  aValue = a.name || '';
                  bValue = b.name || '';
                  break;
                case 'productCount':
                  aValue = a.productCount || 0;
                  bValue = b.productCount || 0;
                  break;
                case 'totalValue':
                  // Toplam değeri ürünlerden hesapla
                  const aTotalValue = products
                    .filter(product => product.categoryId === a.id)
                    .reduce((sum, product) => {
                      const stock = product.stockQuantity || 0;
                      const price = product.price || 0;
                      return sum + (stock * price);
                    }, 0);
                  const bTotalValue = products
                    .filter(product => product.categoryId === b.id)
                    .reduce((sum, product) => {
                      const stock = product.stockQuantity || 0;
                      const price = product.price || 0;
                      return sum + (stock * price);
                    }, 0);
                  aValue = aTotalValue;
                  bValue = bTotalValue;
                  break;
                default:
                  aValue = a.name || '';
                  bValue = b.name || '';
              }
             
             if (sortOrder === 'asc') {
               return aValue > bValue ? 1 : -1;
             } else {
               return aValue < bValue ? 1 : -1;
             }
           } catch (error) {
             console.error('Sıralama hatası:', error);
             return 0;
           }
         });
    } catch (error) {
      console.error('Kategori filtreleme hatası:', error);
      return [];
    }
  })();

  // Kategori istatistikleri
  const getCategoryStats = () => {
    try {
      console.log('Kategori istatistikleri hesaplanıyor...');
      console.log('Categories:', categories);
      console.log('Products:', products);
      
      const totalCategories = categories?.length || 0;
      const totalProducts = categories?.reduce((sum, cat) => sum + (cat.productCount || 0), 0) || 0;
      
      // Toplam değeri ürünlerden hesapla (stok * fiyat)
      let totalValue = 0;
      if (products && Array.isArray(products)) {
        totalValue = products.reduce((sum, product) => {
          const stock = product.stockQuantity || 0;
          const price = product.price || 0;
          return sum + (stock * price);
        }, 0);
      }
      
      const activeCategories = categories?.filter(cat => (cat.productCount || 0) > 0).length || 0;
      
      const stats = {
        totalCategories,
        totalProducts,
        totalValue,
        activeCategories
      };
      
      console.log('Hesaplanan istatistikler:', stats);
      return stats;
    } catch (error) {
      console.error('İstatistik hesaplama hatası:', error);
      return {
        totalCategories: 0,
        totalProducts: 0,
        totalValue: 0,
        activeCategories: 0
      };
    }
  };

  // Kritik stok ürünlerini filtrele ve sırala
  const filteredAndSortedCriticalProducts = (() => {
    try {
      if (!criticalProducts || !Array.isArray(criticalProducts)) {
        return [];
      }
      
      let filtered = criticalProducts.filter(product => {
        // Arama filtresi
        const matchesSearch = 
          product.name?.toLowerCase().includes(criticalSearchTerm.toLowerCase()) ||
          product.categoryName?.toLowerCase().includes(criticalSearchTerm.toLowerCase());
        
        // Durum filtresi
        let matchesStatus = true;
        if (criticalFilterStatus !== 'all') {
          switch (criticalFilterStatus) {
            case 'out-of-stock':
              matchesStatus = product.stockQuantity === 0;
              break;
            case 'critical':
              matchesStatus = product.stockQuantity > 0 && product.stockQuantity <= 5;
              break;
            case 'low':
              matchesStatus = product.stockQuantity > 5 && product.stockQuantity <= 10;
              break;
          }
        }
        
        return matchesSearch && matchesStatus;
      });
      
      // Sıralama
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (criticalSortBy) {
          case 'stockQuantity':
            aValue = a.stockQuantity || 0;
            bValue = b.stockQuantity || 0;
            break;
          case 'name':
            aValue = a.name || '';
            bValue = b.name || '';
            break;
          case 'requiredQuantity':
            aValue = a.requiredQuantity || 0;
            bValue = b.requiredQuantity || 0;
            break;
          default:
            aValue = a.stockQuantity || 0;
            bValue = b.stockQuantity || 0;
        }
        
        if (criticalSortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      return filtered;
    } catch (error) {
      console.error('Kritik stok filtreleme hatası:', error);
      return [];
    }
  })();

  // Kritik stok istatistikleri
  const getCriticalStockStats = () => {
    try {
      if (!criticalProducts || !Array.isArray(criticalProducts)) {
        return {
          totalCritical: 0,
          outOfStock: 0,
          criticalLevel: 0,
          lowStock: 0,
          totalRequired: 0,
          totalValue: 0
        };
      }
      
      const outOfStock = criticalProducts.filter(p => p.stockQuantity === 0).length;
      const criticalLevel = criticalProducts.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5).length;
      const lowStock = criticalProducts.filter(p => p.stockQuantity > 5 && p.stockQuantity <= 10).length;
      const totalRequired = criticalProducts.reduce((sum, p) => sum + (p.requiredQuantity || 0), 0);
      const totalValue = criticalProducts.reduce((sum, p) => sum + (p.totalValue || 0), 0);
      
      return {
        totalCritical: criticalProducts.length,
        outOfStock,
        criticalLevel,
        lowStock,
        totalRequired,
        totalValue
      };
    } catch (error) {
      console.error('Kritik stok istatistik hesaplama hatası:', error);
      return {
        totalCritical: 0,
        outOfStock: 0,
        criticalLevel: 0,
        lowStock: 0,
        totalRequired: 0,
        totalValue: 0
      };
    }
  };

  // Ürünler raporu için filtreleme ve sıralama
  const filteredAndSortedProducts = (() => {
    try {
      if (!products || !Array.isArray(products)) {
        return [];
      }
      
      let filtered = products.filter(product => {
        // Arama filtresi
        const matchesSearch = 
          product.name?.toLowerCase().includes(productsSearchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(productsSearchTerm.toLowerCase()) ||
          product.categoryName?.toLowerCase().includes(productsSearchTerm.toLowerCase());
        
        // Kategori filtresi
        const matchesCategory = productsFilterCategory === 'all' || product.categoryId === parseInt(productsFilterCategory);
        
        // Durum filtresi
        let matchesStatus = true;
        if (productsFilterStatus !== 'all') {
          if (productsFilterStatus === 'active') {
            matchesStatus = product.isActive !== false; // isActive undefined ise aktif kabul et
          } else if (productsFilterStatus === 'inactive') {
            matchesStatus = product.isActive === false;
          }
        }
        
        // Stok filtresi
        let matchesStock = true;
        if (productsFilterStock !== 'all') {
          switch (productsFilterStock) {
            case 'in-stock':
              matchesStock = (product.stockQuantity || 0) > 0;
              break;
            case 'out-of-stock':
              matchesStock = (product.stockQuantity || 0) === 0;
              break;
            case 'low-stock':
              matchesStock = (product.stockQuantity || 0) > 0 && (product.stockQuantity || 0) <= 10;
              break;
          }
        }
        
        return matchesSearch && matchesCategory && matchesStatus && matchesStock;
      });
      
      // Sıralama
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (productsSortBy) {
          case 'name':
            aValue = a.name || '';
            bValue = b.name || '';
            break;
          case 'stockQuantity':
            aValue = a.stockQuantity || 0;
            bValue = b.stockQuantity || 0;
            break;
          case 'price':
            aValue = a.price || 0;
            bValue = b.price || 0;
            break;
          case 'categoryName':
            aValue = a.categoryName || '';
            bValue = b.categoryName || '';
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt || 0);
            bValue = new Date(b.createdAt || 0);
            break;
          default:
            aValue = a.name || '';
            bValue = b.name || '';
        }
        
        if (productsSortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      return filtered;
    } catch (error) {
      console.error('Ürünler filtreleme hatası:', error);
      return [];
    }
  })();

  // Ürünler raporu istatistikleri
  const getProductsStats = () => {
    try {
      if (!products || !Array.isArray(products)) {
        return {
          totalProducts: 0,
          activeProducts: 0,
          inactiveProducts: 0,
          inStock: 0,
          outOfStock: 0,
          lowStock: 0,
          totalValue: 0,
          averagePrice: 0
        };
      }
      
      const totalProducts = products.length;
      const activeProducts = products.filter(p => p.isActive !== false).length; // isActive undefined ise aktif kabul et
      const inactiveProducts = products.filter(p => p.isActive === false).length;
      const inStock = products.filter(p => (p.stockQuantity || 0) > 0).length;
      const outOfStock = products.filter(p => (p.stockQuantity || 0) === 0).length;
      const lowStock = products.filter(p => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= 10).length;
      
      const totalValue = products.reduce((sum, p) => {
        const stock = p.stockQuantity || 0;
        const price = p.price || 0;
        if (stock > 0 && price > 0) {
          return sum + (stock * price);
        }
        return sum;
      }, 0);
      
      const productsWithPrice = products.filter(p => p.price && p.price > 0);
      const averagePrice = productsWithPrice.length > 0 ? 
        productsWithPrice.reduce((sum, p) => sum + p.price, 0) / productsWithPrice.length : 0;
      
      return {
        totalProducts,
        activeProducts,
        inactiveProducts,
        inStock,
        outOfStock,
        lowStock,
        totalValue,
        averagePrice
      };
    } catch (error) {
      console.error('Ürünler istatistik hesaplama hatası:', error);
      return {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        inStock: 0,
        outOfStock: 0,
        lowStock: 0,
        totalValue: 0,
        averagePrice: 0
      };
    }
  };

  // İadeler raporu için filtreleme ve sıralama
  const filteredAndSortedReturns = (() => {
    try {
      if (!returns || !Array.isArray(returns)) {
        return [];
      }
      
      let filtered = returns.filter(returnItem => {
        // Arama filtresi
        const matchesSearch = 
          returnItem.productName?.toLowerCase().includes(returnsSearchTerm.toLowerCase()) ||
          returnItem.customerName?.toLowerCase().includes(returnsSearchTerm.toLowerCase()) ||
          returnItem.reason?.toLowerCase().includes(returnsSearchTerm.toLowerCase());
        
        // Durum filtresi
        const matchesStatus = returnsFilterStatus === 'all' || returnItem.status === returnsFilterStatus;
        
        // Tip filtresi
        const matchesType = returnsFilterType === 'all' || returnItem.returnType === returnsFilterType;
        
        // Tarih filtresi
        const returnDate = new Date(returnItem.returnDate);
        const startDate = new Date(returnsDateRange.startDate);
        const endDate = new Date(returnsDateRange.endDate);
        const matchesDate = returnDate >= startDate && returnDate <= endDate;
        
        return matchesSearch && matchesStatus && matchesType && matchesDate;
      });
      
      // Sıralama
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (returnsSortBy) {
          case 'returnDate':
            aValue = new Date(a.returnDate || 0);
            bValue = new Date(b.returnDate || 0);
            break;
          case 'productName':
            aValue = a.productName || '';
            bValue = b.productName || '';
            break;
          case 'quantity':
            aValue = a.quantity || 0;
            bValue = b.quantity || 0;
            break;
          case 'status':
            aValue = a.status || '';
            bValue = b.status || '';
            break;
          case 'returnType':
            aValue = a.returnType || '';
            bValue = b.returnType || '';
            break;
          default:
            aValue = new Date(a.returnDate || 0);
            bValue = new Date(b.returnDate || 0);
        }
        
        if (returnsSortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      return filtered;
    } catch (error) {
      console.error('İadeler filtreleme hatası:', error);
      return [];
    }
  })();

  // Ajanda raporu için filtreleme ve sıralama
  const filteredAndSortedEvents = (() => {
    try {
      if (!events || !Array.isArray(events)) {
        return [];
      }
      
      let filtered = events.filter(event => {
        // Arama filtresi
        const matchesSearch = 
          event.title?.toLowerCase().includes(eventsSearchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(eventsSearchTerm.toLowerCase());
        
        // Durum filtresi
        const matchesStatus = eventsFilterStatus === 'all' || event.status === eventsFilterStatus;
        
        // Öncelik filtresi
        const matchesPriority = eventsFilterPriority === 'all' || event.priority === eventsFilterPriority;
        
        // Tarih filtresi
        const eventDate = new Date(event.agendaDate);
        const startDate = new Date(eventsDateRange.startDate);
        const endDate = new Date(eventsDateRange.endDate);
        const matchesDate = eventDate >= startDate && eventDate <= endDate;
        
        return matchesSearch && matchesStatus && matchesPriority && matchesDate;
      });
      
      // Sıralama
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (eventsSortBy) {
          case 'agendaDate':
            aValue = new Date(a.agendaDate || 0);
            bValue = new Date(b.agendaDate || 0);
        }
        
        if (eventsSortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      return filtered;
    } catch (error) {
      console.error('Ajanda etkinlikleri filtreleme hatası:', error);
      return [];
    }
  })();

  // Kullanıcılar raporu için filtreleme
  const filteredAndSortedUsers = (() => {
    try {
      if (!users || !Array.isArray(users)) {
        return [];
      }
      
      let filtered = users.filter(user => {
        // Arama filtresi
        const matchesSearch = 
          user.username?.toLowerCase().includes(usersSearchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(usersSearchTerm.toLowerCase()) ||
          user.fullName?.toLowerCase().includes(usersSearchTerm.toLowerCase());
        
        // Rol filtresi
        const matchesRole = usersFilterRole === 'all' || user.role === usersFilterRole;
        
        // Tarih filtresi
        const userDate = new Date(user.createdAt);
        const startDate = new Date(usersDateRange.startDate);
        const endDate = new Date(usersDateRange.endDate);
        const matchesDate = userDate >= startDate && userDate <= endDate;
        
        return matchesSearch && matchesRole && matchesDate;
      });
      
      // Varsayılan olarak kayıt tarihine göre sırala (en yeni önce)
      filtered.sort((a, b) => {
        const aValue = new Date(a.createdAt || 0);
        const bValue = new Date(b.createdAt || 0);
        return bValue - aValue; // En yeni önce
      });
      
      return filtered;
    } catch (error) {
      console.error('Kullanıcılar filtreleme hatası:', error);
      return [];
    }
  })();

  // Son hareketler raporu için filtreleme ve sıralama
  const filteredAndSortedRecentActivities = (() => {
    try {
      if (!recentActivities || !Array.isArray(recentActivities)) {
        return [];
      }
      
      let filtered = recentActivities.filter(activity => {
        // Arama filtresi
        const matchesSearch = 
          activity.description?.toLowerCase().includes(recentActivitiesSearchTerm.toLowerCase()) ||
          activity.user?.toLowerCase().includes(recentActivitiesSearchTerm.toLowerCase());
        
        // Tip filtresi
        const matchesType = recentActivitiesFilterType === 'all' || activity.type === recentActivitiesFilterType;
        
        return matchesSearch && matchesType;
      });
      
      // Sıralama
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (recentActivitiesSortBy) {
          case 'timestamp':
            aValue = a.date;
            bValue = b.date;
            break;
          case 'type':
            aValue = a.type || '';
            bValue = b.type || '';
            break;
          case 'user':
            aValue = a.user || '';
            bValue = b.user || '';
            break;
          case 'action':
            aValue = a.action || '';
            bValue = b.action || '';
            break;
          default:
            aValue = a.date;
            bValue = b.date;
        }
        
        if (recentActivitiesSortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      return filtered;
    } catch (error) {
      console.error('Son hareketler filtreleme hatası:', error);
      return [];
    }
  })();

  // İadeler raporu istatistikleri
  const getReturnsStats = () => {
    try {
      if (!returns || !Array.isArray(returns)) {
        return {
          totalReturns: 0,
          pendingReturns: 0,
          approvedReturns: 0,
          completedReturns: 0,
          rejectedReturns: 0,
          customerReturns: 0,
          supplierReturns: 0,
          totalQuantity: 0,
          totalAmount: 0,
          averageQuantity: 0
        };
      }
      
      const totalReturns = returns.length;
      const pendingReturns = returns.filter(r => r.status === 'pending').length;
      const approvedReturns = returns.filter(r => r.status === 'approved').length;
      const completedReturns = returns.filter(r => r.status === 'completed').length;
      const rejectedReturns = returns.filter(r => r.status === 'rejected').length;
      const customerReturns = returns.filter(r => r.returnType === 'customer').length;
      const supplierReturns = returns.filter(r => r.returnType === 'supplier').length;
      
      const totalQuantity = returns.reduce((sum, r) => sum + (r.quantity || 0), 0);
      const totalAmount = returns.reduce((sum, r) => sum + (r.amount || 0), 0);
      const averageQuantity = totalReturns > 0 ? totalQuantity / totalReturns : 0;
      
      return {
        totalReturns,
        pendingReturns,
        approvedReturns,
        completedReturns,
        rejectedReturns,
        customerReturns,
        supplierReturns,
        totalQuantity,
        totalAmount,
        averageQuantity
      };
    } catch (error) {
      console.error('İadeler istatistik hesaplama hatası:', error);
      return {
        totalReturns: 0,
        pendingReturns: 0,
        approvedReturns: 0,
        completedReturns: 0,
        rejectedReturns: 0,
        customerReturns: 0,
        supplierReturns: 0,
        totalQuantity: 0,
        totalAmount: 0,
        averageQuantity: 0
      };
    }
  };

  // Ajanda raporu istatistikleri
  const getEventsStats = () => {
    try {
      if (!events || !Array.isArray(events)) {
        return {
          totalEvents: 0,
          pendingEvents: 0,
          approvedEvents: 0,
          completedEvents: 0,
          cancelledEvents: 0,
          highPriorityEvents: 0,
          mediumPriorityEvents: 0,
          lowPriorityEvents: 0,
          todayEvents: 0,
          upcomingEvents: 0,
          pastEvents: 0
        };
      }
      
      const totalEvents = events.length;
      const pendingEvents = events.filter(e => e.status === 'pending').length;
      const approvedEvents = events.filter(e => e.status === 'approved').length;
      const completedEvents = events.filter(e => e.status === 'completed').length;
      const cancelledEvents = events.filter(e => e.status === 'cancelled').length;
      
      const highPriorityEvents = events.filter(e => e.priority === 'high').length;
      const mediumPriorityEvents = events.filter(e => e.priority === 'medium').length;
      const lowPriorityEvents = events.filter(e => e.priority === 'low').length;
      
      const today = new Date();
      const todayEvents = events.filter(e => {
        const eventDate = new Date(e.agendaDate);
        return eventDate.toDateString() === today.toDateString();
      }).length;
      
      const upcomingEvents = events.filter(e => {
        const eventDate = new Date(e.agendaDate);
        return eventDate > today;
      }).length;
      
      const pastEvents = events.filter(e => {
        const eventDate = new Date(e.agendaDate);
        return eventDate < today;
      }).length;
      
      return {
        totalEvents,
        pendingEvents,
        approvedEvents,
        completedEvents,
        cancelledEvents,
        highPriorityEvents,
        mediumPriorityEvents,
        lowPriorityEvents,
        todayEvents,
        upcomingEvents,
        pastEvents
      };
    } catch (error) {
      console.error('Ajanda etkinlikleri istatistik hesaplama hatası:', error);
      return {
        totalEvents: 0,
        pendingEvents: 0,
        approvedEvents: 0,
        completedEvents: 0,
        cancelledEvents: 0,
        highPriorityEvents: 0,
        mediumPriorityEvents: 0,
        lowPriorityEvents: 0,
        todayEvents: 0,
        upcomingEvents: 0,
        pastEvents: 0
      };
    }
  };

  // Kullanıcılar raporu istatistikleri
  const getUsersStats = () => {
    try {
      if (!users || !Array.isArray(users)) {
        return {
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          suspendedUsers: 0,
          adminUsers: 0,
          userUsers: 0,
          managerUsers: 0,
          newUsersThisMonth: 0,
          newUsersThisWeek: 0,
          lastLoginToday: 0,
          lastLoginThisWeek: 0
        };
      }
      
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.isActive === true).length;
      const inactiveUsers = users.filter(u => u.isActive === false).length;
      
      const adminUsers = users.filter(u => u.role === 'Admin').length;
      const userUsers = users.filter(u => u.role === 'Personel').length;
      const managerUsers = users.filter(u => u.role === 'Yönetici').length;
      
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      

      
      const newUsersThisWeek = users.filter(u => {
        const createdDate = new Date(u.createdAt);
        return createdDate >= weekAgo;
      }).length;
      
      const lastLoginToday = users.filter(u => {
        if (!u.lastLoginDate) return false;
        const lastLogin = new Date(u.lastLoginDate);
        return lastLogin.toDateString() === now.toDateString();
      }).length;
      
      const lastLoginThisWeek = users.filter(u => {
        if (!u.lastLoginDate) return false;
        const lastLogin = new Date(u.lastLoginDate);
        return lastLogin >= weekAgo;
      }).length;
      
              return {
          totalUsers,
          activeUsers,
          inactiveUsers,
          adminUsers,
          userUsers,
          managerUsers,
          newUsersThisWeek
        };
    } catch (error) {
      console.error('Kullanıcılar istatistik hesaplama hatası:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        adminUsers: 0,
        userUsers: 0,
        managerUsers: 0,
        newUsersThisWeek: 0
      };
    }
  };

  // Son hareketler raporu istatistikleri
  const getRecentActivitiesStats = () => {
    try {
      if (!recentActivities || !Array.isArray(recentActivities)) {
        return {
          totalActivities: 0,
          todayActivities: 0,
          thisWeekActivities: 0,
          stockActivities: 0,
          productActivities: 0,
          categoryActivities: 0,
          returnActivities: 0,
          eventActivities: 0,
          userActivities: 0,
          mostActiveUser: 'Bilinmeyen',
          mostActiveType: 'Bilinmeyen'
        };
      }
      
      const totalActivities = recentActivities.length;
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const todayActivities = recentActivities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= today;
      }).length;
      
      const thisWeekActivities = recentActivities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= weekAgo;
      }).length;
      
      const stockActivities = recentActivities.filter(activity => 
        activity.type === 'stock_movement'
      ).length;
      
      const productActivities = recentActivities.filter(activity => 
        ['product_added', 'product_updated', 'product_deleted'].includes(activity.type)
      ).length;
      
      const loginActivities = recentActivities.filter(activity => 
        activity.type === 'login'
      ).length;
      
      const logoutActivities = recentActivities.filter(activity => 
        activity.type === 'logout'
      ).length;
      
      const saleActivities = recentActivities.filter(activity => 
        activity.type === 'sale'
      ).length;
      
      const returnActivities = recentActivities.filter(activity => 
        activity.type === 'return'
      ).length;
      
      // En aktif kullanıcı
      const userCounts = {};
      recentActivities.forEach(activity => {
        if (activity.user && activity.user !== 'Sistem') {
          userCounts[activity.user] = (userCounts[activity.user] || 0) + 1;
        }
      });
      
      let mostActiveUser = 'Bilinmeyen';
      let maxUserCount = 0;
      Object.entries(userCounts).forEach(([user, count]) => {
        if (count > maxUserCount) {
          maxUserCount = count;
          mostActiveUser = user;
        }
      });
      
      // En aktif tip
      const typeCounts = {};
      recentActivities.forEach(activity => {
        typeCounts[activity.type] = (typeCounts[activity.type] || 0) + 1;
      });
      
      let mostActiveType = 'Bilinmeyen';
      let maxTypeCount = 0;
      Object.entries(typeCounts).forEach(([type, count]) => {
        if (count > maxTypeCount) {
          maxTypeCount = count;
          mostActiveType = type;
        }
      });
      
      return {
        totalActivities,
        todayActivities,
        thisWeekActivities,
        stockActivities,
        productActivities,
        loginActivities,
        logoutActivities,
        saleActivities,
        returnActivities,
        mostActiveUser,
        mostActiveType
      };
    } catch (error) {
      console.error('Son hareketler istatistik hesaplama hatası:', error);
      return {
        totalActivities: 0,
        todayActivities: 0,
        thisWeekActivities: 0,
        stockActivities: 0,
        productActivities: 0,
        loginActivities: 0,
        logoutActivities: 0,
        saleActivities: 0,
        returnActivities: 0,
        mostActiveUser: 'Bilinmeyen',
        mostActiveType: 'Bilinmeyen'
      };
    }
  };

  // Z Raporu için tüm verileri çek
  const fetchAllDataForZReport = async () => {
    try {
      // Tüm gerekli verileri paralel olarak çek
      await Promise.all([
        fetchStockMovements(),
        fetchCategories(),
        fetchProducts(),
        fetchCriticalStockProducts(),
        fetchReturns(),
        fetchEvents(),
        fetchUsers(),
        fetchRecentActivities()
      ]);
    } catch (error) {
      console.error('Z Raporu için veri çekme hatası:', error);
    }
  };

  // Z Raporu istatistikleri
  const getZReportStats = () => {
    try {
      const stockStats = {
        totalMovements: filteredStockMovements.length,
        totalIn: filteredStockMovements.filter(m => m.movementType === 'IN').length,
        totalOut: filteredStockMovements.filter(m => m.movementType === 'OUT').length,
        totalQuantity: filteredStockMovements.reduce((sum, m) => sum + (m.quantity || 0), 0)
      };

      const categoryStats = getCategoryStats();
      const criticalStats = getCriticalStockStats();
      const productsStats = getProductsStats();
      const returnsStats = getReturnsStats();
      const eventsStats = getEventsStats();
      const usersStats = getUsersStats();
      const activitiesStats = getRecentActivitiesStats();

      return {
        stock: stockStats,
        category: categoryStats,
        critical: criticalStats,
        products: productsStats,
        returns: returnsStats,
        events: eventsStats,
        users: usersStats,
        activities: activitiesStats,
        summary: {
          totalProducts: productsStats.totalProducts,
          totalCategories: categoryStats.totalCategories,
          totalUsers: usersStats.totalUsers,
          totalReturns: returnsStats.totalReturns,
          totalEvents: eventsStats.totalEvents,
          totalActivities: activitiesStats.totalActivities,
          totalStockValue: productsStats.totalValue,
          criticalProducts: criticalStats.totalCritical,
          outOfStock: criticalStats.outOfStock
        }
      };
    } catch (error) {
      console.error('Z Raporu istatistik hesaplama hatası:', error);
      return {
        stock: { totalMovements: 0, totalIn: 0, totalOut: 0, totalQuantity: 0 },
        category: { totalCategories: 0, totalProducts: 0, totalValue: 0, activeCategories: 0 },
        critical: { totalCritical: 0, outOfStock: 0, criticalLevel: 0, lowStock: 0, totalRequired: 0, totalValue: 0 },
        products: { totalProducts: 0, activeProducts: 0, inactiveProducts: 0, inStock: 0, outOfStock: 0, lowStock: 0, totalValue: 0, averagePrice: 0 },
        returns: { totalReturns: 0, pendingReturns: 0, approvedReturns: 0, completedReturns: 0, rejectedReturns: 0, customerReturns: 0, supplierReturns: 0, totalQuantity: 0, totalAmount: 0, averageQuantity: 0 },
        events: { totalEvents: 0, pendingEvents: 0, approvedEvents: 0, completedEvents: 0, cancelledEvents: 0, highPriorityEvents: 0, mediumPriorityEvents: 0, lowPriorityEvents: 0, todayEvents: 0, upcomingEvents: 0, pastEvents: 0 },
        users: { totalUsers: 0, activeUsers: 0, inactiveUsers: 0, adminUsers: 0, userUsers: 0, managerUsers: 0, newUsersThisWeek: 0 },
        activities: { totalActivities: 0, todayActivities: 0, thisWeekActivities: 0, stockActivities: 0, productActivities: 0, loginActivities: 0, logoutActivities: 0, saleActivities: 0, returnActivities: 0, mostActiveUser: 'Bilinmeyen', mostActiveType: 'Bilinmeyen' },
        summary: { totalProducts: 0, totalCategories: 0, totalUsers: 0, totalReturns: 0, totalEvents: 0, totalActivities: 0, totalStockValue: 0, criticalProducts: 0, outOfStock: 0 }
      };
    }
  };

  // XLSX indirme fonksiyonu
  const downloadXLSX = () => {
    // Ana veri tablosu
    const mainData = filteredStockMovements.map(movement => ({
      'Tarih': new Date(movement.movementDate).toLocaleDateString('tr-TR'),
      'Ürün': movement.productName || 'Bilinmeyen Ürün',
      'Tür': movement.movementType === 'IN' ? 'Giriş' : 'Çıkış',
      'Miktar': movement.quantity || 0,
      'Önceki Stok': movement.previousStock || 0,
      'Yeni Stok': movement.newStock || 0,
      'Referans': movement.reference || '-'
    }));

    // İstatistik özeti (en altta)
    const totalMovements = filteredStockMovements.length;
    const totalIn = filteredStockMovements.filter(m => m.movementType === 'IN').length;
    const totalOut = filteredStockMovements.filter(m => m.movementType === 'OUT').length;
    const totalQuantity = filteredStockMovements.reduce((sum, m) => sum + (m.quantity || 0), 0);
    
    const summaryData = [
      {}, // Boş satır
      { 'Tarih': '=== ÖZET İSTATİSTİKLER ===' },
      { 'Tarih': 'Toplam Hareket', 'Miktar': totalMovements },
      { 'Tarih': 'Toplam Giriş', 'Miktar': totalIn },
      { 'Tarih': 'Toplam Çıkış', 'Miktar': totalOut },
      { 'Tarih': 'Toplam Miktar', 'Miktar': totalQuantity }
    ];

    // Ana veri + özet veriyi birleştir
    const allData = [...mainData, ...summaryData];

    const worksheet = XLSX.utils.json_to_sheet(allData);

    // Tablo stili için sütun genişliklerini ayarla
    const columnWidths = [
      { wch: 12 }, // Tarih
      { wch: 25 }, // Ürün
      { wch: 8 },  // Tür
      { wch: 10 }, // Miktar
      { wch: 12 }, // Önceki Stok
      { wch: 10 }, // Yeni Stok
      { wch: 20 }  // Referans
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stok Hareketleri');
    
    XLSX.writeFile(workbook, 'stok-hareketleri.xlsx');
  };

  // PDF indirme fonksiyonu
  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Başlık
      doc.setFontSize(20);
      doc.text('Stok Hareketleri Raporu', 14, 22);
      
      // Tarih
      doc.setFontSize(12);
      doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 32);
      
      // İstatistikler
      const totalMovements = filteredStockMovements ? filteredStockMovements.length : 0;
      const totalIn = filteredStockMovements ? filteredStockMovements.filter(m => m.movementType === 'IN').length : 0;
      const totalOut = filteredStockMovements ? filteredStockMovements.filter(m => m.movementType === 'OUT').length : 0;
      const totalQuantity = filteredStockMovements ? filteredStockMovements.reduce((sum, m) => sum + (m.quantity || 0), 0) : 0;
      
      doc.setFontSize(14);
      doc.text('Özet İstatistikler:', 14, 45);
      
      doc.setFontSize(10);
      doc.text(`Toplam Hareket: ${totalMovements}`, 14, 55);
      doc.text(`Toplam Giriş: ${totalIn}`, 14, 62);
      doc.text(`Toplam Çıkış: ${totalOut}`, 14, 69);
      doc.text(`Toplam Miktar: ${totalQuantity}`, 14, 76);
      
      // Kartlar (İstatistik Kartları)
      doc.setFontSize(14);
      doc.text('İstatistik Kartları:', 14, 95);
      
      // Kart 1: Toplam Hareket
      doc.setFontSize(12);
      doc.text('Toplam Hareket', 14, 105);
      doc.setFontSize(16);
      doc.text(`${totalMovements}`, 14, 115);
      
      // Kart 2: Toplam Giriş
      doc.setFontSize(12);
      doc.text('Toplam Giriş', 70, 105);
      doc.setFontSize(16);
      doc.text(`${totalIn}`, 70, 115);
      
      // Kart 3: Toplam Çıkış
      doc.setFontSize(12);
      doc.text('Toplam Çıkış', 126, 105);
      doc.setFontSize(16);
      doc.text(`${totalOut}`, 70, 115);
      
      // Tablo
      if (filteredStockMovements && filteredStockMovements.length > 0) {
        const tableData = filteredStockMovements.map(movement => [
          new Date(movement.movementDate).toLocaleDateString('tr-TR'),
          movement.productName || 'Bilinmeyen Ürün',
          movement.movementType === 'IN' ? 'Giriş' : 'Çıkış',
          movement.quantity || 0,
          movement.previousStock || 0,
          movement.newStock || 0,
          movement.reference || '-'
        ]);
        
        autoTable(doc, {
          head: [['Tarih', 'Ürün', 'Tür', 'Miktar', 'Önceki Stok', 'Yeni Stok', 'Referans']],
          body: tableData,
          startY: 130,
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [66, 139, 202],
            textColor: 255
          }
        });
      }
      
      doc.save('stok-hareketleri.pdf');
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Kategori XLSX indirme fonksiyonu
  const downloadCategoryXLSX = () => {
    // Ana veri tablosu
    const mainData = filteredAndSortedCategories.map(category => {
      // Kategori için toplam değeri hesapla
      const categoryTotalValue = products
        .filter(product => product.categoryId === category.id)
        .reduce((sum, product) => {
          const stock = product.stockQuantity || 0;
          const price = product.price || 0;
          return sum + (stock * price);
        }, 0);
      
      return {
        'Kategori Adı': category.name || 'Bilinmeyen Kategori',
        'Açıklama': category.description || '-',
        'Ürün Sayısı': category.productCount || 0,
        'Toplam Değer': categoryTotalValue ? `${categoryTotalValue.toFixed(2)} ₺` : '0 ₺',
        'Durum': (category.productCount || 0) > 0 ? 'Aktif' : 'Pasif'
      };
    });

    // İstatistik özeti (en altta)
    const stats = getCategoryStats();
    const summaryData = [
      {}, // Boş satır
      { 'Kategori Adı': '=== ÖZET İSTATİSTİKLER ===' },
      { 'Kategori Adı': 'Toplam Kategori', 'Ürün Sayısı': stats.totalCategories },
      { 'Kategori Adı': 'Toplam Ürün', 'Ürün Sayısı': stats.totalProducts },
      { 'Kategori Adı': 'Toplam Değer', 'Toplam Değer': `${stats.totalValue.toFixed(2)} ₺` },
      { 'Kategori Adı': 'Aktif Kategori', 'Ürün Sayısı': stats.activeCategories }
    ];

    // Ana veri + özet veriyi birleştir
    const allData = [...mainData, ...summaryData];

    const worksheet = XLSX.utils.json_to_sheet(allData);

    // Tablo stili için sütun genişliklerini ayarla
    const columnWidths = [
      { wch: 20 }, // Kategori Adı
      { wch: 30 }, // Açıklama
      { wch: 12 }, // Ürün Sayısı
      { wch: 15 }, // Toplam Değer
      { wch: 10 }  // Durum
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kategoriler');
    
    XLSX.writeFile(workbook, 'kategori-raporu.xlsx');
  };

  // Kategori PDF indirme fonksiyonu
  const downloadCategoryPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Başlık
      doc.setFontSize(20);
      doc.text('Kategori Raporu', 14, 22);
      
      // Tarih
      doc.setFontSize(12);
      doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 32);
      
      // İstatistikler
      const stats = getCategoryStats();
      doc.setFontSize(14);
      doc.text('Özet İstatistikler:', 14, 45);
      
      doc.setFontSize(10);
      doc.text(`Toplam Kategori: ${stats.totalCategories}`, 14, 55);
      doc.text(`Toplam Ürün: ${stats.totalProducts}`, 14, 62);
      doc.text(`Toplam Değer: ${stats.totalValue.toFixed(2)} ₺`, 14, 69);
      doc.text(`Aktif Kategori: ${stats.activeCategories}`, 14, 76);
      
      // Kartlar (İstatistik Kartları)
      doc.setFontSize(14);
      doc.text('İstatistik Kartları:', 14, 95);
      
      // Kart 1: Toplam Kategori
      doc.setFontSize(12);
      doc.text('Toplam Kategori', 14, 105);
      doc.setFontSize(16);
      doc.text(`${stats.totalCategories}`, 14, 115);
      
      // Kart 2: Toplam Ürün
      doc.setFontSize(12);
      doc.text('Toplam Ürün', 70, 105);
      doc.setFontSize(16);
      doc.text(`${stats.totalProducts}`, 70, 115);
      
      // Kart 3: Toplam Değer
      doc.setFontSize(12);
      doc.text('Toplam Değer', 126, 105);
      doc.setFontSize(16);
      doc.text(`${stats.totalValue.toFixed(2)} ₺`, 126, 115);
      
      // Tablo
      if (filteredAndSortedCategories && filteredAndSortedCategories.length > 0) {
        const tableData = filteredAndSortedCategories.map(category => {
          const categoryTotalValue = products
            .filter(product => product.categoryId === category.id)
            .reduce((sum, product) => {
              const stock = product.stockQuantity || 0;
              const price = product.price || 0;
              return sum + (stock * price);
            }, 0);
          
          return [
            category.name || 'Bilinmeyen Kategori',
            category.description || '-',
            category.productCount || 0,
            categoryTotalValue ? `${categoryTotalValue.toFixed(2)} ₺` : '0 ₺',
            (category.productCount || 0) > 0 ? 'Aktif' : 'Pasif'
          ];
        });
        
        autoTable(doc, {
          head: [['Kategori Adı', 'Açıklama', 'Ürün Sayısı', 'Toplam Değer', 'Durum']],
          body: tableData,
          startY: 130,
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [66, 139, 202],
            textColor: 255
          }
        });
      }
      
      doc.save('kategori-raporu.pdf');
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Kritik Stok XLSX indirme fonksiyonu
  const downloadCriticalStockXLSX = () => {
    // Ana veri tablosu
    const mainData = filteredAndSortedCriticalProducts.map(product => ({
      'Ürün Adı': product.name || 'Bilinmeyen Ürün',
      'Kategori': product.categoryName || 'Bilinmeyen Kategori',
      'Mevcut Stok': product.stockQuantity || 0,
      'Minimum Stok': product.criticalStockLevel || 0,
      'Gerekli Miktar': product.requiredQuantity || 0,
      'Stok Durumu': product.stockStatus || '-'
    }));

    // İstatistik özeti (en altta)
    const stats = getCriticalStockStats();
    const summaryData = [
      {}, // Boş satır
      { 'Ürün Adı': '=== ÖZET İSTATİSTİKLER ===' },
      { 'Ürün Adı': 'Toplam Kritik Ürün', 'Mevcut Stok': stats.totalCritical },
      { 'Ürün Adı': 'Stok Tükendi', 'Mevcut Stok': stats.outOfStock },
      { 'Ürün Adı': 'Kritik Seviye', 'Mevcut Stok': stats.criticalLevel },
      { 'Ürün Adı': 'Düşük Stok', 'Mevcut Stok': stats.lowStock },
      { 'Ürün Adı': 'Toplam Gerekli Miktar', 'Gerekli Miktar': stats.totalRequired }
    ];

    // Ana veri + özet veriyi birleştir
    const allData = [...mainData, ...summaryData];

    const worksheet = XLSX.utils.json_to_sheet(allData);

    // Tablo stili için sütun genişliklerini ayarla
    const columnWidths = [
      { wch: 25 }, // Ürün Adı
      { wch: 20 }, // Kategori
      { wch: 12 }, // Mevcut Stok
      { wch: 12 }, // Minimum Stok
      { wch: 15 }, // Gerekli Miktar
      { wch: 15 }  // Stok Durumu
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kritik Stok');
    
    XLSX.writeFile(workbook, 'kritik-stok-raporu.xlsx');
  };

  // Kritik Stok PDF indirme fonksiyonu
  const downloadCriticalStockPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Başlık
      doc.setFontSize(20);
      doc.text('Kritik Stok Raporu', 14, 22);
      
      // Tarih
      doc.setFontSize(12);
      doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 32);
      
      // İstatistikler
      const stats = getCriticalStockStats();
      doc.setFontSize(14);
      doc.text('Özet İstatistikler:', 14, 45);
      
      doc.setFontSize(10);
      doc.text(`Toplam Kritik Ürün: ${stats.totalCritical}`, 14, 55);
      doc.text(`Stok Tükendi: ${stats.outOfStock}`, 14, 62);
      doc.text(`Kritik Seviye: ${stats.criticalLevel}`, 14, 69);
      doc.text(`Düşük Stok: ${stats.lowStock}`, 14, 76);
      doc.text(`Toplam Gerekli Miktar: ${stats.totalRequired}`, 14, 83);
      
      // Kartlar (İstatistik Kartları)
      doc.setFontSize(14);
      doc.text('İstatistik Kartları:', 14, 105);
      
      // Kart 1: Toplam Kritik Ürün
      doc.setFontSize(12);
      doc.text('Toplam Kritik Ürün', 14, 115);
      doc.setFontSize(16);
      doc.text(`${stats.totalCritical}`, 14, 125);
      
      // Kart 2: Stok Tükendi
      doc.setFontSize(12);
      doc.text('Stok Tükendi', 70, 115);
      doc.setFontSize(16);
      doc.text(`${stats.outOfStock}`, 70, 125);
      
      // Kart 3: Kritik Seviye
      doc.setFontSize(12);
      doc.text('Kritik Seviye', 126, 115);
      doc.setFontSize(16);
      doc.text(`${stats.criticalLevel}`, 126, 125);
      
      // Tablo
      if (filteredAndSortedCriticalProducts && filteredAndSortedCriticalProducts.length > 0) {
        const tableData = filteredAndSortedCriticalProducts.map(product => [
          product.name || 'Bilinmeyen Ürün',
          product.categoryName || 'Bilinmeyen Kategori',
          product.stockQuantity || 0,
          product.criticalStockLevel || 0,
          product.requiredQuantity || 0,
          product.stockStatus || '-'
        ]);
        
        autoTable(doc, {
          head: [['Ürün Adı', 'Kategori', 'Mevcut Stok', 'Minimum Stok', 'Gerekli Miktar', 'Stok Durumu']],
          body: tableData,
          startY: 140,
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [66, 139, 202],
            textColor: 255
          }
        });
      }
      
      doc.save('kritik-stok-raporu.pdf');
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Ürünler Raporu XLSX indirme fonksiyonu
  const downloadProductsXLSX = () => {
    // Ana veri tablosu
    const mainData = filteredAndSortedProducts.map(product => ({
      'Ürün Adı': product.name || 'Bilinmeyen Ürün',
      'Açıklama': product.description || '-',
      'Kategori': product.categoryName || 'Bilinmeyen Kategori',
      'Fiyat': product.price ? `${product.price.toFixed(2)} ₺` : '0 ₺',
      'Mevcut Stok': product.stockQuantity || 0,
      'Minimum Stok': product.minStockLevel || product.criticalStockLevel || 0,
      'Durum': product.isActive !== false ? 'Aktif' : 'Pasif',
      'Oluşturulma Tarihi': product.createdAt ? new Date(product.createdAt).toLocaleDateString('tr-TR') : (product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('tr-TR') : '-')
    }));

    // İstatistik özeti (en altta)
    const stats = getProductsStats();
    const summaryData = [
      {}, // Boş satır
      { 'Ürün Adı': '=== ÖZET İSTATİSTİKLER ===' },
      { 'Ürün Adı': 'Toplam Ürün', 'Mevcut Stok': stats.totalProducts },
      { 'Ürün Adı': 'Aktif Ürün', 'Mevcut Stok': stats.activeProducts },
      { 'Ürün Adı': 'Pasif Ürün', 'Mevcut Stok': stats.inactiveProducts },
      { 'Ürün Adı': 'Toplam Değer', 'Fiyat': `${stats.totalValue.toFixed(2)} ₺` },
      { 'Ürün Adı': 'Ortalama Fiyat', 'Fiyat': `${stats.averagePrice.toFixed(2)} ₺` }
    ];

    // Ana veri + özet veriyi birleştir
    const allData = [...mainData, ...summaryData];

    const worksheet = XLSX.utils.json_to_sheet(allData);

    // Tablo stili için sütun genişliklerini ayarla
    const columnWidths = [
      { wch: 25 }, // Ürün Adı
      { wch: 30 }, // Açıklama
      { wch: 20 }, // Kategori
      { wch: 15 }, // Fiyat
      { wch: 12 }, // Mevcut Stok
      { wch: 12 }, // Minimum Stok
      { wch: 10 }, // Durum
      { wch: 15 }  // Oluşturulma Tarihi
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ürünler');
    
    XLSX.writeFile(workbook, 'urunler-raporu.xlsx');
  };

  // Ürünler Raporu PDF indirme fonksiyonu
  const downloadProductsPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Başlık
      doc.setFontSize(20);
      doc.text('Ürünler Raporu', 14, 22);
      
      // Tarih
      doc.setFontSize(12);
      doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 32);
      
      // İstatistikler
      const stats = getProductsStats();
      doc.setFontSize(14);
      doc.text('Özet İstatistikler:', 14, 45);
      
      doc.setFontSize(10);
      doc.text(`Toplam Ürün: ${stats.totalProducts}`, 14, 55);
      doc.text(`Aktif Ürün: ${stats.activeProducts}`, 14, 62);
      doc.text(`Pasif Ürün: ${stats.inactiveProducts}`, 14, 69);
      doc.text(`Stokta Olan: ${stats.inStockProducts}`, 14, 76);
      doc.text(`Stok Tükenen: ${stats.outOfStockProducts}`, 14, 83);
      doc.text(`Düşük Stok: ${stats.lowStockProducts}`, 14, 90);
      doc.text(`Toplam Stok Değeri: ${stats.totalStockValue.toFixed(2)} ₺`, 14, 97);
      
      // Kartlar (İstatistik Kartları)
      doc.setFontSize(14);
      doc.text('İstatistik Kartları:', 14, 115);
      
      // Kart 1: Toplam Ürün
      doc.setFontSize(12);
      doc.text('Toplam Ürün', 14, 125);
      doc.setFontSize(16);
      doc.text(`${stats.totalProducts}`, 14, 135);
      
      // Kart 2: Aktif Ürün
      doc.setFontSize(12);
      doc.text('Aktif Ürün', 70, 125);
      doc.setFontSize(16);
      doc.text(`${stats.activeProducts}`, 70, 135);
      
      // Kart 3: Toplam Değer
      doc.setFontSize(12);
      doc.text('Toplam Değer', 126, 125);
      doc.setFontSize(16);
      doc.text(`${stats.totalStockValue.toFixed(2)} ₺`, 126, 135);
      
      // Tablo
      if (filteredAndSortedProducts && filteredAndSortedProducts.length > 0) {
        const tableData = filteredAndSortedProducts.map(product => [
          product.name || 'Bilinmeyen Ürün',
          product.categoryName || 'Bilinmeyen Kategori',
          product.stockQuantity || 0,
          product.price ? `${product.price.toFixed(2)} ₺` : '0 ₺',
          product.criticalStockLevel || 0,
          product.stockStatus || '-',
          product.status || 'Aktif'
        ]);
        
        autoTable(doc, {
          head: [['Ürün Adı', 'Kategori', 'Stok', 'Fiyat', 'Min. Stok', 'Stok Durumu', 'Durum']],
          body: tableData,
          startY: 150,
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [66, 139, 202],
            textColor: 255
          }
        });
      }
      
      doc.save('urunler-raporu.pdf');
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // İadeler Raporu XLSX indirme fonksiyonu
  const downloadReturnsXLSX = () => {
    // Ana veri tablosu
    const mainData = filteredAndSortedReturns.map(returnItem => ({
      'İade Tarihi': new Date(returnItem.returnDate).toLocaleDateString('tr-TR'),
      'Ürün Adı': returnItem.productName || 'Bilinmeyen Ürün',
      'Miktar': returnItem.quantity || 0,
      'İade Tipi': returnItem.returnType === 'customer' ? 'Müşteri' : 'Tedarikçi',
      'Durum': returnItem.status === 'pending' ? 'Beklemede' : 
               returnItem.status === 'approved' ? 'Onaylandı' :
               returnItem.status === 'completed' ? 'Tamamlandı' :
               returnItem.status === 'rejected' ? 'Reddedildi' : returnItem.status,
      'İade Nedeni': returnItem.reason || '-',
      'Müşteri Adı': returnItem.customerName || '-',
      'İşlem Tarihi': returnItem.processedDate ? new Date(returnItem.processedDate).toLocaleDateString('tr-TR') : '-',
      'Tutar': returnItem.amount ? `${returnItem.amount.toFixed(2)} ₺` : '-'
    }));

    // İstatistik özeti (en altta) - Daha iyi Excel formatı için
    const stats = getReturnsStats();
    const summaryData = [
      {}, // Boş satır
      { 'İade Tarihi': '=== ÖZET İSTATİSTİKLER ===', 'Ürün Adı': '', 'Miktar': '', 'İade Tipi': '', 'Durum': '', 'İade Nedeni': '', 'Müşteri Adı': '', 'İşlem Tarihi': '', 'Tutar': '' },
      { 'İade Tarihi': 'Toplam İade', 'Ürün Adı': '', 'Miktar': stats.totalReturns, 'İade Tipi': '', 'Durum': '', 'İade Nedeni': '', 'Müşteri Adı': '', 'İşlem Tarihi': '', 'Tutar': '' },
      { 'İade Tarihi': 'Bekleyen İade', 'Ürün Adı': '', 'Miktar': stats.pendingReturns, 'İade Tipi': '', 'Durum': '', 'İade Nedeni': '', 'Müşteri Adı': '', 'İşlem Tarihi': '', 'Tutar': '' },
      { 'İade Tarihi': 'Onaylanan İade', 'Ürün Adı': '', 'Miktar': stats.approvedReturns, 'İade Tipi': '', 'Durum': '', 'İade Nedeni': '', 'Müşteri Adı': '', 'İşlem Tarihi': '', 'Tutar': '' },
      { 'İade Tarihi': 'Tamamlanan İade', 'Ürün Adı': '', 'Miktar': stats.completedReturns, 'İade Tipi': '', 'Durum': '', 'İade Nedeni': '', 'Müşteri Adı': '', 'İşlem Tarihi': '', 'Tutar': '' },
      { 'İade Tarihi': 'Reddedilen İade', 'Ürün Adı': '', 'Miktar': stats.rejectedReturns, 'İade Tipi': '', 'Durum': '', 'İade Nedeni': '', 'Müşteri Adı': '', 'İşlem Tarihi': '', 'Tutar': '' },
      { 'İade Tarihi': 'Müşteri İadesi', 'Ürün Adı': '', 'Miktar': stats.customerReturns, 'İade Tipi': '', 'Durum': '', 'İade Nedeni': '', 'Müşteri Adı': '', 'İşlem Tarihi': '', 'Tutar': '' },
      { 'İade Tarihi': 'Tedarikçi İadesi', 'Ürün Adı': '', 'Miktar': stats.supplierReturns, 'İade Tipi': '', 'Durum': '', 'İade Nedeni': '', 'Müşteri Adı': '', 'İşlem Tarihi': '', 'Tutar': '' },
      { 'İade Tarihi': 'Toplam Miktar', 'Ürün Adı': '', 'Miktar': stats.totalQuantity, 'İade Tipi': '', 'Durum': '', 'İade Nedeni': '', 'Müşteri Adı': '', 'İşlem Tarihi': '', 'Tutar': '' }
    ];

    // Ana veri + özet veriyi birleştir
    const allData = [...mainData, ...summaryData];

    const worksheet = XLSX.utils.json_to_sheet(allData);

    // Tablo stili için sütun genişliklerini ayarla
    const columnWidths = [
      { wch: 12 }, // İade Tarihi
      { wch: 25 }, // Ürün Adı
      { wch: 10 }, // Miktar
      { wch: 12 }, // İade Tipi
      { wch: 12 }, // Durum
      { wch: 30 }, // İade Nedeni
      { wch: 20 }, // Müşteri Adı
      { wch: 12 }, // İşlem Tarihi
      { wch: 15 }  // Tutar
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'İadeler');
    
    XLSX.writeFile(workbook, 'iadeler-raporu.xlsx');
  };

  // İadeler Raporu PDF indirme fonksiyonu
  const downloadReturnsPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Başlık
      doc.setFontSize(20);
      doc.text('İadeler Raporu', 14, 22);
      
      // Tarih
      doc.setFontSize(12);
      doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 32);
      
      // İstatistikler
      const stats = getReturnsStats();
      doc.setFontSize(14);
      doc.text('Özet İstatistikler:', 14, 45);
      
      doc.setFontSize(10);
      doc.text(`Toplam İade: ${stats.totalReturns}`, 14, 55);
      doc.text(`Bekleyen: ${stats.pendingReturns}`, 14, 62);
      doc.text(`Onaylanan: ${stats.approvedReturns}`, 14, 69);
      doc.text(`Tamamlanan: ${stats.completedReturns}`, 14, 76);
      doc.text(`Reddedilen: ${stats.rejectedReturns}`, 14, 83);
      doc.text(`Müşteri İadesi: ${stats.customerReturns}`, 14, 90);
      doc.text(`Tedarikçi İadesi: ${stats.supplierReturns}`, 14, 97);
      doc.text(`Toplam Miktar: ${stats.totalQuantity}`, 14, 104);
      doc.text(`Toplam Tutar: ${stats.totalAmount.toFixed(2)} ₺`, 14, 111);
      
      // Kartlar (İstatistik Kartları)
      doc.setFontSize(14);
      doc.text('İstatistik Kartları:', 14, 135);
      
      // Kart 1: Toplam İade
      doc.setFontSize(12);
      doc.text('Toplam İade', 14, 145);
      doc.setFontSize(16);
      doc.text(`${stats.totalReturns}`, 14, 155);
      
      // Kart 2: Bekleyen İade
      doc.setFontSize(12);
      doc.text('Bekleyen İade', 70, 145);
      doc.setFontSize(16);
      doc.text(`${stats.pendingReturns}`, 70, 155);
      
      // Kart 3: Toplam Tutar
      doc.setFontSize(12);
      doc.text('Toplam Tutar', 126, 145);
      doc.setFontSize(16);
      doc.text(`${stats.totalAmount.toFixed(2)} ₺`, 126, 155);
      
      // Tablo
      if (filteredAndSortedReturns && filteredAndSortedReturns.length > 0) {
        const tableData = filteredAndSortedReturns.map(returnItem => [
          new Date(returnItem.returnDate).toLocaleDateString('tr-TR'),
          returnItem.productName || 'Bilinmeyen Ürün',
          returnItem.quantity || 0,
          returnItem.returnType === 'customer' ? 'Müşteri' : 'Tedarikçi',
          returnItem.status || 'Bekliyor',
          returnItem.reason || '-'
        ]);
        
        autoTable(doc, {
          head: [['İade Tarihi', 'Ürün', 'Miktar', 'İade Tipi', 'Durum', 'Sebep']],
          body: tableData,
          startY: 170,
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [66, 139, 202],
            textColor: 255
          }
        });
      }
      
      doc.save('iadeler-raporu.pdf');
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Ajanda Raporu XLSX indirme fonksiyonu
  const downloadEventsXLSX = () => {
    // Ana veri tablosu
    const mainData = filteredAndSortedEvents.map(event => ({
      'Etkinlik Tarihi': new Date(event.agendaDate).toLocaleDateString('tr-TR'),
      'Etkinlik Saati': event.agendaTime || '-',
      'Başlık': event.title || 'Başlıksız',
      'Açıklama': event.description || '-',
      'Öncelik': event.priority === 'high' ? 'Yüksek' : 
                 event.priority === 'medium' ? 'Orta' : 
                 event.priority === 'low' ? 'Düşük' : event.priority,
      'Durum': event.status === 'pending' ? 'Beklemede' : 
               event.status === 'approved' ? 'Onaylandı' :
               event.status === 'completed' ? 'Tamamlandı' :
               event.status === 'cancelled' ? 'İptal Edildi' : event.status,
      'Oluşturulma Tarihi': new Date(event.createdAt).toLocaleDateString('tr-TR'),
      'Güncelleme Tarihi': event.updatedAt ? new Date(event.updatedAt).toLocaleDateString('tr-TR') : '-'
    }));

    // İstatistik özeti (en altta) - Daha iyi Excel formatı için
    const stats = getEventsStats();
    const summaryData = [
      {}, // Boş satır
      { 'Etkinlik Tarihi': '=== ÖZET İSTATİSTİKLER ===', 'Etkinlik Saati': '', 'Başlık': '', 'Açıklama': '', 'Öncelik': '', 'Durum': '', 'Oluşturulma Tarihi': '', 'Güncelleme Tarihi': '' },
      { 'Etkinlik Tarihi': 'Toplam Etkinlik', 'Etkinlik Saati': '', 'Başlık': '', 'Açıklama': '', 'Öncelik': stats.totalEvents, 'Durum': '', 'Oluşturulma Tarihi': '', 'Güncelleme Tarihi': '' },
      { 'Etkinlik Tarihi': 'Bekleyen Etkinlik', 'Etkinlik Saati': '', 'Başlık': '', 'Açıklama': '', 'Öncelik': stats.pendingEvents, 'Durum': '', 'Oluşturulma Tarihi': '', 'Güncelleme Tarihi': '' },
      { 'Etkinlik Tarihi': 'Onaylanan Etkinlik', 'Etkinlik Saati': '', 'Başlık': '', 'Açıklama': '', 'Öncelik': stats.approvedEvents, 'Durum': '', 'Oluşturulma Tarihi': '', 'Güncelleme Tarihi': '' },
      { 'Etkinlik Tarihi': 'Tamamlanan Etkinlik', 'Etkinlik Saati': '', 'Başlık': '', 'Açıklama': '', 'Öncelik': stats.completedEvents, 'Durum': '', 'Oluşturulma Tarihi': '', 'Güncelleme Tarihi': '' },
      { 'Etkinlik Tarihi': 'İptal Edilen Etkinlik', 'Etkinlik Saati': '', 'Başlık': '', 'Açıklama': '', 'Öncelik': stats.cancelledEvents, 'Durum': '', 'Oluşturulma Tarihi': '', 'Güncelleme Tarihi': '' },
      { 'Etkinlik Tarihi': 'Yüksek Öncelik', 'Etkinlik Saati': '', 'Başlık': '', 'Açıklama': '', 'Öncelik': stats.highPriorityEvents, 'Durum': '', 'Oluşturulma Tarihi': '', 'Güncelleme Tarihi': '' },
      { 'Etkinlik Tarihi': 'Orta Öncelik', 'Etkinlik Saati': '', 'Başlık': '', 'Açıklama': '', 'Öncelik': stats.highPriorityEvents, 'Durum': '', 'Oluşturulma Tarihi': '', 'Güncelleme Tarihi': '' },
      { 'Etkinlik Tarihi': 'Düşük Öncelik', 'Etkinlik Saati': '', 'Başlık': '', 'Açıklama': '', 'Öncelik': stats.lowPriorityEvents, 'Durum': '', 'Oluşturulma Tarihi': '', 'Güncelleme Tarihi': '' },
      { 'Etkinlik Tarihi': 'Bugünkü Etkinlik', 'Etkinlik Saati': '', 'Başlık': '', 'Açıklama': '', 'Öncelik': stats.todayEvents, 'Durum': '', 'Oluşturulma Tarihi': '', 'Güncelleme Tarihi': '' },
      { 'Etkinlik Tarihi': 'Gelecek Etkinlik', 'Etkinlik Saati': '', 'Başlık': '', 'Açıklama': '', 'Öncelik': stats.upcomingEvents, 'Durum': '', 'Oluşturulma Tarihi': '', 'Güncelleme Tarihi': '' },
      { 'Etkinlik Tarihi': 'Geçmiş Etkinlik', 'Etkinlik Saati': '', 'Başlık': '', 'Açıklama': '', 'Öncelik': stats.pastEvents, 'Durum': '', 'Oluşturulma Tarihi': '', 'Güncelleme Tarihi': '' }
    ];

    // Ana veri + özet veriyi birleştir
    const allData = [...mainData, ...summaryData];

    const worksheet = XLSX.utils.json_to_sheet(allData);

    // Tablo stili için sütun genişliklerini ayarla
    const columnWidths = [
      { wch: 15 }, // Etkinlik Tarihi
      { wch: 12 }, // Etkinlik Saati
      { wch: 30 }, // Başlık
      { wch: 40 }, // Açıklama
      { wch: 12 }, // Öncelik
      { wch: 12 }, // Durum
      { wch: 15 }, // Oluşturulma Tarihi
      { wch: 15 }  // Güncelleme Tarihi
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ajanda');
    
    XLSX.writeFile(workbook, 'ajanda-raporu.xlsx');
  };

  // Ajanda Raporu PDF indirme fonksiyonu
  const downloadEventsPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Başlık
      doc.setFontSize(20);
      doc.text('Ajanda Raporu', 14, 22);
      
      // Tarih
      doc.setFontSize(12);
      doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 32);
      
      // İstatistikler
      const stats = getEventsStats();
      doc.setFontSize(14);
      doc.text('Özet İstatistikler:', 14, 45);
      
      doc.setFontSize(10);
      doc.text(`Toplam Etkinlik: ${stats.totalEvents}`, 14, 55);
      doc.text(`Bekleyen: ${stats.pendingEvents}`, 14, 62);
      doc.text(`Onaylanan: ${stats.approvedEvents}`, 14, 69);
      doc.text(`Tamamlanan: ${stats.completedEvents}`, 14, 76);
      doc.text(`İptal Edilen: ${stats.cancelledEvents}`, 14, 83);
      doc.text(`Yüksek Öncelik: ${stats.highPriorityEvents}`, 14, 90);
      doc.text(`Orta Öncelik: ${stats.mediumPriorityEvents}`, 14, 97);
      doc.text(`Düşük Öncelik: ${stats.lowPriorityEvents}`, 14, 104);
      doc.text(`Bugün: ${stats.todayEvents}`, 14, 111);
      doc.text(`Yaklaşan: ${stats.upcomingEvents}`, 14, 118);
      
      // Kartlar (İstatistik Kartları)
      doc.setFontSize(14);
      doc.text('İstatistik Kartları:', 14, 150);
      
      // Kart 1: Toplam Etkinlik
      doc.setFontSize(12);
      doc.text('Toplam Etkinlik', 14, 160);
      doc.setFontSize(16);
      doc.text(`${stats.totalEvents}`, 14, 170);
      
      // Kart 2: Bekleyen Etkinlik
      doc.setFontSize(12);
      doc.text('Bekleyen Etkinlik', 70, 160);
      doc.setFontSize(16);
      doc.text(`${stats.pendingEvents}`, 70, 170);
      
      // Kart 3: Bugünkü Etkinlik
      doc.setFontSize(12);
      doc.text('Bugünkü Etkinlik', 126, 160);
      doc.setFontSize(16);
      doc.text(`${stats.todayEvents}`, 126, 170);
      
      // Tablo
      if (filteredAndSortedEvents && filteredAndSortedEvents.length > 0) {
        const tableData = filteredAndSortedEvents.map(event => [
          new Date(event.agendaDate).toLocaleDateString('tr-TR'),
          event.title || 'Başlıksız',
          event.priority || 'Orta',
          event.status || 'Bekliyor',
          event.description || '-'
        ]);
        
        autoTable(doc, {
          head: [['Tarih', 'Başlık', 'Öncelik', 'Durum', 'Açıklama']],
          body: tableData,
          startY: 185,
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [66, 139, 202],
            textColor: 255
          }
        });
      }
      
      doc.save('ajanda-raporu.pdf');
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Kullanıcılar Raporu XLSX indirme fonksiyonu
  const downloadUsersXLSX = () => {
    // Ana veri tablosu
    const mainData = users.map(user => ({
      'ID': user.id || '-',
      'Kullanıcı Adı': user.username || 'Kullanıcı Adı Yok',
      'Ad Soyad': user.fullName || 'İsimsiz',
      'E-posta': user.email || '-',
      'Şifre': user.password || '-',
      'Rol': user.role === 'Admin' ? 'Admin' : 
             user.role === 'Yönetici' ? 'Yönetici' : 
             user.role === 'Personel' ? 'Personel' : user.role,
      'Durum': user.isActive ? 'Aktif' : 'Pasif',
      'Kayıt Tarihi': new Date(user.createdAt).toLocaleDateString('tr-TR'),
      'Güncelleme Tarihi': user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('tr-TR') : '-'
    }));

        // İstatistik özeti (en altta) - Kartlardaki tüm veriler
    const stats = getUsersStats();
    const summaryData = [
      {}, // Boş satır
      { 'ID': '=== KART İSTATİSTİKLERİ ===', 'Kullanıcı Adı': '', 'Ad Soyad': '', 'E-posta': '', 'Şifre': '', 'Rol': '', 'Durum': '', 'Kayıt Tarihi': '', 'Güncelleme Tarihi': '' },
      { 'ID': 'Toplam Kullanıcı', 'Kullanıcı Adı': '', 'Ad Soyad': '', 'E-posta': '', 'Şifre': '', 'Rol': stats.totalUsers, 'Durum': '', 'Kayıt Tarihi': '', 'Güncelleme Tarihi': '' },
      { 'ID': 'Aktif Kullanıcı', 'Kullanıcı Adı': '', 'Ad Soyad': '', 'E-posta': '', 'Şifre': '', 'Rol': stats.activeUsers, 'Durum': '', 'Kayıt Tarihi': '', 'Güncelleme Tarihi': '' },
      { 'ID': 'Yönetici', 'Kullanıcı Adı': '', 'Ad Soyad': '', 'E-posta': '', 'Şifre': '', 'Rol': stats.adminUsers, 'Durum': '', 'Kayıt Tarihi': '', 'Güncelleme Tarihi': '' },
      {}, // Boş satır
      { 'ID': '=== DETAY İSTATİSTİKLER ===', 'Kullanıcı Adı': '', 'Ad Soyad': '', 'E-posta': '', 'Şifre': '', 'Rol': '', 'Durum': '', 'Kayıt Tarihi': '', 'Güncelleme Tarihi': '' },
      { 'ID': 'Pasif Kullanıcı', 'Kullanıcı Adı': '', 'Ad Soyad': '', 'E-posta': '', 'Şifre': '', 'Rol': stats.inactiveUsers, 'Durum': '', 'Kayıt Tarihi': '', 'Güncelleme Tarihi': '' },
      { 'ID': 'Müdür', 'Kullanıcı Adı': '', 'Ad Soyad': '', 'E-posta': '', 'Şifre': '', 'Rol': stats.managerUsers, 'Durum': '', 'Kayıt Tarihi': '', 'Güncelleme Tarihi': '' },
      { 'ID': 'Kullanıcı', 'Kullanıcı Adı': '', 'Ad Soyad': '', 'E-posta': '', 'Şifre': '', 'Rol': stats.userUsers, 'Durum': '', 'Kayıt Tarihi': '', 'Güncelleme Tarihi': '' },
      { 'ID': 'Bu Hafta Yeni', 'Kullanıcı Adı': '', 'Ad Soyad': '', 'E-posta': '', 'Şifre': '', 'Rol': stats.newUsersThisWeek, 'Durum': '', 'Kayıt Tarihi': '', 'Güncelleme Tarihi': '' }
    ];

    // Ana veri + özet veriyi birleştir
    const allData = [...mainData, ...summaryData];

    const worksheet = XLSX.utils.json_to_sheet(allData);

    // Tablo stili için sütun genişliklerini ayarla
    const columnWidths = [
      { wch: 8 },  // ID
      { wch: 20 }, // Kullanıcı Adı
      { wch: 20 }, // Ad Soyad
      { wch: 25 }, // E-posta
      { wch: 15 }, // Şifre
      { wch: 12 }, // Rol
      { wch: 15 }, // Durum
      { wch: 15 }, // Kayıt Tarihi
      { wch: 15 }  // Güncelleme Tarihi
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kullanıcılar');
    
    XLSX.writeFile(workbook, 'kullanicilar-raporu.xlsx');
  };

  // Kullanıcılar Raporu PDF indirme fonksiyonu
  const downloadUsersPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Başlık
      doc.setFontSize(20);
      doc.text('Kullanıcılar Raporu', 14, 22);
      
      // Tarih
      doc.setFontSize(12);
      doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 32);
      
      // İstatistikler
      const stats = getUsersStats();
      doc.setFontSize(14);
      doc.text('Özet İstatistikler:', 14, 45);
      
      doc.setFontSize(10);
      doc.text(`Toplam Kullanıcı: ${stats.totalUsers}`, 14, 55);
      doc.text(`Aktif Kullanıcı: ${stats.activeUsers}`, 14, 62);
      doc.text(`Pasif Kullanıcı: ${stats.inactiveUsers}`, 14, 69);
      doc.text(`Askıya Alınan: ${stats.suspendedUsers}`, 14, 76);
      doc.text(`Admin: ${stats.activeUsers}`, 14, 83);
      doc.text(`Kullanıcı: ${stats.userUsers}`, 14, 90);
      doc.text(`Yönetici: ${stats.managerUsers}`, 14, 97);
      doc.text(`Bu Ay Yeni: ${stats.newUsersThisMonth}`, 14, 104);
      doc.text(`Bu Hafta Yeni: ${stats.newUsersThisWeek}`, 14, 111);
      doc.text(`Bugün Giriş: ${stats.lastLoginToday}`, 14, 118);
      doc.text(`Bu Hafta Giriş: ${stats.lastLoginThisWeek}`, 14, 125);
      
      // Kartlar (İstatistik Kartları)
      doc.setFontSize(14);
      doc.text('İstatistik Kartları:', 14, 160);
      
      // Kart 1: Toplam Kullanıcı
      doc.setFontSize(12);
      doc.text('Toplam Kullanıcı', 14, 170);
      doc.setFontSize(16);
      doc.text(`${stats.totalUsers}`, 14, 180);
      
      // Kart 2: Aktif Kullanıcı
      doc.setFontSize(12);
      doc.text('Aktif Kullanıcı', 70, 170);
      doc.setFontSize(16);
      doc.text(`${stats.activeUsers}`, 70, 180);
      
      // Kart 3: Yönetici
      doc.setFontSize(12);
      doc.text('Yönetici', 126, 170);
      doc.setFontSize(16);
      doc.text(`${stats.adminUsers}`, 126, 180);
      
      // Tablo
      if (filteredAndSortedUsers && filteredAndSortedUsers.length > 0) {
        const tableData = filteredAndSortedUsers.map(user => [
          user.username || 'Bilinmeyen',
          user.fullName || user.username || 'Bilinmeyen',
          user.email || '-',
          user.role || 'Kullanıcı',
          user.status || 'Aktif',
          user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('tr-TR') : '-'
        ]);
        
        autoTable(doc, {
          head: [['Kullanıcı Adı', 'Ad Soyad', 'E-posta', 'Rol', 'Durum', 'Son Giriş']],
          body: tableData,
          startY: 195,
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [66, 139, 202],
            textColor: 255
          }
        });
      }
      
      doc.save('kullanicilar-raporu.pdf');
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Son Hareketler Raporu XLSX indirme fonksiyonu
  const downloadRecentActivitiesXLSX = () => {
    // Ana veri tablosu
    const mainData = filteredAndSortedRecentActivities.map(activity => ({
              'Tarih': activity.date,
              'Saat': new Date(activity.date).toLocaleTimeString('tr-TR'),
      'Tip': activity.type === 'stock' ? 'Stok' : 
             activity.type === 'product' ? 'Ürün' : 
             activity.type === 'category' ? 'Kategori' : 
             activity.type === 'return' ? 'İade' : 
             activity.type === 'event' ? 'Ajanda' : 
             activity.type === 'user' ? 'Kullanıcı' : 'Bilinmeyen',
      'İşlem': activity.action || '-',
      'Açıklama': activity.description || '-',
      'Kullanıcı': activity.user || '-',
      'Detaylar': JSON.stringify(activity.details || {}, null, 2)
    }));

    // İstatistik özeti (en altta)
    const stats = getRecentActivitiesStats();
    const summaryData = [
      {}, // Boş satır
      { 'Tarih': '=== ÖZET İSTATİSTİKLER ===', 'Saat': '', 'Tip': '', 'İşlem': '', 'Açıklama': '', 'Kullanıcı': '', 'Detaylar': '' },
      { 'Tarih': 'Toplam Hareket', 'Saat': '', 'Tip': '', 'İşlem': stats.totalActivities, 'Açıklama': '', 'Kullanıcı': '', 'Detaylar': '' },
      { 'Tarih': 'Bugünkü Hareket', 'Saat': '', 'Tip': '', 'İşlem': stats.todayActivities, 'Açıklama': '', 'Kullanıcı': '', 'Detaylar': '' },
      { 'Tarih': 'Bu Haftaki Hareket', 'Saat': '', 'Tip': '', 'İşlem': stats.thisWeekActivities, 'Açıklama': '', 'Kullanıcı': '', 'Detaylar': '' },
      {}, // Boş satır
      { 'Tarih': '=== TİP BAZLI İSTATİSTİKLER ===', 'Saat': '', 'Tip': '', 'İşlem': '', 'Açıklama': '', 'Kullanıcı': '', 'Detaylar': '' },
      { 'Tarih': 'Stok Hareketleri', 'Saat': '', 'Tip': '', 'İşlem': stats.stockActivities, 'Açıklama': '', 'Kullanıcı': '', 'Detaylar': '' },
      { 'Tarih': 'Ürün İşlemleri', 'Saat': '', 'Tip': '', 'İşlem': stats.productActivities, 'Açıklama': '', 'Kullanıcı': '', 'Detaylar': '' },
      { 'Tarih': 'Giriş/Çıkış', 'Saat': '', 'Tip': '', 'İşlem': stats.loginActivities + stats.logoutActivities, 'Açıklama': '', 'Kullanıcı': '', 'Detaylar': '' },
      { 'Tarih': 'Satış İşlemleri', 'Saat': '', 'Tip': '', 'İşlem': stats.saleActivities, 'Açıklama': '', 'Kullanıcı': '', 'Detaylar': '' },
      { 'Tarih': 'İade İşlemleri', 'Saat': '', 'Tip': '', 'İşlem': stats.returnActivities, 'Açıklama': '', 'Kullanıcı': '', 'Detaylar': '' },
      {}, // Boş satır
      { 'Tarih': '=== EN AKTİF ===', 'Saat': '', 'Tip': '', 'İşlem': '', 'Açıklama': '', 'Kullanıcı': '', 'Detaylar': '' },
      { 'Tarih': 'En Aktif Kullanıcı', 'Saat': '', 'Tip': '', 'İşlem': stats.mostActiveUser, 'Açıklama': '', 'Kullanıcı': '', 'Detaylar': '' },
      { 'Tarih': 'En Aktif Tip', 'Saat': '', 'Tip': '', 'İşlem': stats.mostActiveType, 'Açıklama': '', 'Kullanıcı': '', 'Detaylar': '' }
    ];

    // Ana veri + özet veriyi birleştir
    const allData = [...mainData, ...summaryData];

    const worksheet = XLSX.utils.json_to_sheet(allData);

    // Tablo stili için sütun genişliklerini ayarla
    const columnWidths = [
      { wch: 12 }, // Tarih
      { wch: 10 }, // Saat
      { wch: 12 }, // Tip
      { wch: 20 }, // İşlem
      { wch: 40 }, // Açıklama
      { wch: 20 }, // Kullanıcı
      { wch: 50 }  // Detaylar
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Son Hareketler');
    
    XLSX.writeFile(workbook, 'son-hareketler-raporu.xlsx');
  };

  // Son Hareketler Raporu PDF indirme fonksiyonu
  const downloadRecentActivitiesPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Başlık
      doc.setFontSize(20);
      doc.text('Son Hareketler Raporu', 14, 22);
      
      // Tarih
      doc.setFontSize(12);
      doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 32);
      
      // İstatistikler
      const stats = getRecentActivitiesStats();
      doc.setFontSize(14);
      doc.text('Özet İstatistikler:', 14, 45);
      
      doc.setFontSize(10);
      doc.text(`Toplam Hareket: ${stats.totalActivities}`, 14, 55);
      doc.text(`Bugün: ${stats.todayActivities}`, 14, 62);
      doc.text(`Bu Hafta: ${stats.thisWeekActivities}`, 14, 69);
      doc.text(`Stok Hareketleri: ${stats.stockActivities}`, 14, 76);
      doc.text(`Ürün İşlemleri: ${stats.productActivities}`, 14, 83);
      doc.text(`Giriş/Çıkış: ${stats.loginActivities + stats.logoutActivities}`, 14, 90);
      doc.text(`Satış İşlemleri: ${stats.saleActivities}`, 14, 97);
      doc.text(`İade İşlemleri: ${stats.returnActivities}`, 14, 104);
      doc.text(`En Aktif Kullanıcı: ${stats.mostActiveUser}`, 14, 111);
      
      // Kartlar (İstatistik Kartları)
      doc.setFontSize(14);
      doc.text('İstatistik Kartları:', 14, 125);
      
      // Kart 1: Toplam Hareket
      doc.setFontSize(12);
      doc.text('Toplam Hareket', 14, 135);
      doc.setFontSize(16);
      doc.text(`${stats.totalActivities}`, 14, 145);
      
      // Kart 2: Bugünkü Hareket
      doc.setFontSize(12);
      doc.text('Bugünkü Hareket', 70, 135);
      doc.setFontSize(16);
      doc.text(`${stats.todayActivities}`, 70, 145);
      
      // Kart 3: Bu Haftaki Hareket
      doc.setFontSize(12);
      doc.text('Bu Haftaki Hareket', 126, 135);
      doc.setFontSize(16);
      doc.text(`${stats.thisWeekActivities}`, 126, 145);
      
      // Tablo
      if (filteredAndSortedRecentActivities && filteredAndSortedRecentActivities.length > 0) {
        const tableData = filteredAndSortedRecentActivities.map(activity => [
          activity.date,
          activity.type === 'stock' ? 'Stok' : 
          activity.type === 'product' ? 'Ürün' : 
          activity.type === 'category' ? 'Kategori' : 
          activity.type === 'return' ? 'İade' : 
          activity.type === 'event' ? 'Ajanda' : 
          activity.type === 'user' ? 'Kullanıcı' : 'Bilinmeyen',
          activity.action || '-',
          activity.description || '-',
          activity.user || '-'
        ]);
        
        autoTable(doc, {
          head: [['Tarih', 'Tip', 'İşlem', 'Açıklama', 'Kullanıcı']],
          body: tableData,
          startY: 160,
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [66, 139, 202],
            textColor: 255
          }
        });
      }
      
      doc.save('son-hareketler-raporu.pdf');
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Z Raporu XLSX indirme fonksiyonu
  const downloadZReportXLSX = () => {
    try {
      const stats = getZReportStats();
      
      // Ana özet verisi
      const summaryData = [
        { 'Rapor Tipi': '=== Z RAPORU ÖZETİ ===', 'Değer': '', 'Detay': '', 'Durum': '' },
        { 'Rapor Tipi': 'Toplam Ürün', 'Değer': stats.summary.totalProducts, 'Detay': 'Adet', 'Durum': 'Aktif' },
        { 'Rapor Tipi': 'Toplam Kategori', 'Değer': stats.summary.totalCategories, 'Detay': 'Adet', 'Durum': 'Aktif' },
        { 'Rapor Tipi': 'Toplam Kullanıcı', 'Değer': stats.summary.totalUsers, 'Detay': 'Kişi', 'Durum': 'Aktif' },
        { 'Rapor Tipi': 'Toplam İade', 'Değer': stats.summary.totalReturns, 'Detay': 'Adet', 'Durum': 'Beklemede' },
        { 'Rapor Tipi': 'Toplam Etkinlik', 'Değer': stats.summary.totalEvents, 'Detay': 'Adet', 'Durum': 'Aktif' },
        { 'Rapor Tipi': 'Toplam Aktivite', 'Değer': stats.summary.totalActivities, 'Detay': 'Adet', 'Durum': 'Tamamlandı' },
        { 'Rapor Tipi': 'Toplam Stok Değeri', 'Değer': `${stats.summary.totalStockValue.toFixed(2)} ₺`, 'Detay': 'TL', 'Durum': 'Güncel' },
        { 'Rapor Tipi': 'Kritik Ürünler', 'Değer': stats.summary.criticalProducts, 'Detay': 'Adet', 'Durum': 'Uyarı' },
        { 'Rapor Tipi': 'Stok Tükenen', 'Değer': stats.summary.outOfStock, 'Detay': 'Adet', 'Durum': 'Kritik' },
        {}, // Boş satır
        { 'Rapor Tipi': '=== STOK HAREKETLERİ ===', 'Değer': '', 'Detay': '', 'Durum': '' },
        { 'Rapor Tipi': 'Toplam Hareket', 'Değer': stats.stock.totalMovements, 'Detay': 'Adet', 'Durum': 'Tamamlandı' },
        { 'Rapor Tipi': 'Giriş Hareketi', 'Değer': stats.stock.totalIn, 'Detay': 'Adet', 'Durum': 'Tamamlandı' },
        { 'Rapor Tipi': 'Çıkış Hareketi', 'Değer': stats.stock.totalOut, 'Detay': 'Adet', 'Durum': 'Tamamlandı' },
        { 'Rapor Tipi': 'Toplam Miktar', 'Değer': stats.stock.totalQuantity, 'Detay': 'Adet', 'Durum': 'Güncel' },
        {}, // Boş satır
        { 'Rapor Tipi': '=== KATEGORİ İSTATİSTİKLERİ ===', 'Değer': '', 'Detay': '', 'Durum': '' },
        { 'Rapor Tipi': 'Toplam Kategori', 'Değer': stats.category.totalCategories, 'Detay': 'Adet', 'Durum': 'Aktif' },
        { 'Rapor Tipi': 'Toplam Ürün', 'Değer': stats.category.totalProducts, 'Detay': 'Adet', 'Durum': 'Aktif' },
        { 'Rapor Tipi': 'Toplam Değer', 'Değer': `${stats.category.totalValue.toFixed(2)} ₺`, 'Detay': 'TL', 'Durum': 'Güncel' },
        { 'Rapor Tipi': 'Aktif Kategori', 'Değer': stats.category.activeCategories, 'Detay': 'Adet', 'Durum': 'Aktif' },
        {}, // Boş satır
        { 'Rapor Tipi': '=== KRİTİK STOK ===', 'Değer': '', 'Detay': '', 'Durum': '' },
        { 'Rapor Tipi': 'Toplam Kritik Ürün', 'Değer': stats.critical.totalCritical, 'Detay': 'Adet', 'Durum': 'Uyarı' },
        { 'Rapor Tipi': 'Stok Tükendi', 'Değer': stats.critical.outOfStock, 'Detay': 'Adet', 'Durum': 'Kritik' },
        { 'Rapor Tipi': 'Kritik Seviye', 'Değer': stats.critical.criticalLevel, 'Detay': 'Adet', 'Durum': 'Uyarı' },
        { 'Rapor Tipi': 'Düşük Stok', 'Değer': stats.critical.lowStock, 'Detay': 'Adet', 'Durum': 'Dikkat' },
        { 'Rapor Tipi': 'Gerekli Miktar', 'Değer': stats.critical.totalRequired, 'Detay': 'Adet', 'Durum': 'Acil' },
        {}, // Boş satır
        { 'Rapor Tipi': '=== ÜRÜN İSTATİSTİKLERİ ===', 'Değer': '', 'Detay': '', 'Durum': '' },
        { 'Rapor Tipi': 'Toplam Ürün', 'Değer': stats.products.totalProducts, 'Detay': 'Adet', 'Durum': 'Aktif' },
        { 'Rapor Tipi': 'Aktif Ürün', 'Değer': stats.products.activeProducts, 'Detay': 'Adet', 'Durum': 'Aktif' },
        { 'Rapor Tipi': 'Pasif Ürün', 'Değer': stats.products.inactiveProducts, 'Detay': 'Adet', 'Durum': 'Pasif' },
        { 'Rapor Tipi': 'Stokta Olan', 'Değer': stats.products.inStock, 'Detay': 'Adet', 'Durum': 'Aktif' },
        { 'Rapor Tipi': 'Stok Tükenen', 'Değer': stats.products.outOfStock, 'Detay': 'Adet', 'Durum': 'Kritik' },
        { 'Rapor Tipi': 'Düşük Stok', 'Değer': stats.products.lowStock, 'Detay': 'Adet', 'Durum': 'Uyarı' },
        { 'Rapor Tipi': 'Toplam Değer', 'Değer': `${stats.products.totalValue.toFixed(2)} ₺`, 'Detay': 'TL', 'Durum': 'Güncel' },
        { 'Rapor Tipi': 'Ortalama Fiyat', 'Değer': `${stats.products.averagePrice.toFixed(2)} ₺`, 'Detay': 'TL', 'Durum': 'Güncel' },
        {}, // Boş satır
        { 'Rapor Tipi': '=== İADE İSTATİSTİKLERİ ===', 'Değer': '', 'Detay': '', 'Durum': '' },
        { 'Rapor Tipi': 'Toplam İade', 'Değer': stats.returns.totalReturns, 'Detay': 'Adet', 'Durum': 'Beklemede' },
        { 'Rapor Tipi': 'Bekleyen İade', 'Değer': stats.returns.pendingReturns, 'Detay': 'Adet', 'Durum': 'Beklemede' },
        { 'Rapor Tipi': 'Onaylanan İade', 'Değer': stats.returns.approvedReturns, 'Detay': 'Adet', 'Durum': 'Onaylandı' },
        { 'Rapor Tipi': 'Tamamlanan İade', 'Değer': stats.returns.completedReturns, 'Detay': 'Adet', 'Durum': 'Tamamlandı' },
        { 'Rapor Tipi': 'Reddedilen İade', 'Değer': stats.returns.rejectedReturns, 'Detay': 'Adet', 'Durum': 'Reddedildi' },
        { 'Rapor Tipi': 'Müşteri İadesi', 'Değer': stats.returns.customerReturns, 'Detay': 'Adet', 'Durum': 'Müşteri' },
        { 'Rapor Tipi': 'Tedarikçi İadesi', 'Değer': stats.returns.supplierReturns, 'Detay': 'Adet', 'Durum': 'Tedarikçi' },
        { 'Rapor Tipi': 'Toplam Miktar', 'Değer': stats.returns.totalQuantity, 'Detay': 'Adet', 'Durum': 'Güncel' },
        { 'Rapor Tipi': 'Toplam Tutar', 'Değer': `${stats.returns.totalAmount.toFixed(2)} ₺`, 'Detay': 'TL', 'Durum': 'Güncel' },
        {}, // Boş satır
        { 'Rapor Tipi': '=== ETKİNLİK İSTATİSTİKLERİ ===', 'Değer': '', 'Detay': '', 'Durum': '' },
        { 'Rapor Tipi': 'Toplam Etkinlik', 'Değer': stats.events.totalEvents, 'Detay': 'Adet', 'Durum': 'Aktif' },
        { 'Rapor Tipi': 'Bekleyen Etkinlik', 'Değer': stats.events.pendingEvents, 'Detay': 'Adet', 'Durum': 'Beklemede' },
        { 'Rapor Tipi': 'Onaylanan Etkinlik', 'Değer': stats.events.approvedEvents, 'Detay': 'Adet', 'Durum': 'Onaylandı' },
        { 'Rapor Tipi': 'Tamamlanan Etkinlik', 'Değer': stats.events.completedEvents, 'Detay': 'Adet', 'Durum': 'Tamamlandı' },
        { 'Rapor Tipi': 'İptal Edilen Etkinlik', 'Değer': stats.events.cancelledEvents, 'Detay': 'Adet', 'Durum': 'İptal' },
        { 'Rapor Tipi': 'Yüksek Öncelik', 'Değer': stats.events.highPriorityEvents, 'Detay': 'Adet', 'Durum': 'Yüksek' },
        { 'Rapor Tipi': 'Orta Öncelik', 'Değer': stats.events.mediumPriorityEvents, 'Detay': 'Adet', 'Durum': 'Orta' },
        { 'Rapor Tipi': 'Düşük Öncelik', 'Değer': stats.events.lowPriorityEvents, 'Detay': 'Adet', 'Durum': 'Düşük' },
        { 'Rapor Tipi': 'Bugünkü Etkinlik', 'Değer': stats.events.todayEvents, 'Detay': 'Adet', 'Durum': 'Bugün' },
        { 'Rapor Tipi': 'Yaklaşan Etkinlik', 'Değer': stats.events.upcomingEvents, 'Detay': 'Adet', 'Durum': 'Gelecek' },
        {}, // Boş satır
        { 'Rapor Tipi': '=== KULLANICI İSTATİSTİKLERİ ===', 'Değer': '', 'Detay': '', 'Durum': '' },
        { 'Rapor Tipi': 'Toplam Kullanıcı', 'Değer': stats.users.totalUsers, 'Detay': 'Kişi', 'Durum': 'Aktif' },
        { 'Rapor Tipi': 'Aktif Kullanıcı', 'Değer': stats.users.activeUsers, 'Detay': 'Kişi', 'Durum': 'Aktif' },
        { 'Rapor Tipi': 'Pasif Kullanıcı', 'Değer': stats.users.inactiveUsers, 'Detay': 'Kişi', 'Durum': 'Pasif' },
        { 'Rapor Tipi': 'Admin', 'Değer': stats.users.adminUsers, 'Detay': 'Kişi', 'Durum': 'Admin' },
        { 'Rapor Tipi': 'Yönetici', 'Değer': stats.users.managerUsers, 'Detay': 'Kişi', 'Durum': 'Yönetici' },
        { 'Rapor Tipi': 'Personel', 'Değer': stats.users.userUsers, 'Detay': 'Kişi', 'Durum': 'Personel' },
        { 'Rapor Tipi': 'Bu Hafta Yeni', 'Değer': stats.users.newUsersThisWeek, 'Detay': 'Kişi', 'Durum': 'Yeni' },
        {}, // Boş satır
        { 'Rapor Tipi': '=== AKTİVİTE İSTATİSTİKLERİ ===', 'Değer': '', 'Detay': '', 'Durum': '' },
        { 'Rapor Tipi': 'Toplam Aktivite', 'Değer': stats.activities.totalActivities, 'Detay': 'Adet', 'Durum': 'Tamamlandı' },
        { 'Rapor Tipi': 'Bugünkü Aktivite', 'Değer': stats.activities.todayActivities, 'Detay': 'Adet', 'Durum': 'Bugün' },
        { 'Rapor Tipi': 'Bu Haftaki Aktivite', 'Değer': stats.activities.thisWeekActivities, 'Detay': 'Adet', 'Durum': 'Bu Hafta' },
        { 'Rapor Tipi': 'Stok Hareketleri', 'Değer': stats.activities.stockActivities, 'Detay': 'Adet', 'Durum': 'Stok' },
        { 'Rapor Tipi': 'Ürün İşlemleri', 'Değer': stats.activities.productActivities, 'Detay': 'Adet', 'Durum': 'Ürün' },
        { 'Rapor Tipi': 'Giriş/Çıkış', 'Değer': stats.activities.loginActivities + stats.activities.logoutActivities, 'Detay': 'Adet', 'Durum': 'Sistem' },
        { 'Rapor Tipi': 'Satış İşlemleri', 'Değer': stats.activities.saleActivities, 'Detay': 'Adet', 'Durum': 'Satış' },
        { 'Rapor Tipi': 'İade İşlemleri', 'Değer': stats.activities.returnActivities, 'Detay': 'Adet', 'Durum': 'İade' },
        { 'Rapor Tipi': 'En Aktif Kullanıcı', 'Değer': stats.activities.mostActiveUser, 'Detay': 'Kişi', 'Durum': 'En Aktif' },
        { 'Rapor Tipi': 'En Aktif Tip', 'Değer': stats.activities.mostActiveType, 'Detay': 'Tip', 'Durum': 'En Aktif' }
      ];

      const worksheet = XLSX.utils.json_to_sheet(summaryData);

      // Tablo stili için sütun genişliklerini ayarla
      const columnWidths = [
        { wch: 35 }, // Rapor Tipi
        { wch: 15 }, // Değer
        { wch: 15 }, // Detay
        { wch: 15 }  // Durum
      ];
      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Z Raporu');
      
      XLSX.writeFile(workbook, 'z-raporu.xlsx');
    } catch (error) {
      console.error('Z Raporu XLSX oluşturma hatası:', error);
      alert('Z Raporu oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Z Raporu PDF indirme fonksiyonu
  const downloadZReportPDF = () => {
    try {
      const doc = new jsPDF();
      const stats = getZReportStats();
      
      // Başlık
      doc.setFontSize(20);
      doc.text('Z Raporu - Tüm Raporların Özeti', 14, 22);
      
      // Tarih
      doc.setFontSize(12);
      doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 32);
      
      // Genel Özet
      doc.setFontSize(16);
      doc.text('Genel Özet:', 14, 45);
      
      doc.setFontSize(10);
      doc.text(`Toplam Ürün: ${stats.summary.totalProducts}`, 14, 55);
      doc.text(`Toplam Kategori: ${stats.summary.totalCategories}`, 14, 62);
      doc.text(`Toplam Kullanıcı: ${stats.summary.totalUsers}`, 14, 69);
      doc.text(`Toplam İade: ${stats.summary.totalReturns}`, 14, 76);
      doc.text(`Toplam Etkinlik: ${stats.summary.totalEvents}`, 14, 83);
      doc.text(`Toplam Aktivite: ${stats.summary.totalActivities}`, 14, 90);
      doc.text(`Toplam Stok Değeri: ${stats.summary.totalStockValue.toFixed(2)} ₺`, 14, 97);
      doc.text(`Kritik Ürünler: ${stats.summary.criticalProducts}`, 14, 104);
      doc.text(`Stok Tükenen: ${stats.summary.outOfStock}`, 14, 111);
      
      // Stok Hareketleri
      doc.setFontSize(14);
      doc.text('Stok Hareketleri:', 14, 130);
      
      doc.setFontSize(10);
      doc.text(`Toplam Hareket: ${stats.stock.totalMovements}`, 14, 140);
      doc.text(`Giriş Hareketi: ${stats.stock.totalIn}`, 14, 147);
      doc.text(`Çıkış Hareketi: ${stats.stock.totalOut}`, 14, 154);
      doc.text(`Toplam Miktar: ${stats.stock.totalQuantity}`, 14, 161);
      
      // Kategori İstatistikleri
      doc.setFontSize(14);
      doc.text('Kategori İstatistikleri:', 14, 175);
      
      doc.setFontSize(10);
      doc.text(`Toplam Kategori: ${stats.category.totalCategories}`, 14, 185);
      doc.text(`Toplam Ürün: ${stats.category.totalProducts}`, 14, 192);
      doc.text(`Toplam Değer: ${stats.category.totalValue.toFixed(2)} ₺`, 14, 199);
      doc.text(`Aktif Kategori: ${stats.category.activeCategories}`, 14, 206);
      
      // Kritik Stok
      doc.setFontSize(14);
      doc.text('Kritik Stok:', 14, 220);
      
      doc.setFontSize(10);
      doc.text(`Toplam Kritik Ürün: ${stats.critical.totalCritical}`, 14, 230);
      doc.text(`Stok Tükendi: ${stats.critical.outOfStock}`, 14, 237);
      doc.text(`Kritik Seviye: ${stats.critical.criticalLevel}`, 14, 244);
      doc.text(`Düşük Stok: ${stats.critical.lowStock}`, 14, 251);
      doc.text(`Gerekli Miktar: ${stats.critical.totalRequired}`, 14, 258);
      
      // Ürün İstatistikleri
      doc.setFontSize(14);
      doc.text('Ürün İstatistikleri:', 14, 275);
      
      doc.setFontSize(10);
      doc.text(`Toplam Ürün: ${stats.products.totalProducts}`, 14, 285);
      doc.text(`Aktif Ürün: ${stats.products.activeProducts}`, 14, 292);
      doc.text(`Pasif Ürün: ${stats.products.inactiveProducts}`, 14, 299);
      doc.text(`Stokta Olan: ${stats.products.inStock}`, 14, 306);
      doc.text(`Stok Tükenen: ${stats.products.outOfStock}`, 14, 313);
      doc.text(`Düşük Stok: ${stats.products.lowStock}`, 14, 320);
      doc.text(`Toplam Değer: ${stats.products.totalValue.toFixed(2)} ₺`, 14, 327);
      doc.text(`Ortalama Fiyat: ${stats.products.averagePrice.toFixed(2)} ₺`, 14, 334);
      
      // İade İstatistikleri
      doc.setFontSize(14);
      doc.text('İade İstatistikleri:', 14, 350);
      
      doc.setFontSize(10);
      doc.text(`Toplam İade: ${stats.returns.totalReturns}`, 14, 360);
      doc.text(`Bekleyen İade: ${stats.returns.pendingReturns}`, 14, 367);
      doc.text(`Onaylanan İade: ${stats.returns.approvedReturns}`, 14, 374);
      doc.text(`Tamamlanan İade: ${stats.returns.completedReturns}`, 14, 381);
      doc.text(`Reddedilen İade: ${stats.returns.rejectedReturns}`, 14, 388);
      doc.text(`Müşteri İadesi: ${stats.returns.customerReturns}`, 14, 395);
      doc.text(`Tedarikçi İadesi: ${stats.returns.supplierReturns}`, 14, 402);
      doc.text(`Toplam Miktar: ${stats.returns.totalQuantity}`, 14, 409);
      doc.text(`Toplam Tutar: ${stats.returns.totalAmount.toFixed(2)} ₺`, 14, 416);
      
      // Etkinlik İstatistikleri
      doc.setFontSize(14);
      doc.text('Etkinlik İstatistikleri:', 14, 435);
      
      doc.setFontSize(10);
      doc.text(`Toplam Etkinlik: ${stats.events.totalEvents}`, 14, 445);
      doc.text(`Bekleyen Etkinlik: ${stats.events.pendingEvents}`, 14, 452);
      doc.text(`Onaylanan Etkinlik: ${stats.events.approvedEvents}`, 14, 459);
      doc.text(`Tamamlanan Etkinlik: ${stats.events.completedEvents}`, 14, 466);
      doc.text(`İptal Edilen Etkinlik: ${stats.events.cancelledEvents}`, 14, 473);
      doc.text(`Yüksek Öncelik: ${stats.events.highPriorityEvents}`, 14, 480);
      doc.text(`Orta Öncelik: ${stats.events.mediumPriorityEvents}`, 14, 487);
      doc.text(`Düşük Öncelik: ${stats.events.lowPriorityEvents}`, 14, 494);
      doc.text(`Bugünkü Etkinlik: ${stats.events.todayEvents}`, 14, 501);
      doc.text(`Yaklaşan Etkinlik: ${stats.events.upcomingEvents}`, 14, 508);
      
      // Kullanıcı İstatistikleri
      doc.setFontSize(14);
      doc.text('Kullanıcı İstatistikleri:', 14, 525);
      
      doc.setFontSize(10);
      doc.text(`Toplam Kullanıcı: ${stats.users.totalUsers}`, 14, 535);
      doc.text(`Aktif Kullanıcı: ${stats.users.activeUsers}`, 14, 542);
      doc.text(`Pasif Kullanıcı: ${stats.users.inactiveUsers}`, 14, 549);
      doc.text(`Admin: ${stats.users.adminUsers}`, 14, 556);
      doc.text(`Yönetici: ${stats.users.managerUsers}`, 14, 563);
      doc.text(`Personel: ${stats.users.userUsers}`, 14, 570);
      doc.text(`Bu Hafta Yeni: ${stats.users.newUsersThisWeek}`, 14, 577);
      
      // Aktivite İstatistikleri
      doc.setFontSize(14);
      doc.text('Aktivite İstatistikleri:', 14, 595);
      
      doc.setFontSize(10);
      doc.text(`Toplam Aktivite: ${stats.activities.totalActivities}`, 14, 605);
      doc.text(`Bugünkü Aktivite: ${stats.activities.todayActivities}`, 14, 612);
      doc.text(`Bu Haftaki Aktivite: ${stats.activities.thisWeekActivities}`, 14, 619);
      doc.text(`Stok Hareketleri: ${stats.activities.stockActivities}`, 14, 626);
      doc.text(`Ürün İşlemleri: ${stats.activities.productActivities}`, 14, 633);
      doc.text(`Giriş/Çıkış: ${stats.activities.loginActivities + stats.activities.logoutActivities}`, 14, 640);
      doc.text(`Satış İşlemleri: ${stats.activities.saleActivities}`, 14, 647);
      doc.text(`İade İşlemleri: ${stats.activities.returnActivities}`, 14, 654);
      doc.text(`En Aktif Kullanıcı: ${stats.activities.mostActiveUser}`, 14, 661);
      doc.text(`En Aktif Tip: ${stats.activities.mostActiveType}`, 14, 668);
      
      doc.save('z-raporu.pdf');
    } catch (error) {
      console.error('Z Raporu PDF oluşturma hatası:', error);
      alert('Z Raporu oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <Layout>
      <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            {selectedReport ? (
              <div className="flex items-center">
                <button
                  onClick={handleBack}
                  className={`mr-4 p-2 rounded-lg hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div>
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedReport === 'stock-movements' && 'Stok Hareketleri Raporu'}
                    {selectedReport === 'category' && 'Kategori Raporu'}
                    {selectedReport === 'critical-stock' && 'Kritik Stok Raporu'}
                    {selectedReport === 'products' && 'Ürünler Raporu'}
                    {selectedReport === 'returns' && 'İadeler Raporu'}
                    {selectedReport === 'agenda' && 'Ajanda Raporu'}
                    {selectedReport === 'users' && 'Kullanıcılar Raporu'}
                    {selectedReport === 'recent-activities' && 'Son Hareketler Raporu'}
                    {selectedReport === 'z-report' && 'Z Raporu'}
                  </h1>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    {selectedReport === 'stock-movements' && 'Detaylı stok hareket analizi ve istatistikleri'}
                    {selectedReport === 'category' && 'Kategori bazlı ürün dağılımı ve analizi'}
                    {selectedReport === 'critical-stock' && 'Düşük stok uyarıları ve kritik seviye analizi'}
                    {selectedReport === 'products' && 'Tüm ürünlerin detaylı listesi ve analizi'}
                    {selectedReport === 'returns' && 'İade işlemleri ve analizi'}
                    {selectedReport === 'agenda' && 'Günlük aktiviteler ve planlar'}
                    {selectedReport === 'users' && 'Kullanıcı aktiviteleri ve istatistikleri'}
                    {selectedReport === 'recent-activities' && 'Sistem aktiviteleri ve hareket geçmişi'}
                    {selectedReport === 'z-report' && 'Tüm raporların kapsamlı özeti'}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Raporlar</h1>
                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Tüm raporları görüntüleyin
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Report Types Grid - Sadece rapor seçilmediğinde göster */}
        {!selectedReport && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stok Raporu */}
            <div 
              onClick={() => handleReportSelect('stock-movements')}
              className={`rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ArrowsRightLeftIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Stok Hareketleri Raporu</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Stok giriş ve çıkış hareketleri</p>
                </div>
              </div>
            </div>

            {/* Kategori Raporu */}
            <div 
              onClick={() => handleReportSelect('category')}
              className={`rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FolderIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Kategori Raporu</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Kategori bazlı ürün dağılımı</p>
                </div>
              </div>
            </div>

            {/* Kritik Stok Raporu */}
            <div 
              onClick={() => handleReportSelect('critical-stock')}
              className={`rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Kritik Stok Raporu</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Düşük stok uyarıları</p>
                </div>
              </div>
            </div>

            {/* Ürünler Raporu */}
            <div 
              onClick={() => handleReportSelect('products')}
              className={`rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CubeIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ürünler Raporu</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Tüm ürünlerin detaylı listesi</p>
                </div>
              </div>
            </div>

            {/* İadeler Raporu */}
            <div 
              onClick={() => handleReportSelect('returns')}
              className={`rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <ArrowPathIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>İadeler Raporu</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>İade işlemleri ve analizi</p>
                </div>
              </div>
            </div>

            {/* Ajanda Raporu */}
            <div 
              onClick={() => handleReportSelect('agenda')}
              className={`rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <CalendarDaysIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ajanda Raporu</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Günlük aktiviteler ve planlar</p>
                </div>
              </div>
            </div>

            {/* Kullanıcılar Raporu - Sadece Admin ve Yönetici görebilir */}
            {canViewAllReports && (
              <div 
                onClick={() => handleReportSelect('users')}
                className={`rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
                    <UserGroupIcon className="h-6 w-6 text-teal-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Kullanıcılar Raporu</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Kullanıcı aktiviteleri ve istatistikleri</p>
                  </div>
                </div>
              </div>
            )}

            {/* Son Hareketler Raporu - Sadece Admin ve Yönetici görebilir */}
            {canViewAllReports && (
              <div 
                onClick={() => handleReportSelect('recent-activities')}
                className={`rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Son Hareketler Raporu</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Sistem aktiviteleri ve hareket geçmişi</p>
                  </div>
                </div>
              </div>
            )}

            {/* Z Raporu - Tüm Raporların Özeti - Sadece Admin ve Yönetici görebilir */}
            {canViewAllReports && (
              <div 
                onClick={() => handleReportSelect('z-report')}
                className={`rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <ChartBarIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Z Raporu</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Tüm raporların kapsamlı özeti</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rapor Detayları - Seçilen rapora göre üstte panel olarak göster */}
        {selectedReport && (
          <div className="space-y-6">
            {/* Stok Hareketleri Raporu Detay Sayfası */}
            {selectedReport === 'stock-movements' && (
              <div className="space-y-6">
                {/* Filtreler */}
                <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center mb-4">
                    <FunnelIcon className="h-5 w-5 mr-2 text-gray-500" />
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filtreler</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Tarih Aralığı */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Başlangıç Tarihi
                      </label>
                      <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Bitiş Tarihi
                      </label>
                      <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    {/* Hareket Türü */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Hareket Türü
                      </label>
                      <select
                        value={movementType}
                        onChange={(e) => setMovementType(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="all">Tümü</option>
                        <option value="IN">Giriş</option>
                        <option value="OUT">Çıkış</option>
                      </select>
                    </div>

                    {/* Arama */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Arama
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Ürün adı veya referans..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={`w-full px-3 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stok Hareketleri Tablosu */}
                <div className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Stok Hareketleri ({filteredStockMovements.length} kayıt)
                      </h3>
                                              <div className="flex space-x-2">
                                                <button
                                                  onClick={downloadXLSX}
                                                  className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                                                    darkMode 
                                                      ? 'bg-green-700 hover:bg-green-600 text-white' 
                                                      : 'bg-green-100 hover:bg-green-200 text-green-700'
                                                  }`}
                                                >
                                                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                                  Excel
                                                </button>
                                                <button
                                                  onClick={downloadPDF}
                                                  className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                                                    darkMode 
                                                      ? 'bg-red-700 hover:bg-red-600 text-white' 
                                                      : 'bg-red-100 hover:bg-red-200 text-red-700'
                                                  }`}
                                                >
                                                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                                                  PDF
                                                </button>
                                              </div>
                    </div>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Yükleniyor...</p>
                    </div>
                  ) : stockMovements.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                          <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Tarih
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Ürün
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Tür
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Miktar
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Önceki Stok
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Yeni Stok
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Referans
                            </th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                          {filteredStockMovements.map((movement) => (
                            <tr key={movement.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {new Date(movement.movementDate).toLocaleDateString('tr-TR')}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {movement.productName || 'Bilinmeyen Ürün'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  movement.movementType === 'IN' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {movement.movementType === 'IN' ? 'Giriş' : 'Çıkış'}
                                </span>
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {movement.quantity || 0}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {movement.previousStock || 0}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {movement.newStock || 0}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {movement.reference || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ArrowsRightLeftIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className={`mt-2 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Stok hareketi bulunamadı
                      </h3>
                      <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Seçilen filtreler için stok hareketi bulunmuyor.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* İadeler Raporu Detay Sayfası */}
            {selectedReport === 'returns' && (
              <div className="space-y-6">
                {/* İstatistik Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <ArrowPathIcon className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam İade</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getReturnsStats().totalReturns}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <ClockIcon className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Bekleyen</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getReturnsStats().pendingReturns}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <CheckIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Tamamlanan</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getReturnsStats().completedReturns}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filtreler */}
                <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center mb-4">
                    <FunnelIcon className="h-5 w-5 mr-2 text-gray-500" />
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filtreler</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {/* Arama */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Arama
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Ürün adı, müşteri, neden..."
                          value={returnsSearchTerm}
                          onChange={(e) => setReturnsSearchTerm(e.target.value)}
                          className={`w-full px-3 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Tarih Aralığı - Başlangıç */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Başlangıç Tarihi
                      </label>
                      <input
                        type="date"
                        value={returnsDateRange.startDate}
                        onChange={(e) => setReturnsDateRange({...returnsDateRange, startDate: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    {/* Tarih Aralığı - Bitiş */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Bitiş Tarihi
                      </label>
                      <input
                        type="date"
                        value={returnsDateRange.endDate}
                        onChange={(e) => setReturnsDateRange({...returnsDateRange, endDate: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    {/* Durum Filtresi */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Durum
                      </label>
                      <select
                        value={returnsFilterStatus}
                        onChange={(e) => setReturnsFilterStatus(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="all">Tümü</option>
                        <option value="pending">Beklemede</option>
                        <option value="approved">Onaylandı</option>
                        <option value="completed">Tamamlandı</option>
                        <option value="rejected">Reddedildi</option>
                      </select>
                    </div>

                    {/* Tip Filtresi */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        İade Tipi
                      </label>
                      <select
                        value={returnsFilterType}
                        onChange={(e) => setReturnsFilterType(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="all">Tümü</option>
                        <option value="customer">Müşteri</option>
                        <option value="supplier">Tedarikçi</option>
                      </select>
                    </div>

                    {/* Sıralama */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Sıralama
                      </label>
                      <select
                        value={returnsSortBy}
                        onChange={(e) => setReturnsSortBy(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="returnDate">İade Tarihi</option>
                        <option value="productName">Ürün Adı</option>
                        <option value="quantity">Miktar</option>
                        <option value="status">Durum</option>
                        <option value="returnType">İade Tipi</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* İadeler Tablosu */}
                <div className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        İadeler ({filteredAndSortedReturns.length} kayıt)
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={downloadReturnsXLSX}
                          className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                            darkMode 
                              ? 'bg-green-700 hover:bg-green-600 text-white' 
                              : 'bg-green-100 hover:bg-green-200 text-green-700'
                          }`}
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                          Excel
                        </button>
                        <button
                          onClick={downloadReturnsPDF}
                          className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                            darkMode 
                              ? 'bg-red-700 hover:bg-red-600 text-white' 
                              : 'bg-red-100 hover:bg-red-200 text-red-700'
                          }`}
                        >
                          <DocumentTextIcon className="h-4 w-4 mr-2" />
                          PDF
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {returnsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>İadeler yükleniyor...</p>
                    </div>
                  ) : filteredAndSortedReturns.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                          <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              İade Tarihi
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Ürün Adı
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Miktar
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              İade Tipi
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Durum
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              İade Nedeni
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Müşteri Adı
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              İşlem Tarihi
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Tutar
                            </th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                          {filteredAndSortedReturns.map((returnItem) => (
                            <tr key={returnItem.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {new Date(returnItem.returnDate).toLocaleDateString('tr-TR')}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {returnItem.productName || 'Bilinmeyen Ürün'}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {returnItem.quantity || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  returnItem.returnType === 'customer'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {returnItem.returnType === 'customer' ? 'Müşteri' : 'Tedarikçi'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  returnItem.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : returnItem.status === 'approved'
                                    ? 'bg-blue-100 text-blue-800'
                                    : returnItem.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : returnItem.status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {returnItem.status === 'pending' ? 'Beklemede' : 
                                   returnItem.status === 'approved' ? 'Onaylandı' :
                                   returnItem.status === 'completed' ? 'Tamamlandı' :
                                   returnItem.status === 'rejected' ? 'Reddedildi' : returnItem.status}
                                </span>
                              </td>
                              <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                <div className="max-w-xs truncate" title={returnItem.reason || '-'}>
                                  {returnItem.reason || '-'}
                                </div>
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                {returnItem.customerName || '-'}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                {returnItem.processedDate ? new Date(returnItem.processedDate).toLocaleDateString('tr-TR') : '-'}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {returnItem.amount ? `${returnItem.amount.toFixed(2)} ₺` : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ArrowPathIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className={`mt-2 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        İade bulunamadı
                      </h3>
                      <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Seçilen filtreler için iade bulunmuyor.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ajanda Raporu Detay Sayfası */}
            {selectedReport === 'agenda' && (
              <div className="space-y-6">
                {/* İstatistik Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        <CalendarDaysIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Etkinlik</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getEventsStats().totalEvents}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <ClockIcon className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Bekleyen</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getEventsStats().pendingEvents}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <CheckIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Tamamlanan</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getEventsStats().completedEvents}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filtreler */}
                <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center mb-4">
                    <FunnelIcon className="h-5 w-5 mr-2 text-gray-500" />
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filtreler</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {/* Arama */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Arama
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Başlık, açıklama..."
                          value={eventsSearchTerm}
                          onChange={(e) => setEventsSearchTerm(e.target.value)}
                          className={`w-full px-3 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Tarih Aralığı - Başlangıç */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Başlangıç Tarihi
                      </label>
                      <input
                        type="date"
                        value={eventsDateRange.startDate}
                        onChange={(e) => setEventsDateRange({...eventsDateRange, startDate: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    {/* Tarih Aralığı - Bitiş */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Bitiş Tarihi
                      </label>
                      <input
                        type="date"
                        value={eventsDateRange.endDate}
                        onChange={(e) => setEventsDateRange({...eventsDateRange, endDate: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    {/* Durum Filtresi */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Durum
                      </label>
                      <select
                        value={eventsFilterStatus}
                        onChange={(e) => setEventsFilterStatus(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="all">Tümü</option>
                        <option value="pending">Beklemede</option>
                        <option value="approved">Onaylandı</option>
                        <option value="completed">Tamamlandı</option>
                        <option value="cancelled">İptal Edildi</option>
                      </select>
                    </div>

                    {/* Öncelik Filtresi */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Öncelik
                      </label>
                      <select
                        value={eventsFilterPriority}
                        onChange={(e) => setEventsFilterPriority(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="all">Tümü</option>
                        <option value="high">Yüksek</option>
                        <option value="medium">Orta</option>
                        <option value="low">Düşük</option>
                      </select>
                    </div>

                    {/* Sıralama */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Sıralama
                      </label>
                      <select
                        value={eventsSortBy}
                        onChange={(e) => setEventsSortBy(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="agendaDate">Etkinlik Tarihi</option>
                        <option value="title">Başlık</option>
                        <option value="priority">Öncelik</option>
                        <option value="status">Durum</option>
                        <option value="createdAt">Oluşturulma Tarihi</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ajanda Etkinlikleri Tablosu */}
                <div className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Ajanda Etkinlikleri ({filteredAndSortedEvents.length} kayıt)
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={downloadEventsXLSX}
                          className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                            darkMode 
                              ? 'bg-green-700 hover:bg-green-600 text-white' 
                              : 'bg-green-100 hover:bg-green-200 text-green-700'
                          }`}
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                          Excel
                        </button>
                        <button
                          onClick={downloadEventsPDF}
                          className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                            darkMode 
                              ? 'bg-red-700 hover:bg-red-600 text-white' 
                              : 'bg-red-100 hover:bg-red-200 text-red-700'
                          }`}
                        >
                          <DocumentTextIcon className="h-4 w-4 mr-2" />
                          PDF
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {eventsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Etkinlikler yükleniyor...</p>
                    </div>
                  ) : filteredAndSortedEvents.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                          <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Etkinlik Tarihi
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Saat
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Başlık
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Açıklama
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Öncelik
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Durum
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Oluşturulma
                            </th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                          {filteredAndSortedEvents.map((event) => (
                            <tr key={event.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {new Date(event.agendaDate).toLocaleDateString('tr-TR')}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {event.agendaTime || '-'}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {event.title || 'Başlıksız'}
                              </td>
                              <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                <div className="max-w-xs truncate" title={event.description || '-'}>
                                  {event.description || '-'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  event.priority === 'high'
                                    ? 'bg-red-100 text-red-800'
                                    : event.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {event.priority === 'high' ? 'Yüksek' : 
                                   event.priority === 'medium' ? 'Orta' : 'Düşük'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  event.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : event.status === 'approved'
                                    ? 'bg-blue-100 text-blue-800'
                                    : event.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : event.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {event.status === 'pending' ? 'Beklemede' : 
                                   event.status === 'approved' ? 'Onaylandı' :
                                   event.status === 'completed' ? 'Tamamlandı' :
                                   event.status === 'cancelled' ? 'İptal Edildi' : event.status}
                                </span>
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                {new Date(event.createdAt).toLocaleDateString('tr-TR')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className={`mt-2 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Etkinlik bulunamadı
                      </h3>
                      <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Seçilen filtreler için etkinlik bulunmuyor.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Kategori Raporu Detay Sayfası */}
             {selectedReport === 'category' && (
               <div className="space-y-6">
                                   {/* İstatistik Kartları */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <FolderIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Kategori</p>
                          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {getCategoryStats().totalCategories}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <CubeIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Ürün</p>
                          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {getCategoryStats().totalProducts}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <ChartBarIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Değer</p>
                          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {getCategoryStats().totalValue ? `${getCategoryStats().totalValue.toFixed(2)} ₺` : '0 ₺'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                 {/* Filtreler */}
                 <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                   <div className="flex items-center mb-4">
                     <FunnelIcon className="h-5 w-5 mr-2 text-gray-500" />
                     <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filtreler</h3>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                     {/* Arama */}
                     <div>
                       <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                         Arama
                       </label>
                       <div className="relative">
                         <input
                           type="text"
                           placeholder="Kategori adı veya açıklama..."
                           value={categorySearchTerm}
                           onChange={(e) => setCategorySearchTerm(e.target.value)}
                           className={`w-full px-3 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                             darkMode 
                               ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                               : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                           }`}
                         />
                         <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                       </div>
                     </div>

                     {/* Sıralama Alanı */}
                     <div>
                       <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                         Sıralama Alanı
                       </label>
                                               <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="name">Kategori Adı</option>
                          <option value="productCount">Ürün Sayısı</option>
                          <option value="totalValue">Toplam Değer</option>
                        </select>
                     </div>

                     {/* Sıralama Yönü */}
                     <div>
                       <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                         Sıralama Yönü
                       </label>
                       <select
                         value={sortOrder}
                         onChange={(e) => setSortOrder(e.target.value)}
                         className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                           darkMode 
                             ? 'bg-gray-700 border-gray-600 text-white' 
                             : 'bg-white border-gray-300 text-gray-900'
                         }`}
                       >
                         <option value="asc">Artan</option>
                         <option value="desc">Azalan</option>
                       </select>
                     </div>
                   </div>
                 </div>

                 {/* Kategori Tablosu */}
                 <div className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                   <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                     <div className="flex items-center justify-between">
                       <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                         Kategoriler ({filteredAndSortedCategories.length} kayıt)
                       </h3>
                                               <div className="flex space-x-2">
                                                 <button
                                                   onClick={downloadCategoryXLSX}
                                                   className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                                                     darkMode 
                                                       ? 'bg-green-700 hover:bg-green-600 text-white' 
                                                       : 'bg-green-100 hover:bg-green-200 text-green-700'
                                                   }`}
                                                 >
                                                   <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                                   Excel
                                                 </button>
                                                 <button
                                                   onClick={downloadCategoryPDF}
                                                   className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                                                     darkMode 
                                                       ? 'bg-red-700 hover:bg-red-600 text-white' 
                                                       : 'bg-red-100 hover:bg-red-200 text-red-700'
                                                   }`}
                                                 >
                                                   <DocumentTextIcon className="h-4 w-4 mr-2" />
                                                   PDF
                                                 </button>
                                               </div>
                     </div>
                   </div>
                   
                   {categoryLoading ? (
                     <div className="text-center py-12">
                       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                       <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Kategoriler yükleniyor...</p>
                     </div>
                   ) : filteredAndSortedCategories.length > 0 ? (
                     <div className="overflow-x-auto">
                       <table className="min-w-full divide-y divide-gray-200">
                                                   <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                            <tr>
                              <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                Kategori Adı
                              </th>
                              <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                Açıklama
                              </th>
                              <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                Ürün Sayısı
                              </th>
                              <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                Toplam Değer
                              </th>
                              <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                Durum
                              </th>
                            </tr>
                          </thead>
                         <tbody className={`divide-y ${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                                                       {filteredAndSortedCategories.map((category) => {
                              // Kategori için toplam değeri hesapla
                              const categoryTotalValue = products
                                .filter(product => product.categoryId === category.id)
                                .reduce((sum, product) => {
                                  const stock = product.stockQuantity || 0;
                                  const price = product.price || 0;
                                  return sum + (stock * price);
                                }, 0);
                              
                              return (
                                <tr key={category.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {category.name || 'Bilinmeyen Kategori'}
                                  </td>
                                  <td className={`px-6 py-4 text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {category.description || '-'}
                                  </td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {category.productCount || 0}
                                  </td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {categoryTotalValue ? `${categoryTotalValue.toFixed(2)} ₺` : '0 ₺'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      (category.productCount || 0) > 0
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {(category.productCount || 0) > 0 ? 'Aktif' : 'Pasif'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                         </tbody>
                       </table>
                     </div>
                   ) : (
                     <div className="text-center py-12">
                       <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
                       <h3 className={`mt-2 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                         Kategori bulunamadı
                       </h3>
                       <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                         Seçilen filtreler için kategori bulunmuyor.
                       </p>
                     </div>
                   )}
                 </div>
               </div>
             )}

                                         {/* Kritik Stok Raporu Detay Sayfası */}
               {selectedReport === 'critical-stock' && (
                 <div className="space-y-6">

                  {/* Filtreler */}
                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center mb-4">
                      <FunnelIcon className="h-5 w-5 mr-2 text-gray-500" />
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filtreler</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Arama */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Arama
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Ürün adı veya kategori..."
                            value={criticalSearchTerm}
                            onChange={(e) => setCriticalSearchTerm(e.target.value)}
                            className={`w-full px-3 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                          />
                          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      {/* Durum Filtresi */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Durum
                        </label>
                        <select
                          value={criticalFilterStatus}
                          onChange={(e) => setCriticalFilterStatus(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="all">Tümü</option>
                          <option value="out-of-stock">Stok Tükendi</option>
                          <option value="critical">Kritik Seviye</option>
                          <option value="low">Düşük Stok</option>
                        </select>
                      </div>

                      {/* Sıralama Alanı */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Sıralama Alanı
                        </label>
                        <select
                          value={criticalSortBy}
                          onChange={(e) => setCriticalSortBy(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="stockQuantity">Mevcut Stok</option>
                          <option value="name">Ürün Adı</option>
                          <option value="requiredQuantity">Gerekli Miktar</option>
                        </select>
                      </div>

                      {/* Sıralama Yönü */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Sıralama Yönü
                        </label>
                        <select
                          value={criticalSortOrder}
                          onChange={(e) => setCriticalSortOrder(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="asc">Artan</option>
                          <option value="desc">Azalan</option>
                        </select>
                      </div>
                    </div>
                  </div>

                 {/* Kritik Stok Tablosu */}
                 <div className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                   <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                     <div className="flex items-center justify-between">
                       <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                         Kritik Stok Ürünleri ({filteredAndSortedCriticalProducts.length} kayıt)
                       </h3>
                       <div className="flex space-x-2">
                         <button
                           onClick={downloadCriticalStockXLSX}
                           className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                             darkMode 
                               ? 'bg-green-700 hover:bg-green-600 text-white' 
                               : 'bg-green-100 hover:bg-green-200 text-green-700'
                           }`}
                         >
                           <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                           Excel
                         </button>
                         <button
                           onClick={downloadCriticalStockPDF}
                           className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                             darkMode 
                               ? 'bg-red-700 hover:bg-red-600 text-white' 
                               : 'bg-red-100 hover:bg-red-200 text-red-700'
                           }`}
                         >
                           <DocumentTextIcon className="h-4 w-4 mr-2" />
                           PDF
                         </button>
                       </div>
                     </div>
                   </div>
                   
                   {criticalLoading ? (
                     <div className="text-center py-12">
                       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                       <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Kritik stok ürünleri yükleniyor...</p>
                     </div>
                   ) : filteredAndSortedCriticalProducts.length > 0 ? (
                     <div className="overflow-x-auto">
                       <table className="min-w-full divide-y divide-gray-200">
                                                   <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                            <tr>
                              <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                Ürün Adı
                              </th>
                              <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                Kategori
                              </th>
                              <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                Mevcut Stok
                              </th>
                              <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                Minimum Stok
                              </th>
                              <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                Gerekli Miktar
                              </th>
                              <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                Durum
                              </th>
                            </tr>
                          </thead>
                         <tbody className={`divide-y ${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                                                       {filteredAndSortedCriticalProducts.map((product) => (
                              <tr key={product.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {product.name || 'Bilinmeyen Ürün'}
                                </td>
                                <td className={`px-6 py-4 text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                  {product.categoryName || 'Bilinmeyen Kategori'}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {product.stockQuantity || 0}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {product.criticalStockLevel || 0}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {product.requiredQuantity || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    product.stockStatus === 'Stok Tükendi'
                                      ? 'bg-red-100 text-red-800'
                                      : product.stockStatus === 'Kritik Seviye'
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {product.stockStatus || '-'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                         </tbody>
                       </table>
                     </div>
                   ) : (
                     <div className="text-center py-12">
                       <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                       <h3 className={`mt-2 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                         Kritik stok ürünü bulunamadı
                       </h3>
                       <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                         Seçilen filtreler için kritik stok ürünü bulunmuyor.
                       </p>
                     </div>
                   )}
                 </div>
               </div>
             )}

            {/* Ürünler Raporu Detay Sayfası */}
            {selectedReport === 'products' && (
              <div className="space-y-6">
                {/* İstatistik Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <CubeIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Ürün</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getProductsStats().totalProducts}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <ChartBarIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Aktif Ürün</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getProductsStats().activeProducts}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Stokta Olan</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getProductsStats().inStock}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <ChartBarIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Değer</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getProductsStats().totalValue ? `${getProductsStats().totalValue.toFixed(2)} ₺` : '0 ₺'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filtreler */}
                <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center mb-4">
                    <FunnelIcon className="h-5 w-5 mr-2 text-gray-500" />
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filtreler</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {/* Arama */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Arama
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Ürün adı, açıklama..."
                          value={productsSearchTerm}
                          onChange={(e) => setProductsSearchTerm(e.target.value)}
                          className={`w-full px-3 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Kategori Filtresi */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Kategori
                      </label>
                      <select
                        value={productsFilterCategory}
                        onChange={(e) => setProductsFilterCategory(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="all">Tüm Kategoriler</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Durum Filtresi */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Durum
                      </label>
                      <select
                        value={productsFilterStatus}
                        onChange={(e) => setProductsFilterStatus(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="all">Tümü</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Pasif</option>
                      </select>
                    </div>

                    {/* Stok Filtresi */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Stok Durumu
                      </label>
                      <select
                        value={productsFilterStock}
                        onChange={(e) => setProductsFilterStock(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="all">Tümü</option>
                        <option value="in-stock">Stokta</option>
                        <option value="out-of-stock">Stok Tükendi</option>
                        <option value="low-stock">Düşük Stok</option>
                      </select>
                    </div>

                    {/* Sıralama Alanı */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Sıralama
                      </label>
                      <select
                        value={productsSortBy}
                        onChange={(e) => setProductsSortBy(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="name">Ürün Adı</option>
                        <option value="stockQuantity">Stok Miktarı</option>
                        <option value="price">Fiyat</option>
                        <option value="categoryName">Kategori</option>
                        <option value="createdAt">Oluşturulma Tarihi</option>
                      </select>
                    </div>

                    {/* Sıralama Yönü */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Yön
                      </label>
                      <select
                        value={productsSortOrder}
                        onChange={(e) => setProductsSortOrder(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="asc">Artan</option>
                        <option value="desc">Azalan</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ürünler Tablosu */}
                <div className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Ürünler ({filteredAndSortedProducts.length} kayıt)
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={downloadProductsXLSX}
                          className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                            darkMode 
                              ? 'bg-green-700 hover:bg-green-600 text-white' 
                              : 'bg-green-100 hover:bg-green-200 text-green-700'
                          }`}
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                          Excel
                        </button>
                        <button
                          onClick={downloadProductsPDF}
                          className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                            darkMode 
                              ? 'bg-red-700 hover:bg-red-600 text-white' 
                              : 'bg-red-100 hover:bg-red-200 text-red-700'
                          }`}
                        >
                          <DocumentTextIcon className="h-4 w-4 mr-2" />
                          PDF
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {productsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Ürünler yükleniyor...</p>
                    </div>
                  ) : filteredAndSortedProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                          <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Ürün Adı
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Açıklama
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Kategori
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Fiyat
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Stok
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Min. Stok
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Durum
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Oluşturulma
                            </th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                          {filteredAndSortedProducts.map((product) => (
                            <tr key={product.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {product.name || 'Bilinmeyen Ürün'}
                              </td>
                              <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                <div className="max-w-xs truncate" title={product.description || '-'}>
                                  {product.description || '-'}
                                </div>
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                {product.categoryName || 'Bilinmeyen Kategori'}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {product.price ? `${product.price.toFixed(2)} ₺` : '0 ₺'}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  (product.stockQuantity || 0) === 0
                                    ? 'bg-red-100 text-red-800'
                                    : (product.stockQuantity || 0) <= 10
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {product.stockQuantity || 0}
                                </span>
                              </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {product.minStockLevel || product.criticalStockLevel || 0}
      </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  product.isActive !== false
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {product.isActive !== false ? 'Aktif' : 'Pasif'}
                                </span>
                              </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
        {product.createdAt ? new Date(product.createdAt).toLocaleDateString('tr-TR') : (product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('tr-TR') : '-')}
      </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className={`mt-2 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Ürün bulunamadı
                      </h3>
                      <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Seçilen filtreler için ürün bulunmuyor.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Kullanıcılar Raporu Detay Sayfası */}
            {selectedReport === 'users' && (
              <div className="space-y-6">
                {/* İstatistik Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <UsersIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Kullanıcı</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getUsersStats().totalUsers}
                        </p>
                      </div>
                    </div>
                  </div>
                  

                  
                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-red-100 rounded-lg">
                        <UserGroupIcon className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Admin</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getUsersStats().adminUsers}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <UserGroupIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Yönetici</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getUsersStats().managerUsers}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <UserGroupIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Personel</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getUsersStats().userUsers}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filtreler */}
                <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center mb-4">
                    <FunnelIcon className="h-5 w-5 mr-2 text-gray-500" />
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filtreler</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Arama */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Arama
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Kullanıcı adı, e-posta..."
                          value={usersSearchTerm}
                          onChange={(e) => setUsersSearchTerm(e.target.value)}
                          className={`w-full px-3 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Tarih Aralığı - Başlangıç */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Başlangıç Tarihi
                      </label>
                      <input
                        type="date"
                        value={usersDateRange.startDate}
                        onChange={(e) => setUsersDateRange({...usersDateRange, startDate: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    {/* Tarih Aralığı - Bitiş */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Bitiş Tarihi
                      </label>
                      <input
                        type="date"
                        value={usersDateRange.endDate}
                        onChange={(e) => setUsersDateRange({...usersDateRange, endDate: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    {/* Rol Filtresi */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Rol
                      </label>
                      <select
                        value={usersFilterRole}
                        onChange={(e) => setUsersFilterRole(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="all">Tümü</option>
                        <option value="Admin">Admin</option>
                        <option value="Yönetici">Yönetici</option>
                        <option value="Personel">Personel</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Kullanıcılar Tablosu */}
                <div className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Kullanıcılar ({users.length} kullanıcı)
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={downloadUsersXLSX}
                          className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                            darkMode 
                              ? 'bg-green-700 hover:bg-green-600 text-white' 
                              : 'bg-green-100 hover:bg-green-200 text-green-700'
                          }`}
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                          Excel
                        </button>
                        <button
                          onClick={downloadUsersPDF}
                          className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                            darkMode 
                              ? 'bg-red-700 hover:bg-red-600 text-white' 
                              : 'bg-red-100 hover:bg-red-200 text-red-700'
                          }`}
                        >
                          <DocumentTextIcon className="h-4 w-4 mr-2" />
                          PDF
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {usersLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Kullanıcılar yükleniyor...</p>
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
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Kayıt Tarihi
                            </th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                          {users.map((user) => (
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
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className={`mt-2 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Kullanıcı bulunamadı
                      </h3>
                      <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Seçilen filtreler için kullanıcı bulunmuyor.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Son Hareketler Raporu Detay Sayfası */}
            {selectedReport === 'recent-activities' && (
              <div className="space-y-6">
                {/* İstatistik Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <ClockIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Hareket</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getRecentActivitiesStats().totalActivities}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <CalendarDaysIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Bugün</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getRecentActivitiesStats().todayActivities}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <ChartBarIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Bu Hafta</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getRecentActivitiesStats().thisWeekActivities}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>



                {/* Filtreler */}
                <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center mb-4">
                    <FunnelIcon className="h-5 w-5 mr-2 text-gray-500" />
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filtreler</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Arama */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Arama
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Açıklama, işlem, kullanıcı..."
                          value={recentActivitiesSearchTerm}
                          onChange={(e) => setRecentActivitiesSearchTerm(e.target.value)}
                          className={`w-full px-3 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Tip Filtresi */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        İşlem Tipi
                      </label>
                      <select
                        value={recentActivitiesFilterType}
                        onChange={(e) => setRecentActivitiesFilterType(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="all">Tümü</option>
                        <option value="stock_movement">Stok Hareketi</option>
                        <option value="product_added">Ürün Eklendi</option>
                        <option value="product_updated">Ürün Güncellendi</option>
                        <option value="product_deleted">Ürün Silindi</option>
                        <option value="login">Giriş</option>
                        <option value="logout">Çıkış</option>
                        <option value="sale">Satış</option>
                        <option value="return">İade</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Son Hareketler Tablosu */}
                <div className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Son Hareketler ({filteredAndSortedRecentActivities.length} kayıt)
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={downloadRecentActivitiesXLSX}
                          className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                            darkMode 
                              ? 'bg-green-700 hover:bg-green-600 text-white' 
                              : 'bg-green-100 hover:bg-green-200 text-green-700'
                          }`}
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                          Excel
                        </button>
                        <button
                          onClick={downloadRecentActivitiesPDF}
                          className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                            darkMode 
                              ? 'bg-red-700 hover:bg-red-600 text-white' 
                              : 'bg-red-100 hover:bg-red-200 text-red-700'
                          }`}
                        >
                          <DocumentTextIcon className="h-4 w-4 mr-2" />
                          PDF
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {recentActivitiesLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Son hareketler yükleniyor...</p>
                    </div>
                  ) : filteredAndSortedRecentActivities.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                      {filteredAndSortedRecentActivities.map((activity) => (
                        <div key={activity.id} className={`flex items-start space-x-3 p-4 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
                          <div className="flex-shrink-0">
                            {activity.type === 'login' && (
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                              </div>
                            )}
                            {activity.type === 'logout' && (
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                              </div>
                            )}
                            {activity.type === 'product_added' && (
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </div>
                            )}
                            {activity.type === 'product_updated' && (
                              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </div>
                            )}
                            {activity.type === 'product_deleted' && (
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </div>
                            )}
                            {activity.type === 'stock_in' && (
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l4-4m0 0l4 4m-4-4v12" />
                                </svg>
                              </div>
                            )}
                            {activity.type === 'stock_out' && (
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              </div>
                            )}
                            {activity.type === 'sale' && (
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                              </div>
                            )}
                            {activity.type === 'return' && (
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                              </div>
                            )}
                            {activity.type === 'stock_movement' && (
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l4-4m0 0l4 4m-4-4v12" />
                                </svg>
                              </div>
                            )}
                            {!['login', 'logout', 'product_added', 'product_updated', 'product_deleted', 'stock_in', 'stock_out', 'sale', 'return', 'stock_movement'].includes(activity.type) && (
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {activity.type === 'login' && (
                                <span><strong>{activity.user}</strong> sisteme giriş yaptı</span>
                              )}
                              {activity.type === 'logout' && (
                                <span><strong>{activity.user}</strong> sistemden çıkış yaptı</span>
                              )}
                              {activity.type === 'product_added' && (
                                <span><strong>{activity.user}</strong> <strong>"{activity.product}"</strong> ürününü ekledi</span>
                              )}
                              {activity.type === 'product_updated' && (
                                <span>
                                  <strong>{activity.user}</strong> 
                                  {activity.changedFields ? (
                                    <> <strong>"{activity.product}"</strong> ürününün <strong>{activity.changedFields}</strong> güncelledi</>
                                  ) : (
                                    <> <strong>"{activity.product}"</strong> ürününü güncelledi</>
                                  )}
                                </span>
                              )}
                              {activity.type === 'product_deleted' && (
                                <span><strong>{activity.user}</strong> <strong>"{activity.product}"</strong> ürününü sildi</span>
                              )}
                              {activity.type === 'stock_in' && (
                                <span><strong>{activity.user}</strong> <strong>"{activity.productName || activity.product}"</strong> için <strong>{activity.quantity || activity.description}</strong> stok girişi yaptı</span>
                              )}
                              {activity.type === 'stock_out' && (
                                <span><strong>{activity.user}</strong> <strong>"{activity.productName || activity.product}"</strong> için <strong>{activity.quantity || activity.description}</strong> stok çıkışı yaptı</span>
                              )}
                              {activity.type === 'sale' && (
                                <span><strong>{activity.user}</strong> <strong>"{activity.product}"</strong> ürününden <strong>{activity.quantity} adet</strong> sattı</span>
                              )}
                              {activity.type === 'return' && (
                                <span><strong>{activity.user}</strong> <strong>"{activity.product}"</strong> ürününden <strong>{activity.quantity} adet</strong> iade aldı</span>
                              )}
                              {activity.type === 'stock_movement' && (
                                <span><strong>{activity.user}</strong> {activity.description}</span>
                              )}
                              {!['login', 'logout', 'product_added', 'product_updated', 'product_deleted', 'stock_in', 'stock_out', 'sale', 'return', 'stock_movement'].includes(activity.type) && (
                                <span><strong>{activity.user}</strong> {activity.description || `${activity.type} işlemi gerçekleştirdi`}</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {activity.date}
                              </div>
                              {activity.status && (
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  activity.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {activity.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-lg font-medium">Son hareket bulunmuyor</p>
                      <p className="text-sm">Sistem kullanılmaya başlandığında burada son hareketler görünecek</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Z Raporu Detay Sayfası */}
            {selectedReport === 'z-report' && (
              <div className="space-y-6">
                {/* Genel Özet Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <CubeIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Ürün</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getZReportStats().summary.totalProducts}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <ChartBarIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Stok Değeri</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getZReportStats().summary.totalStockValue ? `${getZReportStats().summary.totalStockValue.toFixed(2)} ₺` : '0 ₺'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-red-100 rounded-lg">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Kritik Ürünler</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getZReportStats().summary.criticalProducts}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <UsersIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Kullanıcı</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getZReportStats().summary.totalUsers}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detaylı İstatistikler */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sol Kolon */}
                  <div className="space-y-6">
                    {/* Stok Hareketleri */}
                    <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="flex items-center mb-4">
                        <ArrowsRightLeftIcon className="h-5 w-5 mr-2 text-blue-600" />
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Stok Hareketleri</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Hareket</p>
                          <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{getZReportStats().stock.totalMovements}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Giriş Hareketi</p>
                          <p className={`text-xl font-bold text-green-600`}>{getZReportStats().stock.totalIn}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Çıkış Hareketi</p>
                          <p className={`text-xl font-bold text-red-600`}>{getZReportStats().stock.totalOut}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Miktar</p>
                          <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{getZReportStats().stock.totalQuantity}</p>
                        </div>
                      </div>
                    </div>

                    {/* Kategori İstatistikleri */}
                    <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="flex items-center mb-4">
                        <FolderIcon className="h-5 w-5 mr-2 text-purple-600" />
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Kategori İstatistikleri</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Kategori</p>
                          <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{getZReportStats().category.totalCategories}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Ürün</p>
                          <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{getZReportStats().category.totalProducts}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Değer</p>
                          <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{getZReportStats().category.totalValue ? `${getZReportStats().category.totalValue.toFixed(2)} ₺` : '0 ₺'}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Aktif Kategori</p>
                          <p className={`text-xl font-bold text-green-600`}>{getZReportStats().category.activeCategories}</p>
                        </div>
                      </div>
                    </div>

                    {/* Ürün İstatistikleri */}
                    <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="flex items-center mb-4">
                        <CubeIcon className="h-5 w-5 mr-2 text-green-600" />
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ürün İstatistikleri</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Ürün</p>
                          <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{getZReportStats().products.totalProducts}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Aktif Ürün</p>
                          <p className={`text-xl font-bold text-green-600`}>{getZReportStats().products.activeProducts}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Stokta Olan</p>
                          <p className={`text-xl font-bold text-blue-600`}>{getZReportStats().products.inStock}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Stok Tükenen</p>
                          <p className={`text-xl font-bold text-red-600`}>{getZReportStats().products.outOfStock}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sağ Kolon */}
                  <div className="space-y-6">
                    {/* İade İstatistikleri */}
                    <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="flex items-center mb-4">
                        <ArrowPathIcon className="h-5 w-5 mr-2 text-orange-600" />
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>İade İstatistikleri</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam İade</p>
                          <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{getZReportStats().returns.totalReturns}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Bekleyen</p>
                          <p className={`text-xl font-bold text-yellow-600`}>{getZReportStats().returns.pendingReturns}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Tamamlanan</p>
                          <p className={`text-xl font-bold text-green-600`}>{getZReportStats().returns.completedReturns}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Tutar</p>
                          <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{getZReportStats().returns.totalAmount ? `${getZReportStats().returns.totalAmount.toFixed(2)} ₺` : '0 ₺'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Etkinlik İstatistikleri */}
                    <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="flex items-center mb-4">
                        <CalendarDaysIcon className="h-5 w-5 mr-2 text-indigo-600" />
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Etkinlik İstatistikleri</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Etkinlik</p>
                          <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{getZReportStats().events.totalEvents}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Bekleyen</p>
                          <p className={`text-xl font-bold text-yellow-600`}>{getZReportStats().events.pendingEvents}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Tamamlanan</p>
                          <p className={`text-xl font-bold text-green-600`}>{getZReportStats().events.completedEvents}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Bugünkü</p>
                          <p className={`text-xl font-bold text-blue-600`}>{getZReportStats().events.todayEvents}</p>
                        </div>
                      </div>
                    </div>

                    {/* Kullanıcı İstatistikleri */}
                    <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="flex items-center mb-4">
                        <UsersIcon className="h-5 w-5 mr-2 text-teal-600" />
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Kullanıcı İstatistikleri</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Kullanıcı</p>
                          <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{getZReportStats().users.totalUsers}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Aktif Kullanıcı</p>
                          <p className={`text-xl font-bold text-green-600`}>{getZReportStats().users.activeUsers}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Admin</p>
                          <p className={`text-xl font-bold text-red-600`}>{getZReportStats().users.adminUsers}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Yönetici</p>
                          <p className={`text-xl font-bold text-purple-600`}>{getZReportStats().users.managerUsers}</p>
                        </div>
                      </div>
                    </div>

                    {/* Aktivite İstatistikleri */}
                    <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="flex items-center mb-4">
                        <ClockIcon className="h-5 w-5 mr-2 text-yellow-600" />
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Aktivite İstatistikleri</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Aktivite</p>
                          <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{getZReportStats().activities.totalActivities}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Bugünkü</p>
                          <p className={`text-xl font-bold text-blue-600`}>{getZReportStats().activities.todayActivities}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Bu Haftaki</p>
                          <p className={`text-xl font-bold text-green-600`}>{getZReportStats().activities.thisWeekActivities}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>En Aktif Kullanıcı</p>
                          <p className={`text-lg font-bold text-purple-600`}>{getZReportStats().activities.mostActiveUser}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* İndirme Butonları */}
                <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Z Raporu İndir</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Tüm raporların kapsamlı özetini Excel veya PDF formatında indirin</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={downloadZReportXLSX}
                        className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                          darkMode 
                            ? 'bg-green-700 hover:bg-green-600 text-white' 
                            : 'bg-green-100 hover:bg-green-200 text-green-700'
                        }`}
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        Excel İndir
                      </button>
                      <button
                        onClick={downloadZReportPDF}
                        className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                          darkMode 
                            ? 'bg-red-700 hover:bg-red-600 text-white' 
                            : 'bg-red-100 hover:bg-red-200 text-red-700'
                        }`}
                      >
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        PDF İndir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
