import { useState } from 'react';
import { 
  ArrowDownIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const StockOut = () => {
  const [stockOutTransactions, setStockOutTransactions] = useState([
    {
      id: 1,
      productName: 'iPhone 13 Kılıfı',
      category: 'Aksesuar',
      quantity: 5,
      unitPrice: 35,
      totalPrice: 175,
      customer: 'Ahmet Yılmaz',
      type: 'sale',
      date: '2024-01-15',
      status: 'completed',
      notes: 'Online satış'
    },
    {
      id: 2,
      productName: 'Laptop Şarj Cihazı',
      category: 'Elektronik',
      quantity: 2,
      unitPrice: 45,
      totalPrice: 90,
      customer: 'Fatma Demir',
      type: 'sale',
      date: '2024-01-14',
      status: 'pending',
      notes: 'Mağaza satışı'
    },
    {
      id: 3,
      productName: 'Mouse Pad',
      category: 'Aksesuar',
      quantity: 20,
      unitPrice: 18,
      totalPrice: 360,
      customer: 'Office Supplies Co.',
      type: 'transfer',
      date: '2024-01-13',
      status: 'completed',
      notes: 'Şube transferi'
    }
  ]);

  const [showAddStockOut, setShowAddStockOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [newStockOut, setNewStockOut] = useState({
    productName: '',
    category: '',
    quantity: '',
    unitPrice: '',
    customer: '',
    type: 'sale',
    notes: ''
  });

  const categories = ['Aksesuar', 'Elektronik', 'Kablo', 'Giriş Cihazı', 'Diğer'];
  const customers = ['Ahmet Yılmaz', 'Fatma Demir', 'Mehmet Öz', 'Office Supplies Co.', 'Digital World Ltd.'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'sale': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'transfer': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200';
      case 'damaged': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'sale': return 'Satış';
      case 'transfer': return 'Transfer';
      case 'damaged': return 'Hasar';
      default: return type;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sale': return UserIcon;
      case 'transfer': return BuildingOfficeIcon;
      default: return UserIcon;
    }
  };

  const filteredTransactions = stockOutTransactions.filter(transaction => {
    const matchesSearch = transaction.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesCategory;
  });

  const handleAddStockOut = () => {
    if (newStockOut.productName && newStockOut.quantity && newStockOut.unitPrice && newStockOut.customer) {
      const transaction = {
        id: Date.now(),
        ...newStockOut,
        quantity: parseInt(newStockOut.quantity),
        unitPrice: parseFloat(newStockOut.unitPrice),
        totalPrice: parseInt(newStockOut.quantity) * parseFloat(newStockOut.unitPrice),
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      setStockOutTransactions([...stockOutTransactions, transaction]);
      setNewStockOut({
        productName: '',
        category: '',
        quantity: '',
        unitPrice: '',
        customer: '',
        type: 'sale',
        notes: ''
      });
      setShowAddStockOut(false);
    }
  };

  const updateTransactionStatus = (id, newStatus) => {
    setStockOutTransactions(stockOutTransactions.map(transaction => 
      transaction.id === id ? { ...transaction, status: newStatus } : transaction
    ));
  };

  const getTotalValue = () => {
    return stockOutTransactions.reduce((total, transaction) => total + transaction.totalPrice, 0);
  };

  const getTransactionsByStatus = (status) => {
    return stockOutTransactions.filter(transaction => transaction.status === status).length;
  };

  const getTransactionsByType = (type) => {
    return stockOutTransactions.filter(transaction => transaction.type === type).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stok Çıkışı</h1>
          <p className="text-gray-600 dark:text-gray-400">Satış ve transfer işlemlerini yönetin</p>
        </div>
        <button
          onClick={() => setShowAddStockOut(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mt-4 sm:mt-0"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Stok Çıkışı Ekle
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <ArrowDownIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam İşlem</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stockOutTransactions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bekleyen</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{getTransactionsByStatus('pending')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tamamlanan</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{getTransactionsByStatus('completed')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <DocumentTextIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Değer</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₺{getTotalValue().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">İşlem Türlerine Göre</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Satış</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{getTransactionsByType('sale')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Transfer</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{getTransactionsByType('transfer')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Hasar</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{getTransactionsByType('damaged')}</span>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Son İşlemler</h3>
          <div className="space-y-2">
            {stockOutTransactions.slice(0, 3).map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 truncate">{transaction.productName}</span>
                <span className="text-gray-900 dark:text-white">₺{transaction.totalPrice}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Ürün veya müşteri ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tüm Türler</option>
            <option value="sale">Satış</option>
            <option value="transfer">Transfer</option>
            <option value="damaged">Hasar</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="pending">Beklemede</option>
            <option value="completed">Tamamlandı</option>
            <option value="cancelled">İptal Edildi</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  İşlem Türü
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ürün
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Miktar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Birim Fiyat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Toplam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((transaction) => {
                const TypeIcon = getTypeIcon(transaction.type);
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TypeIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(transaction.type)}`}>
                          {getTypeLabel(transaction.type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{transaction.productName}</div>
                      {transaction.notes && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{transaction.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {transaction.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {transaction.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ₺{transaction.unitPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ₺{transaction.totalPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {transaction.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                        {getStatusLabel(transaction.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {transaction.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateTransactionStatus(transaction.id, 'completed')}
                              className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-900/30"
                            >
                              Onayla
                            </button>
                            <button
                              onClick={() => updateTransactionStatus(transaction.id, 'cancelled')}
                              className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-900/30"
                            >
                              İptal Et
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Out Modal */}
      {showAddStockOut && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Yeni Stok Çıkışı</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    İşlem Türü
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setNewStockOut({...newStockOut, type: 'sale'})}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        newStockOut.type === 'sale'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Satış
                    </button>
                    <button
                      onClick={() => setNewStockOut({...newStockOut, type: 'transfer'})}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        newStockOut.type === 'transfer'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Transfer
                    </button>
                    <button
                      onClick={() => setNewStockOut({...newStockOut, type: 'damaged'})}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        newStockOut.type === 'damaged'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Hasar
                    </button>
                  </div>
                </div>
                
                <input
                  type="text"
                  placeholder="Ürün Adı"
                  value={newStockOut.productName}
                  onChange={(e) => setNewStockOut({...newStockOut, productName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <select
                  value={newStockOut.category}
                  onChange={(e) => setNewStockOut({...newStockOut, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Miktar"
                  value={newStockOut.quantity}
                  onChange={(e) => setNewStockOut({...newStockOut, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Birim Fiyat (₺)"
                  value={newStockOut.unitPrice}
                  onChange={(e) => setNewStockOut({...newStockOut, unitPrice: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <select
                  value={newStockOut.customer}
                  onChange={(e) => setNewStockOut({...newStockOut, customer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Müşteri Seçin</option>
                  {customers.map(customer => (
                    <option key={customer} value={customer}>{customer}</option>
                  ))}
                </select>
                <textarea
                  placeholder="Notlar"
                  value={newStockOut.notes}
                  onChange={(e) => setNewStockOut({...newStockOut, notes: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddStockOut}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
                >
                  Ekle
                </button>
                <button
                  onClick={() => setShowAddStockOut(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockOut;
