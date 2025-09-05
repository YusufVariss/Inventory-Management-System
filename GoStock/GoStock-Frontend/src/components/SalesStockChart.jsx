import React from 'react';
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
import { Line, Bar } from 'react-chartjs-2';

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

const SalesStockChart = () => {
  // Örnek veri - gerçek uygulamada API'den gelecek
  const chartData = {
    labels: [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ],
    datasets: [
      {
        label: '📈 Satış Miktarı',
        data: [120, 190, 300, 500, 200, 300, 450, 380, 420, 500, 600, 700],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: '📦 Stok Girişi',
        data: [80, 150, 200, 300, 180, 250, 320, 280, 350, 400, 450, 500],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: '🚚 Stok Çıkışı',
        data: [100, 160, 220, 280, 200, 270, 300, 260, 320, 380, 420, 480],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      }
    ]
  };

  // Bar chart için veri (aylık karşılaştırma)
  const barData = {
    labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
    datasets: [
      {
        label: '💰 Satış Geliri (₺)',
        data: [15000, 22000, 35000, 45000, 28000, 38000],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: '📊 Stok Değeri (₺)',
        data: [25000, 30000, 40000, 50000, 35000, 45000],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        yAxisID: 'y',
      }
    ]
  };

  // Line chart seçenekleri
  const lineOptions = {
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
        text: '📊 Satış & Stok Hareketi Analizi',
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
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toLocaleString('tr-TR');
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
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: '📦 Miktar (Adet)',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString('tr-TR');
          }
        }
      }
    }
  };

  // Bar chart seçenekleri
  const barOptions = {
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
        text: '💰 Satış Geliri vs Stok Değeri',
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
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += '₺' + context.parsed.y.toLocaleString('tr-TR');
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
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: '💰 Tutar (₺)',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value) {
            return '₺' + value.toLocaleString('tr-TR');
          }
        }
      }
    }
  };

  // Özet istatistikler
  const summaryStats = {
    totalSales: chartData.datasets[0].data.reduce((a, b) => a + b, 0),
    totalStockIn: chartData.datasets[1].data.reduce((a, b) => a + b, 0),
    totalStockOut: chartData.datasets[2].data.reduce((a, b) => a + b, 0),
    avgMonthlySales: Math.round(chartData.datasets[0].data.reduce((a, b) => a + b, 0) / 12),
    avgMonthlyStockIn: Math.round(chartData.datasets[1].data.reduce((a, b) => a + b, 0) / 12),
    avgMonthlyStockOut: Math.round(chartData.datasets[2].data.reduce((a, b) => a + b, 0) / 12),
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          📊 Satış & Stok Hareketi Grafiği
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Aylık satış, stok giriş ve çıkış verilerinin analizi
        </p>
      </div>

      {/* Özet İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Satış</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {summaryStats.totalSales.toLocaleString('tr-TR')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ortalama: {summaryStats.avgMonthlySales.toLocaleString('tr-TR')}/ay
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Stok Girişi</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {summaryStats.totalStockIn.toLocaleString('tr-TR')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ortalama: {summaryStats.avgMonthlyStockIn.toLocaleString('tr-TR')}/ay
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <span className="text-2xl">🚚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Stok Çıkışı</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {summaryStats.totalStockOut.toLocaleString('tr-TR')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ortalama: {summaryStats.avgMonthlyStockOut.toLocaleString('tr-TR')}/ay
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ana Grafik - Line Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            📈 Aylık Trend Analizi
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Satış, stok giriş ve çıkış verilerinin aylık değişimi
          </p>
        </div>
        <div className="h-96">
          <Line data={chartData} options={lineOptions} />
        </div>
      </div>

      {/* Bar Chart - Gelir vs Stok Değeri */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            💰 Gelir vs Stok Değeri Karşılaştırması
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Aylık satış geliri ve stok değeri karşılaştırması
          </p>
        </div>
        <div className="h-80">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* Grafik Açıklamaları */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📋 Grafik Açıklamaları
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">📈 Satış Miktarı</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Mavi çizgi ile gösterilir</li>
              <li>• Aylık toplam satış adedi</li>
              <li>• Trend analizi için kullanılır</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">📦 Stok Girişi</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Yeşil çizgi ile gösterilir</li>
              <li>• Depoya gelen ürün miktarı</li>
              <li>• Tedarik zinciri analizi</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">🚚 Stok Çıkışı</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Kırmızı çizgi ile gösterilir</li>
              <li>• Depodan çıkan ürün miktarı</li>
              <li>• Satış performansı göstergesi</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">💰 Gelir Analizi</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Bar chart ile gösterilir</li>
              <li>• Aylık satış geliri</li>
              <li>• Stok değeri karşılaştırması</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesStockChart;
