import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Pie, Doughnut, Line } from 'react-chartjs-2';

// Chart.js bileşenlerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CategoryDistributionChart = () => {
  const [chartType, setChartType] = useState('pie');

  // Örnek kategori verisi - gerçek uygulamada API'den gelecek
  const categoryData = {
    labels: [
      '📱 Elektronik',
      '👕 Giyim',
      '🏠 Ev & Yaşam',
      '📚 Kitap & Hobi',
      '🏥 Sağlık & Kozmetik',
      '🚗 Otomotiv',
      '🎮 Oyuncak & Spor',
      '🍽️ Gıda & İçecek'
    ],
    datasets: [
      {
        data: [25, 20, 15, 12, 10, 8, 6, 4],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Elektronik - Mavi
          'rgba(34, 197, 94, 0.8)',    // Giyim - Yeşil
          'rgba(168, 85, 247, 0.8)',   // Ev & Yaşam - Mor
          'rgba(251, 146, 60, 0.8)',   // Kitap & Hobi - Turuncu
          'rgba(236, 72, 153, 0.8)',   // Sağlık - Pembe
          'rgba(239, 68, 68, 0.8)',    // Otomotiv - Kırmızı
          'rgba(16, 185, 129, 0.8)',   // Oyuncak - Yeşil
          'rgba(245, 158, 11, 0.8)',   // Gıda - Sarı
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(168, 85, 247)',
          'rgb(251, 146, 60)',
          'rgb(236, 72, 153)',
          'rgb(239, 68, 68)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
        ],
        borderWidth: 2,
        hoverOffset: 4,
      }
    ]
  };

  // Kategori detay verileri
  const categoryDetails = {
    '📱 Elektronik': {
      productCount: 1250,
      totalValue: 1250000,
      topProducts: ['Telefon', 'Laptop', 'Tablet', 'Kulaklık'],
      growth: '+15%',
      color: 'blue'
    },
    '👕 Giyim': {
      productCount: 980,
      totalValue: 450000,
      topProducts: ['T-Shirt', 'Pantolon', 'Elbise', 'Ceket'],
      growth: '+8%',
      color: 'green'
    },
    '🏠 Ev & Yaşam': {
      productCount: 750,
      totalValue: 380000,
      topProducts: ['Mobilya', 'Dekorasyon', 'Mutfak', 'Bahçe'],
      growth: '+12%',
      color: 'purple'
    },
    '📚 Kitap & Hobi': {
      productCount: 600,
      totalValue: 120000,
      topProducts: ['Roman', 'Bilim', 'Sanat', 'Müzik'],
      growth: '+5%',
      color: 'orange'
    },
    '🏥 Sağlık & Kozmetik': {
      productCount: 500,
      totalValue: 250000,
      topProducts: ['Vitamin', 'Krem', 'Şampuan', 'Parfüm'],
      growth: '+18%',
      color: 'pink'
    },
    '🚗 Otomotiv': {
      productCount: 400,
      totalValue: 180000,
      topProducts: ['Yedek Parça', 'Aksesuar', 'Bakım', 'Temizlik'],
      growth: '+10%',
      color: 'red'
    },
    '🎮 Oyuncak & Spor': {
      productCount: 300,
      totalValue: 90000,
      topProducts: ['Oyuncak', 'Spor Ekipmanı', 'Oyun', 'Fitness'],
      growth: '+22%',
      color: 'emerald'
    },
    '🍽️ Gıda & İçecek': {
      productCount: 200,
      totalValue: 80000,
      topProducts: ['Konserve', 'İçecek', 'Atıştırmalık', 'Baharat'],
      growth: '+6%',
      color: 'yellow'
    }
  };

  // Trend verisi (son 6 ay)
  const trendData = {
    labels: ['Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
    datasets: [
      {
        label: '📱 Elektronik',
        data: [22, 24, 25, 26, 25, 25],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
      {
        label: '👕 Giyim',
        data: [18, 19, 20, 20, 20, 20],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
      {
        label: '🏠 Ev & Yaşam',
        data: [14, 15, 15, 15, 15, 15],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      }
    ]
  };

  // Chart seçenekleri
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: '📊 Kategori Dağılımı',
        font: {
          size: 18,
          weight: 'bold'
        },
        color: '#374151'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (%${percentage})`;
          }
        }
      }
    }
  };

  // Trend chart seçenekleri
  const trendOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: '📈 Kategori Trend Analizi (Son 6 Ay)',
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#374151'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += '%' + context.parsed.y;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: '📅 Ay',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: '📊 Pazar Payı (%)',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        min: 0,
        max: 30,
        ticks: {
          callback: function(value) {
            return '%' + value;
          }
        }
      }
    }
  };

  // Toplam istatistikler
  const totalStats = {
    totalCategories: categoryData.labels.length,
    totalProducts: Object.values(categoryDetails).reduce((sum, cat) => sum + cat.productCount, 0),
    totalValue: Object.values(categoryDetails).reduce((sum, cat) => sum + cat.totalValue, 0),
    avgProductsPerCategory: Math.round(Object.values(categoryDetails).reduce((sum, cat) => sum + cat.productCount, 0) / categoryData.labels.length)
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          📊 Kategori Dağılımı Analizi
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Ürün kategorilerinin dağılımı ve performans analizi
        </p>
      </div>

      {/* Özet İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <span className="text-2xl">📂</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Kategori</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalStats.totalCategories}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Ürün</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {totalStats.totalProducts.toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Değer</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ₺{totalStats.totalValue.toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ortalama Ürün</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {totalStats.avgProductsPerCategory.toLocaleString('tr-TR')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">kategori başına</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Türü Seçimi */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            📊 Kategori Dağılım Grafiği
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setChartType('pie')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                chartType === 'pie'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              🥧 Pasta Grafik
            </button>
            <button
              onClick={() => setChartType('doughnut')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                chartType === 'doughnut'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              🍩 Halka Grafik
            </button>
          </div>
        </div>
        
        <div className="h-96 flex items-center justify-center">
          {chartType === 'pie' ? (
            <Pie data={categoryData} options={chartOptions} />
          ) : (
            <Doughnut data={categoryData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Trend Analizi */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            📈 Kategori Trend Analizi
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            En popüler 3 kategorinin son 6 aydaki pazar payı değişimi
          </p>
        </div>
        <div className="h-80">
          <Line data={trendData} options={trendOptions} />
        </div>
      </div>

      {/* Kategori Detayları */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          📋 Kategori Detayları
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(categoryDetails).map(([category, details]) => (
            <div key={category} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {category}
                </h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  details.growth.startsWith('+') 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                }`}>
                  {details.growth}
                </span>
              </div>
              
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Ürün Sayısı:</span>
                  <span className="font-medium">{details.productCount.toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Toplam Değer:</span>
                  <span className="font-medium">₺{details.totalValue.toLocaleString('tr-TR')}</span>
                </div>
                <div className="pt-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Popüler Ürünler:</span>
                  <div className="mt-1 space-y-1">
                    {details.topProducts.slice(0, 3).map((product, index) => (
                      <div key={index} className="text-xs text-gray-500 dark:text-gray-400">
                        • {product}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grafik Açıklamaları */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📋 Grafik Açıklamaları
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">🥧 Pasta Grafik</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Kategorilerin toplam pazar payı</li>
              <li>• Renk kodlu kategoriler</li>
              <li>• Hover'da detaylı bilgi</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">🍩 Halka Grafik</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Merkez alan kullanımı</li>
              <li>• Daha modern görünüm</li>
              <li>• Aynı veri, farklı stil</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">📈 Trend Analizi</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Zaman içindeki değişim</li>
              <li>• En popüler 3 kategori</li>
              <li>• Pazar payı yüzdeleri</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">📊 İstatistikler</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Toplam kategori sayısı</li>
              <li>• Toplam ürün sayısı</li>
              <li>• Toplam değer ve ortalamalar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDistributionChart;
