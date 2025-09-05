import React, { useState, useEffect, useCallback } from 'react';
import Layout from './Layout';
import { useNavigate } from 'react-router-dom';
import { 
  ExclamationTriangleIcon,
  CubeIcon,
  TruckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  
  // Mevcut kullanıcının rolünü al
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isPersonnel = currentUser.role === 'Personel' || currentUser.role === 'personel';
  
  // State for dashboard data
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    criticalStock: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for dynamic data
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [criticalStock, setCriticalStock] = useState([]);

  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);



  // Fetch dashboard data from API
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Oturum bulunamadı');
        setLoading(false);
        return;
      }

      // Token'ın geçerli olup olmadığını kontrol et
      try {
        const tokenResponse = await fetch('/api/auth/validate-token', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!tokenResponse.ok) {
          console.error('Token geçersiz, login sayfasına yönlendiriliyor...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
      } catch (tokenError) {
        console.error('Token validation error:', tokenError);
        // Token validation başarısız olsa bile devam et
      }





      // Fetch dashboard statistics
      try {
        const statsResponse = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('Dashboard stats loaded:', statsData);
          setStats(statsData);
        } else if (statsResponse.status === 401) {
          console.error('Dashboard stats - Unauthorized, redirecting to login...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        } else {
          console.error('Dashboard stats failed:', statsResponse.status, statsResponse.statusText);
        }
      } catch (statsError) {
        console.error('Dashboard stats fetch error:', statsError);
      }

      // Fetch recent products
      const productsResponse = await fetch('/api/dashboard/recent-products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setRecentProducts(productsData);
        
        // Tüm ürünleri de çek (stok hareketi detaylarında ürün adını bulmak için)
        try {
          const allProductsResponse = await fetch('/api/products', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (allProductsResponse.ok) {
            const allProductsData = await allProductsResponse.json();
            setProducts(allProductsData);
          }
        } catch (productsError) {
          console.error('All products fetch error:', productsError);
        }
      }

      // Ürün güncellemeleri artık audit log'lardan çekiliyor, ayrı API çağrısına gerek yok

      // Fetch recent audit logs (login activities)
      try {
        console.log('📋 Audit log\'lar çekiliyor...');
        const auditLogsResponse = await fetch('/api/AuditLogs', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (auditLogsResponse.ok) {
          const auditLogsData = await auditLogsResponse.json();
          console.log('📋 Audit Logs Data:', auditLogsData); // Debug için
          
          // Tüm audit log aktivitelerini al ve activity formatına çevir
          const allAuditActivities = auditLogsData
            .filter(log => {
              // İlgili aktiviteleri filtrele
              return ['LOGIN', 'LOGOUT', 'INSERT', 'UPDATE', 'DELETE'].includes(log.action) ||
                     log.tableName === 'Products' || 
                     log.tableName === 'Categories' ||
                     log.tableName === 'StockMovements' ||
                     log.tableName === 'Users';
            })
            .slice(0, 20) // Son 20 aktiviteyi al
            .map(log => {
              console.log('Audit Log:', log); // Debug için
              
              // Kullanıcı adını belirle - FullName öncelikli
              let userName = log.user?.fullName || log.user?.FullName || log.user?.name || log.user?.username;
              
              // Eğer user bilgisi yoksa, details'dan UserName'i almaya çalış
              if (!userName && log.details) {
                try {
                  const details = JSON.parse(log.details);
                  if (details.UserName) {
                    userName = details.UserName;
                  }
                } catch (e) {
                  // JSON parse edilemezse devam et
                }
              }
              
              // Son çare olarak mevcut kullanıcıyı kullan
              if (!userName) {
                userName = currentUser && currentUser.fullName ? currentUser.fullName : 'Sistem';
              }
              
              // Ürün adını belirle
              let productName = log.entityName;
              
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
                
                // Ürün adını details'dan al
                if (log.details) {
                  try {
                    const details = JSON.parse(log.details);
                    if (details.ProductName) {
                      productName = details.ProductName;
                    }
                  } catch (e) {
                    // JSON parse edilemezse entityName'i kullan
                  }
                }
                
                activityDescription = `"${productName}" ürününü ekledi`;
              } else if (log.action === 'UPDATE' && log.tableName === 'Products') {
                activityType = 'product_updated';
                
                // Ürün adını details'dan al
                if (log.details) {
                  try {
                    const details = JSON.parse(log.details);
                    if (details.ProductName) {
                      productName = details.ProductName;
                    }
                  } catch (e) {
                    // JSON parse edilemezse entityName'i kullan
                  }
                }
                
                activityDescription = `"${productName}" ürününü güncelledi`;
              } else if (log.action === 'DELETE' && log.tableName === 'Products') {
                activityType = 'product_deleted';
                
                // Ürün adını details'dan al
                if (log.details) {
                  try {
                    const details = JSON.parse(log.details);
                    if (details.ProductName) {
                      productName = details.ProductName;
                    }
                  } catch (e) {
                    // JSON parse edilemezse entityName'i kullan
                  }
                }
                
                activityDescription = `"${productName}" ürününü sildi`;
              } else if (log.action === 'INSERT' && log.tableName === 'Categories') {
                activityType = 'category_added';
                
                // Kategori adını details'dan al
                let categoryName = log.entityName;
                if (log.details) {
                  try {
                    const details = JSON.parse(log.details);
                    if (details.CategoryName) {
                      categoryName = details.CategoryName;
                    }
                  } catch (e) {
                    // JSON parse edilemezse entityName'i kullan
                  }
                }
                
                activityDescription = `"${categoryName}" kategorisini ekledi`;
              } else if (log.action === 'UPDATE' && log.tableName === 'Categories') {
                activityType = 'category_updated';
                
                // Kategori adını details'dan al
                let categoryName = log.entityName;
                if (log.details) {
                  try {
                    const details = JSON.parse(log.details);
                    if (details.CategoryName) {
                      categoryName = details.CategoryName;
                    }
                  } catch (e) {
                    // JSON parse edilemezse entityName'i kullan
                  }
                }
                
                activityDescription = `"${categoryName}" kategorisini güncelledi`;
              } else if (log.action === 'DELETE' && log.tableName === 'Categories') {
                activityType = 'category_deleted';
                
                // Kategori adını details'dan al
                let categoryName = log.entityName;
                if (log.details) {
                  try {
                    const details = JSON.parse(log.details);
                    if (details.CategoryName) {
                      categoryName = details.CategoryName;
                    }
                  } catch (e) {
                    // JSON parse edilemezse entityName'i kullan
                  }
                }
                
                activityDescription = `"${categoryName}" kategorisini sildi`;
              } else if (log.tableName === 'StockMovements') {
                // Stok hareketleri için özel işlem
                activityType = 'stock_movement';
                
                // Stok hareketi detaylarını daha iyi göster
                if (log.details) {
                  // Eğer details'da JSON formatında veri varsa parse et
                  try {
                    const details = JSON.parse(log.details);
                    if (details.ProductId && details.Quantity && details.MovementType) {
                      // Ürün adını bul - önce details'dan ProductName'i al, yoksa yardımcı fonksiyonla bul
                      productName = details.ProductName; // Backend'den gelen ProductName'i öncelikle kullan
                      
                      if (!productName) {
                        // Eğer ProductName yoksa, yardımcı fonksiyonla bul
                        productName = findProductName(details.ProductId);
                      }
                      
                      if (details.MovementType === 'in') {
                        activityDescription = `"${productName}" ürününe ${details.Quantity} adet stok girişi yaptı`;
                      } else if (details.MovementType === 'out') {
                        activityDescription = `"${productName}" ürününden ${details.Quantity} adet stok çıkışı yaptı`;
                      } else {
                        activityDescription = `"${productName}" ürününde ${details.Quantity} adet ${details.MovementType} işlemi gerçekleştirdi`;
                      }
                    } else {
                      activityDescription = log.details;
                    }
                  } catch (e) {
                    // JSON parse edilemezse normal details'ı kullan
                    activityDescription = log.details;
                  }
                } else if (log.action === 'INSERT') {
                  activityDescription = 'yeni stok hareketi ekledi';
                } else if (log.action === 'UPDATE') {
                  activityDescription = 'stok hareketi güncelledi';
                } else if (log.action === 'DELETE') {
                  activityDescription = 'stok hareketi sildi';
                } else {
                  activityDescription = 'stok hareketi gerçekleştirdi';
                }
              } else if (log.tableName === 'Returns') {
                // İade işlemleri için özel işlem
                activityType = 'return';
                
                // İade detaylarını daha iyi göster
                if (log.details) {
                  try {
                    const details = JSON.parse(log.details);
                    if (details.ProductName && details.Quantity && details.ReturnType) {
                      // İade türüne göre farklı mesajlar
                      if (details.ReturnType === 'customer') {
                        activityDescription = `"${details.ProductName}" ürününden ${details.Quantity} adet müşteri iadesi aldı`;
                      } else if (details.ReturnType === 'supplier') {
                        activityDescription = `"${details.ProductName}" ürününden ${details.Quantity} adet tedarikçi iadesi yaptı`;
                      } else {
                        activityDescription = `"${details.ProductName}" ürününden ${details.Quantity} adet ${details.ReturnType} iadesi işlemi gerçekleştirdi`;
                      }
                      
                      // Ürün adını da set et
                      productName = details.ProductName;
                    } else if (details.Message) {
                      // Eğer ProductName yoksa Message'ı kullan
                      activityDescription = details.Message;
                    } else {
                      activityDescription = log.details;
                    }
                  } catch (e) {
                    // JSON parse edilemezse normal details'ı kullan
                    activityDescription = log.details;
                  }
                } else if (log.action === 'INSERT') {
                  activityDescription = 'yeni iade kaydı oluşturdu';
                } else if (log.action === 'UPDATE') {
                  activityDescription = 'iade kaydını güncelledi';
                } else if (log.action === 'DELETE') {
                  activityDescription = 'iade kaydını sildi';
                } else {
                  activityDescription = 'iade işlemi gerçekleştirdi';
                }
              } else {
                // Diğer aktiviteler
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
                timestamp: new Date(log.timestamp), // Timestamp ekle
                description: activityDescription,
                status: 'completed',
                product: productName || log.entityName || log.tableName // Ürün adını ekle
              };
            });

          console.log('All Audit Activities:', allAuditActivities); // Debug için
          
          // Tüm audit aktivitelerini activities'e ekle, duplicate'leri kaldır ve sırala
          console.log('✅ Audit aktiviteleri recentActivities\'e ekleniyor...');
          setRecentActivities(prev => {
            const combined = [...allAuditActivities, ...prev];
            const result = sortActivitiesByTime(removeDuplicateActivities(combined));
            console.log('📝 Yeni recentActivities:', result);
            return result;
          });
        }
      } catch (auditError) {
        console.error('Audit logs fetch error:', auditError);
      }

      // Fetch recent activities - Şimdilik devre dışı bırakıldı
      // const activitiesResponse = await fetch(`${API_BASE_URL}/api/dashboard/recent-activities`, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // });

      // if (activitiesResponse.ok) {
      //   const activitiesData = await activitiesResponse.json();
      //   console.log('Recent Activities Data:', activitiesData); // Debug için
        
      //   // Stok hareketlerini filtrele (çünkü ayrıca StockMovements API'sinden alıyoruz)
      //   const filteredActivities = activitiesData.filter(activity => 
      //     !['stock_in', 'stock_out'].includes(activity.type)
      //   );
        
      //   console.log('Filtered Activities:', filteredActivities); // Debug için
      //   setRecentActivities(filteredActivities);
      // }

      // Activities'i sıfırla - artık ürün güncellemeleri de eklenecek
      // setRecentActivities([]);

      // Fetch critical stock
      try {
        const criticalResponse = await fetch('/api/dashboard/critical-stock', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (criticalResponse.ok) {
          const criticalData = await criticalResponse.json();
          console.log('Critical stock loaded:', criticalData);
          setCriticalStock(criticalData);
        } else if (criticalResponse.status === 401) {
          console.error('Critical stock - Unauthorized, redirecting to login...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        } else {
          console.error('Critical stock failed:', criticalResponse.status, criticalResponse.statusText);
        }
      } catch (criticalError) {
        console.error('Critical stock fetch error:', criticalError);
      }

      // Stok hareketleri artık audit log'lardan çekiliyor, ayrı API çağrısına gerek yok

      // Fetch notifications
      try {
        const notificationsResponse = await fetch('/api/dashboard/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json();
          
          // Local storage'dan okundu bildirimleri al
          const readNotifications = getReadNotificationsFromStorage();
          
          // Bildirimleri okundu durumlarıyla birleştir
          const notificationsWithReadStatus = notificationsData.map(notification => ({
            ...notification,
            read: readNotifications.includes(notification.id)
          }));
          
          setNotifications(notificationsWithReadStatus);
        } else if (notificationsResponse.status === 401) {
          console.error('Notifications - Unauthorized, redirecting to login...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        } else {
          console.error('Notifications failed:', notificationsResponse.status, notificationsResponse.statusText);
        }
      } catch (notificationsError) {
        console.error('Notifications fetch error:', notificationsError);
      }

    } catch (err) {
      console.error('Dashboard veri yükleme hatası:', err);
      setError('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  // Ürün adını bulmak için yardımcı fonksiyon
  const findProductName = (productId) => {
    if (!productId) return 'Bilinmeyen Ürün';
    
    // Önce recentProducts'tan bul
    const recentProduct = recentProducts.find(p => p.id === productId);
    if (recentProduct) {
      return recentProduct.name;
    }
    
    // Sonra products'tan bul
    const product = products.find(p => p.id === productId);
    if (product) {
      return product.name;
    }
    
    // Bulunamazsa ID ile göster
    return `Ürün ${productId}`;
  };

  // 24 saatten eski activities'leri temizle, duplicate'leri kaldır ve timestamp'e göre sırala
  const cleanOldActivities = () => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    setRecentActivities(prev => {
      return removeDuplicateActivities(
        prev
          .filter(activity => {
            // Activity'nin timestamp'ini kullan
            const activityDate = activity.timestamp || new Date(activity.date);
            return activityDate > twentyFourHoursAgo;
          })
          .sort((a, b) => {
            // En yakın saate göre sırala (en yeni önce)
            const timestampA = a.timestamp || new Date(a.date);
            const timestampB = b.timestamp || new Date(b.date);
            return timestampB - timestampA;
          })
      );
    });
  };

  // Aktivite listesini timestamp'e göre sırala
  const sortActivitiesByTime = (activities) => {
    return activities.sort((a, b) => {
      const timestampA = a.timestamp || new Date(a.date);
      const timestampB = b.timestamp || new Date(b.date);
      return timestampB - timestampA; // En yeni önce
    });
  };

  // Duplicate aktiviteleri filtrele
  const removeDuplicateActivities = (activities) => {
    const seen = new Set();
    return activities.filter(activity => {
      // Aktivite için benzersiz bir key oluştur
      const key = `${activity.type}_${activity.user}_${activity.product || activity.productName}_${activity.quantity || ''}_${activity.date}`;
      
      if (seen.has(key)) {
        return false; // Duplicate, filtrele
      }
      
      seen.add(key);
      return true;
    });
  };





  // Component mount olduğunda veri çek
  useEffect(() => {
    fetchDashboardData();
      
      // Her 5 dakikada bir eski activities'leri temizle
      const cleanupInterval = setInterval(() => {
        cleanOldActivities();
      }, 5 * 60 * 1000); // 5 dakika
    
    // Custom event listener for product changes
    const handleProductChange = (event) => {
      console.log('Product change event received!', event.detail); // Debug
      
      // Eğer detaylı bilgi varsa, özel activity oluştur
      if (event.detail && event.detail.productName && event.detail.changedFields) {
        const changeDetails = event.detail;
        const fieldText = changeDetails.changedFields.join(', ');
        
        const customActivity = {
          id: `product_update_${changeDetails.productName}_${Date.now()}_${Math.random()}`,
          type: 'product_updated',
          user: 'Admin', // Custom activity için şimdilik Admin olarak bırakıyoruz
          date: new Date().toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          timestamp: new Date(),
          product: changeDetails.productName,
          changedFields: fieldText,
          status: 'completed'
        };
        
        // Activity'yi ekle, duplicate'leri kaldır ve sırala
        setRecentActivities(prev => {
          const combined = [customActivity, ...prev];
          return sortActivitiesByTime(removeDuplicateActivities(combined));
        });
      }
      
      fetchDashboardData();
    };

    // Custom event listener for stock movement changes
    const handleStockMovementChange = (event) => {
      console.log('Stock movement change event received!', event.detail); // Debug
      
      // Stok hareketi değişikliği olduğunda dashboard'ı güncelle
      if (event.detail && event.detail.type === 'stock_movement') {
        console.log('Stock movement detected, updating dashboard...');
        
        // Dashboard verilerini yeniden çek
        fetchDashboardData();
        
        // Eğer detaylı bilgi varsa, özel activity oluştur
        if (event.detail.productName && event.detail.movementType && event.detail.quantity) {
          const movementDetails = event.detail;
          
          const customActivity = {
            id: `stock_movement_${movementDetails.productName}_${Date.now()}_${Math.random()}`,
            type: 'stock_movement',
            user: movementDetails.userName || 'Sistem',
            date: new Date().toLocaleDateString('tr-TR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            timestamp: new Date(),
            product: movementDetails.productName,
            description: `${movementDetails.movementType === 'in' ? 'Stok girişi' : 'Stok çıkışı'}: ${movementDetails.quantity} adet`,
            status: 'completed'
          };
          
          // Activity'yi ekle, duplicate'leri kaldır ve sırala
          setRecentActivities(prev => {
            const combined = [customActivity, ...prev];
            return sortActivitiesByTime(removeDuplicateActivities(combined));
          });
        }
      }
    };
    
    window.addEventListener('productChanged', handleProductChange);
    window.addEventListener('stockMovementChanged', handleStockMovementChange);
    
    // Gece 12:01'de son hareketleri sıfırla
    const resetActivitiesAtMidnight = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 1, 0, 0); // Gece 12:01:00
      
      const timeUntilMidnight = tomorrow.getTime() - now.getTime();
      
      const midnightTimeout = setTimeout(() => {
        // Son hareketleri sıfırla
        setRecentActivities([]);
        console.log('🕐 Gece 12:01 - Son hareketler otomatik olarak temizlendi');
        
        // Bildirimleri sıfırla
        setNotifications([]);
        localStorage.removeItem('readNotifications');
        console.log('🕐 Gece 12:01 - Bildirimler otomatik olarak temizlendi');
        
        // Her gün gece 12:01'de tekrar çalışması için recursive olarak ayarla
        resetActivitiesAtMidnight();
      }, timeUntilMidnight);
      
      return midnightTimeout;
    };
    
    const midnightTimeout = resetActivitiesAtMidnight();
    
    // Cleanup function
    return () => {
      clearInterval(cleanupInterval);
      clearTimeout(midnightTimeout);
      window.removeEventListener('productChanged', handleProductChange);
      window.removeEventListener('stockMovementChanged', handleStockMovementChange);
    };
  }, [fetchDashboardData]);

  // ESC tuşu ile modal'ları kapat
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setShowAllNotifications(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);


  // Bildirim işleme fonksiyonları
  const handleNotificationClick = (notification) => {
    // Navigate to the specified page
    if (notification.page) {
      navigate(notification.page);
    }
    setShowNotifications(false);
    setShowAllNotifications(false);
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Mark all notifications as read in the backend
        const response = await fetch('/api/notifications/mark-all-read', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Update local state
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          // Clear local storage
          localStorage.removeItem('readNotifications');
        }
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowAllNotifications(false);
    }
  };

  // Local storage functions for notifications
  const getReadNotificationsFromStorage = () => {
    try {
      const readNotifications = localStorage.getItem('readNotifications');
      return readNotifications ? JSON.parse(readNotifications) : [];
    } catch (error) {
      console.error('Error reading read notifications from storage:', error);
      return [];
    }
  };

  const saveReadNotificationsFromStorage = (readNotifications) => {
    try {
      localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
    } catch (error) {
      console.error('Error saving read notifications to storage:', error);
    }
  };

  // Calculate unread notifications count
  const unreadNotifications = notifications.filter(n => !n.read).length;





  const getNotificationIcon = (type) => {
    switch (type) {
      case 'critical':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      case 'success':
        return <CubeIcon className="h-5 w-5 text-green-500" />;
      case 'info':
        return <BellIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getNotificationColorDark = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-900/20 border-red-700';
      case 'warning':
        return 'bg-orange-900/20 border-orange-700';
      case 'success':
        return 'bg-green-900/20 border-green-700';
      case 'info':
        return 'bg-blue-900/20 border-blue-700';
      default:
        return 'bg-blue-900/20 border-blue-700';
    }
  };

  const getStockStatusColor = (current, min) => {
    if (current <= min * 0.3) return 'text-red-600';
    if (current <= min * 0.6) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <Layout>
      <div className={`min-h-screen space-y-6 p-6 dashboard-container ${darkMode ? 'text-white bg-gray-900 dark' : 'text-gray-900 bg-gray-50'}`}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ana Sayfa</h1>
            <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              GoStock Stok Takip Sistemi - Genel Durum
            </p>
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
          </div>
          


        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stats-grid">
          <div className={`rounded-xl shadow-sm border p-6 transition-all duration-200 hover:shadow-md dashboard-card ${
            darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-100 hover:border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l4-4m0 0l4 4m-4-4v12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Stok Miktarı</p>
                {loading ? (
                  <div className="h-8 loading-skeleton rounded mt-1"></div>
                ) : (
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalStock.toLocaleString()}</p>
                )}
                <span className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Tüm ürünlerin stok miktarı toplamı
                </span>
              </div>
            </div>
          </div>

          <div className={`rounded-xl shadow-sm border p-6 transition-all duration-200 hover:shadow-md dashboard-card ${
            darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-100 hover:border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TruckIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Ürün</p>
                {loading ? (
                  <div className="h-8 loading-skeleton rounded mt-1"></div>
                ) : (
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalProducts.toLocaleString()}</p>
                )}
                <span className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Sistemdeki toplam ürün sayısı
                </span>
              </div>
            </div>
          </div>

          <div className={`rounded-xl shadow-sm border p-6 transition-all duration-200 hover:shadow-md dashboard-card ${
            darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-100 hover:border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Kritik Stok</p>
                {loading ? (
                  <div className="h-8 loading-skeleton rounded mt-1"></div>
                ) : (
                  <p className={`text-2xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{stats.criticalStock}</p>
                )}
                <span className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Kritik seviyedeki ürün sayısı
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Recent Activities - Full Width - Sadece Admin ve Yöneticiler için göster */}
          {!isPersonnel && (
            <div className={`rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md dashboard-card ${
              darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-100 hover:border-gray-200'
            }`}>
              <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Son Hareketler</h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Sistemdeki son aktiviteler ve değişiklikler
                </p>
              </div>
              <div className="p-6">
                {recentActivities.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                    {sortActivitiesByTime(removeDuplicateActivities([...recentActivities])).map((activity) => (
                      <div key={activity.id} className={`flex items-start space-x-3 p-4 rounded-lg transition-colors ${
                        darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                      }`}>
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
                              <span><strong>{activity.user}</strong> <strong>"{activity.product}"</strong> için <strong>{activity.quantity || activity.description}</strong> stok girişi yaptı</span>
                            )}
                            {activity.type === 'stock_out' && (
                              <span><strong>{activity.user}</strong> <strong>"{activity.product}"</strong> için <strong>{activity.quantity || activity.description}</strong> stok çıkışı yaptı</span>
                            )}
                            {activity.type === 'sale' && (
                              <span><strong>{activity.user}</strong> <strong>"{activity.product}"</strong> ürününden <strong>{activity.quantity} adet</strong> sattı</span>
                            )}
                            {activity.type === 'return' && (
                              <span><strong>{activity.user}</strong> {activity.description}</span>
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
        </div>

        {/* Critical Stock Section - Bottom */}
        <div className={`rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md dashboard-card ${
          darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-100 hover:border-gray-200'
        }`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <h3 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              Kritik Stoktaki Ürünler
            </h3>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Bu ürünlerin stok seviyeleri kritik seviyede, acil sipariş verilmesi gerekebilir.</p>
          </div>
          <div className="overflow-x-auto table-responsive">
            <table className="min-w-full">
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Ürün Adı</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Kategori</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Mevcut Stok</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Minimum Stok</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Stok Durumu</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Detay</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {criticalStock.map((item) => (
                  <tr key={item.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-red-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-lg font-bold ${darkMode ? 'text-white' : getStockStatusColor(item.currentStock, item.minStock)}`}>
                        {item.currentStock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-600'}`}>{item.minStock}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Kritik
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => navigate('/products')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Detay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>



      {/* All Notifications Modal */}
      {showAllNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleModalBackdropClick}>
          <div className={`rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b ${
              darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xl font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>Tüm Bildirimler</h3>
                  <p className={`text-sm mt-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Toplam {notifications.length} bildirim • {unreadNotifications} okunmamış
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {unreadNotifications > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                        darkMode
                          ? 'text-blue-400 hover:text-blue-300 bg-blue-900/30 hover:bg-blue-900/50'
                          : 'text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100'
                      }`}
                    >
                      Tümünü okundu işaretle
                    </button>
                  )}
                  <button 
                    onClick={() => setShowAllNotifications(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              {notifications.length > 0 ? (
                <div className={`divide-y ${
                  darkMode ? 'divide-gray-700' : 'divide-gray-100'
                }`}>
                  {notifications.map((notification, index) => (
                    <div 
                      key={notification.id} 
                      className={`p-6 transition-all duration-200 cursor-pointer group relative overflow-hidden ${
                        darkMode
                          ? `hover:bg-gray-700 ${
                              !notification.read ? 'bg-blue-900/20 border-l-4 border-blue-500' : 'bg-gray-800'
                            }`
                          : `hover:bg-gray-50 ${
                              !notification.read ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-white'
                            }`
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                      title={`${notification.action} - ${notification.page} sayfasına git`}
                    >
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
                        darkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                      }`}></div>
                      <div className="flex items-start space-x-4 relative z-10">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className={`text-base font-medium ${
                              !notification.read 
                                ? (darkMode ? 'text-white' : 'text-gray-900')
                                : (darkMode ? 'text-gray-300' : 'text-gray-700')
                            }`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-2">
                              {!notification.read && (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  darkMode
                                    ? 'bg-blue-900/50 text-blue-300'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  Yeni
                                </span>
                              )}
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                notification.type === 'critical' 
                                  ? (darkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800')
                                  : notification.type === 'warning' 
                                  ? (darkMode ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800')
                                  : notification.type === 'success' 
                                  ? (darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800')
                                  : (darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800')
                              }`}>
                                {notification.type === 'critical' ? 'Kritik' :
                                 notification.type === 'warning' ? 'Uyarı' :
                                 notification.type === 'success' ? 'Başarılı' :
                                 'Bilgi'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className={`flex items-center space-x-4 text-sm ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {notification.time}
                              </span>
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {notification.pageName}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-medium transition-colors ${
                                  darkMode
                                    ? 'text-blue-400 group-hover:text-blue-300'
                                    : 'text-blue-600 group-hover:text-blue-800'
                                }`}>
                                  {notification.action}
                                </span>
                                <svg className={`w-4 h-4 transition-colors ${
                                  darkMode
                                    ? 'text-blue-500 group-hover:text-blue-400'
                                    : 'text-blue-400 group-hover:text-blue-600'
                                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                              
                              <div className={`text-xs ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                Bildirim #{index + 1}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`p-8 text-center ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <BellIcon className={`h-16 w-16 mx-auto mb-4 ${
                    darkMode ? 'text-gray-600' : 'text-gray-300'
                  }`} />
                  <p className="text-xl font-medium">Bildirim bulunmuyor</p>
                  <p className="text-sm mt-2">Henüz hiç bildirim oluşturulmamış</p>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className={`px-6 py-4 border-t ${
              darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className={`text-sm ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Son güncelleme: {new Date().toLocaleString('tr-TR')}
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setShowAllNotifications(false)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                      darkMode
                        ? 'text-gray-300 bg-gray-600 border border-gray-500 hover:bg-gray-500 focus:ring-offset-gray-800'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-offset-white'
                    }`}
                  >
                    Kapat
                  </button>
                  <button 
                    onClick={() => {
                      markAllAsRead();
                      setShowAllNotifications(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Tümünü Okundu İşaretle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
