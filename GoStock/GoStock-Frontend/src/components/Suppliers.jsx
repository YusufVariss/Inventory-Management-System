import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon, 
  TrashIcon, 
  TruckIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://localhost:5107';

const Suppliers = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSupplierId, setDeleteSupplierId] = useState(null);
  const [deleteSupplierName, setDeleteSupplierName] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Get current user info
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'Admin';
  const isManager = currentUser.role === 'manager' || currentUser.role === 'Yönetici';
  const canManageSuppliers = isAdmin || isManager;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Toast mesaj fonksiyonu
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Tedarikçileri çek
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Oturum bulunamadı');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/suppliers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
        setFilteredSuppliers(data);
        setError(null);
      } else {
        setError('Firmalar yüklenirken hata oluştu');
      }
    } catch (err) {
             console.error('Firmalar yükleme hatası:', err);
             setError('Firmalar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Arama fonksiyonu
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSuppliers(suppliers);
    } else {
      const filtered = suppliers.filter(supplier => 
        supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSuppliers(filtered);
    }
  }, [searchTerm, suppliers]);

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
             const dataToSend = {
         ...formData
       };

      if (editingSupplier) {
        // Güncelle
        const response = await fetch(`${API_BASE_URL}/api/suppliers/${editingSupplier.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
          showToast('✅ Firma başarıyla güncellendi!', 'success');
          setEditingSupplier(null);
        } else {
          showToast('Firma güncellenirken hata oluştu', 'error');
        }
      } else {
        // Yeni ekle
        const response = await fetch(`${API_BASE_URL}/api/suppliers`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
          showToast('✅ Firma başarıyla eklendi!', 'success');
        } else {
          showToast('Firma eklenirken hata oluştu', 'error');
        }
      }
      
             // Formu temizle ve paneli kapat
       setFormData({
         name: '',
         contactPerson: '',
         email: '',
         phone: '',
         address: '',
         notes: ''
       });
      setShowAddPanel(false);
      
      // Verileri yenile
      fetchSuppliers();
      
    } catch (err) {
             console.error('Firma işlemi hatası:', err);
             showToast('Firma işlemi sırasında hata oluştu', 'error');
    }
  };

  // Düzenleme
  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || '',
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      notes: supplier.notes || ''
    });
    setShowAddPanel(true);
  };

  // Detay görüntüleme
  const handleViewDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailsModal(true);
  };

  // Silme
  const handleDeleteClick = (supplierId, supplierName) => {
    setDeleteSupplierId(supplierId);
    setDeleteSupplierName(supplierName);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteSupplierId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/suppliers/${deleteSupplierId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showToast('✅ Firma başarıyla silindi!', 'success');
        fetchSuppliers();
             } else {
         showToast('Firma silinirken hata oluştu', 'error');
       }
    } catch (err) {
             console.error('Firma silme hatası:', err);
      showToast('Tedarikçi silinirken hata oluştu', 'error');
    } finally {
      setShowDeleteModal(false);
      setDeleteSupplierId(null);
      setDeleteSupplierName('');
    }
  };



  useEffect(() => {
    fetchSuppliers();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tedarikçiler</h1>
                               <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                   Firma bilgilerini yönetin ve takip edin
                 </p>
              {error && (
                <p className="text-sm mt-1 text-red-600">
                  {error}
                </p>
              )}
            </div>
            
                         {/* Yeni Tedarikçi Ekle Butonu */}
             <button
                               onClick={() => {
                  setShowAddPanel(true);
                  setEditingSupplier(null);
                  setFormData({
                    name: '',
                    contactPerson: '',
                    email: '',
                    phone: '',
                    address: '',
                    notes: ''
                  });
                }}
               className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
             >
                               <PlusIcon className="h-5 w-5 mr-2" />
                Yeni Tedarikçi
             </button>
          </div>

                 {/* Özet Kartları */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <TruckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                                 <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Toplam Tedarikçi</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{suppliers.length}</p>
              </div>
            </div>
          </div>
          
          
          
          
          
          <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Bu Ay</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {suppliers.filter(s => {
                    const createdDate = new Date(s.createdAt || Date.now());
                    const now = new Date();
                    return createdDate.getMonth() === now.getMonth() && 
                           createdDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Yeni Tedarikçi Ekleme Paneli */}
        {showAddPanel && (
          <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <PlusIcon className="h-5 w-5 text-blue-600 mr-2" />
                                 <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                   {editingSupplier ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi Ekle'}
                 </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddPanel(false);
                  setEditingSupplier(null);
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
                     Tedarikçi Adı <span className="text-red-500">*</span>
                   </label>
                   <input
                     type="text"
                     required
                     value={formData.name}
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                     className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                       darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                     }`}
                     placeholder="Tedarikçi adını girin"
                   />
                 </div>

                                 <div>
                   <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                     Yetkili Kişi
                   </label>
                   <input
                     type="text"
                     value={formData.contactPerson}
                     onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                     className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                       darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                     }`}
                     placeholder="Yetkili kişiyi girin"
                   />
                 </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="E-posta adresini girin"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Telefon numarasını girin"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Adres
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows="2"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Adres bilgisini girin"
                  />
                </div>

                
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notlar
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Ek notlarınızı girin"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPanel(false);
                    setEditingSupplier(null);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    darkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingSupplier ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        )}

                 {/* Tedarikçiler Listesi */}
         <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
           <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                            <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                 Tedarikçi Listesi
               </h3>
             
             {/* Arama */}
             <div className="relative">
               <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                   type="text"
                   placeholder="Firma ara..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className={`pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                     darkMode 
                       ? 'bg-gray-700 border-gray-600 text-white' 
                       : 'bg-white border-gray-300 text-gray-900'
                   }`}
                 />
             </div>
           </div>

          {filteredSuppliers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                                 <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                   <tr>
                     <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                       ID
                     </th>
                                           <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Firma Adı
                      </th>
                     <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                       Email
                     </th>
                     <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                       Telefon
                     </th>
                     <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                       Adres
                     </th>
                     <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                       İşlemler
                     </th>
                   </tr>
                 </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                     {filteredSuppliers.map((supplier) => (
                     <tr key={supplier.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                           #{supplier.id}
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                           {supplier.name}
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                           {supplier.email || '-'}
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                           {supplier.phone || '-'}
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                           {supplier.address || '-'}
                         </div>
                       </td>
                                               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(supplier)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors"
                              title="Detay"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                                                         <button
                               onClick={() => handleEdit(supplier)}
                               className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50 transition-colors"
                               title="Düzenle"
                             >
                               <PencilIcon className="h-4 w-4" />
                             </button>
                             <button
                               onClick={() => handleDeleteClick(supplier.id, supplier.name)}
                               className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
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
          ) : (
            <div className="text-center py-12">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
                             <h3 className="mt-2 text-sm font-medium text-gray-900">Firma bulunamadı</h3>
               <p className="mt-1 text-sm text-gray-500">
                 {searchTerm ? 'Arama kriterlerinize uygun firma bulunamadı.' : 'İlk firmanızı ekleyerek başlayın.'}
               </p>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span>{toast.type === 'success' ? '✅' : '❌'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

             {/* Delete Confirmation Modal */}
       {showDeleteModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className={`rounded-xl w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
             <div className="p-6">
               <div className="flex items-center mb-4">
                 <div className="flex-shrink-0">
                   <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                 </div>
                 <div className="ml-3">
                   <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Firma Sil</h3>
                 </div>
               </div>
               
               <div className="mb-6">
                 <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                   "{deleteSupplierName}" adlı firmayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                 </p>
               </div>
               
               <div className="flex justify-end space-x-3">
                 <button
                   onClick={() => setShowDeleteModal(false)}
                   className={`px-4 py-2 border text-sm font-medium rounded-md transition-colors ${
                     darkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                   }`}
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

       {/* Supplier Details Modal */}
       {showDetailsModal && selectedSupplier && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className={`rounded-xl w-full max-w-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
             <div className="p-6">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center">
                   <BuildingOfficeIcon className="h-6 w-6 text-blue-600 mr-3" />
                                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                   Firma Detayları
                 </h3>
                 </div>
                 <button
                   onClick={() => setShowDetailsModal(false)}
                   className={`transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   <XMarkIcon className="h-6 w-6" />
                 </button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div>
                    <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>Firma Adı</h4>
                    <p className={`text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedSupplier.name}</p>
                  </div>
                 
                                   <div>
                    <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>Yetkili Kişi</h4>
                    <p className={`text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedSupplier.contactPerson || '-'}</p>
                  </div>
                 
                 <div>
                   <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>E-posta</h4>
                   <p className={`text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedSupplier.email || '-'}</p>
                 </div>
                 
                 <div>
                   <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>Telefon</h4>
                   <p className={`text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedSupplier.phone || '-'}</p>
                 </div>
                 
                 <div className="md:col-span-2">
                   <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>Adres</h4>
                   <p className={`text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedSupplier.address || '-'}</p>
                 </div>
                 
                 
                 
                 {selectedSupplier.notes && (
                   <div className="md:col-span-2">
                     <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>Notlar</h4>
                     <p className={`text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedSupplier.notes}</p>
                   </div>
                 )}
               </div>
               
               <div className="flex justify-end mt-6">
                 <button
                   onClick={() => setShowDetailsModal(false)}
                   className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                     darkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                   }`}
                 >
                   Kapat
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
    </Layout>
  );
};

export default Suppliers;
