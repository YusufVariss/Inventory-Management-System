import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import Layout from './Layout';

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [product, setProduct] = useState(null);

  const API_BASE_URL = 'https://localhost:5001/api';

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setFetching(true);
      const response = await axios.get(`${API_BASE_URL}/products/${id}`);
      const productData = response.data;
      
      setProduct(productData);
      setFormData({
        name: productData.name,
        quantity: productData.quantity.toString(),
        price: productData.price.toString()
      });
    } catch (err) {
      console.error('API Error:', err);
      setErrors({ fetch: 'Ürün yüklenirken bir hata oluştu' });
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ürün adı zorunludur';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Ürün adı en fazla 100 karakter olabilir';
    }

    if (!formData.quantity) {
      newErrors.quantity = 'Miktar zorunludur';
    } else if (parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Miktar 0\'dan büyük olmalıdır';
    }

    if (!formData.price) {
      newErrors.price = 'Fiyat zorunludur';
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = 'Fiyat 0\'dan büyük olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const productData = {
        name: formData.name.trim(),
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price)
      };

      await axios.put(`${API_BASE_URL}/products/${id}`, productData);
      
      // Redirect to products list
      navigate('/products');
    } catch (err) {
      console.error('API Error:', err);
      
      if (err.response?.data) {
        // Backend validation errors
        setErrors({ submit: err.response.data });
      } else {
        setErrors({ submit: 'Ürün güncellenirken bir hata oluştu' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (errors.fetch) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-800">{errors.fetch}</div>
            <button 
              onClick={fetchProduct}
              className="ml-4 text-red-800 underline hover:text-red-600"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">Ürün bulunamadı</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {/* Page header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/products')}
            className={`inline-flex items-center text-sm font-medium ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Geri Dön
          </button>
          <div>
            <h1 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ürün Düzenle</h1>
            <p className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              "{product.name}" ürününün bilgilerini güncelleyin
            </p>
          </div>
        </div>

        {/* Form */}
        <div className={`shadow rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Name */}
              <div>
                <label htmlFor="name" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                    darkMode 
                      ? `bg-gray-700 text-white placeholder-gray-400 ${
                          errors.name 
                            ? 'border-red-500 focus:border-red-400 focus:ring-red-500' 
                            : 'border-gray-600 focus:border-blue-400 focus:ring-blue-500'
                        }`
                      : `bg-white text-gray-900 ${
                          errors.name 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`
                  }`}
                  placeholder="Ürün adını girin"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Miktar *
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 text-sm bg-white text-gray-900 ${
                    errors.quantity 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  } focus:outline-none focus:ring-1`}
                  placeholder="0"
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Fiyat (₺) *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₺</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className={`block w-full pl-7 border rounded-md px-3 py-2 text-sm bg-white text-gray-900 ${
                      errors.price 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } focus:outline-none focus:ring-1`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              {/* Product Info */}
              <div className="bg-gray-50 rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Ürün Bilgileri</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Oluşturulma:</span> {new Date(product.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                  <div>
                    <span className="font-medium">Son Güncelleme:</span> {new Date(product.updatedAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-800">{errors.submit}</p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Güncelleniyor...
                    </>
                  ) : (
                    <>
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Güncelle
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditProduct;
