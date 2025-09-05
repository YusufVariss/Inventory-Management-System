import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Chart.js bileşenlerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TopProductsChart = () => {
  const [chartType, setChartType] = useState('bar');

  // Örnek ürün verisi - gerçek uygulamada API'den gelecek
  const topProducts = [
    {
      name: 'iPhone 15 Pro',
      category: '📱 Elektronik',
      sales: 1250,
      revenue: 1875000,
      stock: 45,
      growth: '+23%',
      color: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      trend: [120, 135, 142, 158, 167, 180, 195, 210, 225, 240, 255, 270]
    },
    {
      name: 'Nike Air Max',
      category: '👟 Spor Ayakkabı',
      sales: 980,
      revenue: 784000,
      stock: 32,
      growth: '+18%',
      color: 'rgba(34, 197, 94, 0.8)',
      borderColor: 'rgb(34, 197, 94)',
      trend: [95, 108, 115, 125, 135, 145, 155, 165, 175, 185, 195, 205]
    },
    {
      name: 'Samsung 4K TV',
      category: '📺 Ev Elektroniği',
      sales: 750,
      revenue: 1125000,
      stock: 28,
      growth: '+15%',
      color: 'rgba(168, 85, 247, 0.8)',
      borderColor: 'rgb(168, 85, 247)',
      trend: [70, 82, 88, 95, 102, 110, 118, 125, 132, 140, 147, 155]
    },
    {
      name: 'MacBook Air M2',
      category: '💻 Bilgisayar',
      sales: 620,
      revenue: 1240000,
      stock: 25,
      growth: '+12%',
      color: 'rgba(251, 146, 60, 0.8)',
      borderColor: 'rgb(251, 146, 60)',
      trend: [58, 68, 75, 82, 88, 95, 102, 108, 115, 122, 128, 135]
    },
    {
      name: 'Adidas T-Shirt',
      category: '👕 Giyim',
      sales: 580,
      revenue: 116000,
      stock: 85,
      growth: '+8%',
      color: 'rgba(236, 72, 153, 0.8)',
      borderColor: 'rgb(236, 72, 153)',
      trend: [52, 58, 62, 68, 72, 78, 82, 88, 92, 98, 102, 108]
    }
  ];

  // Bar chart verisi
  const barChartData = {
    labels: topProducts.map(product => product.name),
    datasets: [
      {
        label: '📦 Satış Miktarı',
        data: topProducts.map(product => product.sales),
        backgroundColor: topProducts.map(product => product.color),
        borderColor: topProducts.map(product => product.borderColor),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  // Gelir karşılaştırması
  const revenueData = {
    labels: topProducts.map(product => product.name),
    datasets: [
      {
        label: '💰 Gelir (₺)',
        data: topProducts.map(product => product.revenue),
        backgroundColor: topProducts.map(product => product.color),
        borderColor: topProducts.map(product => product.borderColor),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  // Trend verisi (son 12 ay)
  const trendData = {
    labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
    datasets: topProducts.map(product => ({
      label: product.name,
      data: product.trend,
      borderColor: product.borderColor,
      backgroundColor: product.color.replace('0.8', '0.1'),
      borderWidth: 3,
      fill: false,
      tension: 0.4,
    }))
  };

  // Stok dağılımı (doughnut chart)
  const stockData = {
    labels: topProducts.map(product => product.name),
    datasets: [
      {
        data: topProducts.map(product => product.stock),
        backgroundColor: topProducts.map(product => product.color),
        borderColor: topProducts.map(product => product.borderColor),
        borderWidth: 2,
        hoverOffset: 4,
      }
    ]
  };

  // Chart seçenekleri
  const chartOptions = {
    responsive: true,
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
        text: '🏆 En Çok Satılan 5 Ürün',
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
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (label.includes('Gelir')) {
              return `${label}: ₺${value.toLocaleString('tr-TR')}`;
            }
            return `${label}: ${value.toLocaleString('tr-TR')}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value) {
            if (this.chart.data.datasets[0].label.includes('Gelir')) {
              return '₺' + (value / 1000) + 'K';
            }
            return value.toLocaleString('tr-TR');
          }
        }
      },
      x: {
        grid: {
          display: false
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
        text: '📈 Ürün Satış Trendi (Son 12 Ay)',
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
          text: '📊 Satış Miktarı',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  // Toplam istatistikler
  const totalStats = {
    totalSales: topProducts.reduce((sum, product) => sum + product.sales, 0),
    totalRevenue: topProducts.reduce((sum, product) => sum + product.revenue, 0),
    totalStock: topProducts.reduce((sum, product) => sum + product.stock, 0),
    avgGrowth: topProducts.reduce((sum, product) => sum + parseInt(product.growth), 0) / topProducts.length
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🏆 En Çok Satılan 5 Ürün Analizi
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          En popüler ürünlerin satış performansı ve trend analizi
        </p>
      </div>

      {/* Özet İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Satış</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalStats.totalSales.toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Gelir</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₺{(totalStats.totalRevenue / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mevcut Stok</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {totalStats.totalStock.toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ortalama Büyüme</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                +{totalStats.avgGrowth.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Türü Seçimi */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            📊 Satış Miktarı Grafiği
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                chartType === 'bar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              📊 Bar Grafik
            </button>
            <button
              onClick={() => setChartType('revenue')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                chartType === 'revenue'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              💰 Gelir Grafiği
            </button>
          </div>
        </div>
        
        <div className="h-96 flex items-center justify-center">
          {chartType === 'bar' ? (
            <Bar data={barChartData} options={chartOptions} />
          ) : (
            <Bar data={revenueData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Trend Analizi */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            📈 Ürün Satış Trendi
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            En çok satılan 5 ürünün son 12 aydaki satış performansı
          </p>
        </div>
        <div className="h-80">
          <Line data={trendData} options={trendOptions} />
        </div>
      </div>

      {/* Stok Dağılımı */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            📦 Mevcut Stok Dağılımı
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            En çok satılan ürünlerin mevcut stok durumu
          </p>
        </div>
        <div className="h-80 flex items-center justify-center">
          <Doughnut 
            data={stockData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 12, weight: 'bold' }
                  }
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  titleColor: '#fff',
                  bodyColor: '#fff',
                  borderColor: '#374151',
                  borderWidth: 1,
                  cornerRadius: 8,
                  displayColors: true,
                }
              }
            }} 
          />
        </div>
      </div>

      {/* Ürün Detayları */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          📋 Ürün Detayları
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topProducts.map((product, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {product.name}
                </h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  product.growth.startsWith('+') 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                }`}>
                  {product.growth}
                </span>
              </div>
              
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Kategori:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Satış:</span>
                  <span className="font-medium">{product.sales.toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gelir:</span>
                  <span className="font-medium">₺{(product.revenue / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between">
                  <span>Stok:</span>
                  <span className="font-medium">{product.stock}</span>
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
            <h4 className="font-medium text-gray-900 dark:text-white">📊 Bar Grafik</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Ürünlerin satış miktarları</li>
              <li>• Renk kodlu kategoriler</li>
              <li>• Hover'da detaylı bilgi</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">💰 Gelir Grafiği</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Ürünlerin gelir karşılaştırması</li>
              <li>• Türk Lirası formatında</li>
              <li>• Bin cinsinden gösterim</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">📈 Trend Analizi</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Son 12 aydaki değişim</li>
              <li>• Her ürün için ayrı çizgi</li>
              <li>• Satış miktarı trendi</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">📦 Stok Dağılımı</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Mevcut stok miktarları</li>
              <li>• Halka grafik formatında</li>
              <li>• Renk kodlu ürünler</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopProductsChart;
