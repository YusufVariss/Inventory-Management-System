using Microsoft.AspNetCore.Mvc;
using GoStock.Services;
using Microsoft.AspNetCore.Authorization;

namespace GoStock.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ISaleService _saleService;
        private readonly IStockMovementService _stockMovementService;
        private readonly IAuditLogService _auditLogService;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(
            IProductService productService,
            ISaleService saleService,
            IStockMovementService stockMovementService,
            IAuditLogService auditLogService,
            ILogger<DashboardController> logger)
        {
            _productService = productService;
            _saleService = saleService;
            _stockMovementService = stockMovementService;
            _auditLogService = auditLogService;
            _logger = logger;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
                var allProducts = await _productService.GetAllProductDtosAsync();
                var totalProducts = allProducts.Count();
                
                // Toplam stok miktarını hesapla (ürünlerdeki stok miktarlarının toplamı)
                var totalStock = allProducts.Sum(p => p.StockQuantity);
                
                // Toplam stok değerini hesapla (stok miktarı × fiyat)
                var totalStockValue = allProducts.Sum(p => p.StockQuantity * p.Price);
                
                // Kritik stok: 10'un altındaki ürünler
                var criticalStock = await _productService.GetLowStockProductsAsync();
                
                // Debug log ekle
                _logger.LogInformation($"Dashboard Stats - Total Products: {totalProducts}, Total Stock: {totalStock}, Total Stock Value: {totalStockValue}, Critical Stock: {criticalStock.Count()}");
                var monthlySales = await _saleService.GetSalesAmountByDateRangeAsync(
                    DateTime.Now.AddMonths(-1), 
                    DateTime.Now
                );

                var stats = new
                {
                    totalProducts = totalProducts,
                    totalStock = totalStock,
                    totalStockValue = totalStockValue,
                    criticalStock = criticalStock.Count(),
                    monthlySales = monthlySales
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Dashboard istatistikleri getirilirken hata oluştu");
                return StatusCode(500, new { message = "Dashboard istatistikleri getirilemedi" });
            }
        }

        [HttpGet("recent-products")]
        public async Task<IActionResult> GetRecentProducts()
        {
            try
            {
                var products = await _productService.GetProductsWithPaginationAsync(1, 5);
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Son ürünler getirilirken hata oluştu");
                return StatusCode(500, new { message = "Son ürünler getirilemedi" });
            }
        }

        [HttpGet("recent-activities")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRecentActivities()
        {
            try
            {
                var activities = new List<object>();
                
                // Audit log'dan son ürün işlemlerini al (öncelikli)
                try
                {
                    var auditLogs = await _auditLogService.GetRecentAuditLogsAsync(15);
                    foreach (var log in auditLogs.Where(l => l.TableName == "Products"))
                    {
                        string activityType = log.Action switch
                        {
                            "INSERT" => "product_added",
                            "UPDATE" => "product_updated", 
                            "DELETE" => "product_deleted",
                            _ => "product_modified"
                        };

                        activities.Add(new
                        {
                            id = $"audit_{log.Id}",
                            type = activityType,
                            product = log.EntityName ?? $"Ürün ID: {log.RecordId}",
                            quantity = 0,
                            user = log.User?.FullName ?? $"Kullanıcı ID: {log.UserId}",
                            date = log.Timestamp.ToString("dd.MM.yyyy HH:mm"),
                            dateForSorting = log.Timestamp,
                            status = "completed"
                        });
                    }
                }
                catch (Exception auditEx)
                {
                    _logger.LogWarning(auditEx, "Audit log verileri alınamadı, ürün verileri gösteriliyor");
                    
                    // Fallback: Son eklenen ürünleri al
                    var recentProducts = await _productService.GetProductsWithPaginationAsync(1, 10);
                    foreach (var p in recentProducts)
                    {
                        activities.Add(new
                        {
                            id = $"product_{p.Id}",
                            type = "product_added",
                            product = p.Name,
                            quantity = 0,
                            user = "Bilinmeyen Kullanıcı",
                            date = p.CreatedAt.ToString("dd.MM.yyyy HH:mm"),
                            dateForSorting = p.CreatedAt,
                            status = "completed"
                        });
                    }
                }

                // Tarihe göre sırala (en yeni önce)
                var sortedActivities = activities
                    .OrderByDescending(a => ((dynamic)a).dateForSorting)
                    .Take(15)
                    .Select(a => new
                    {
                        id = ((dynamic)a).id,
                        type = ((dynamic)a).type,
                        product = ((dynamic)a).product,
                        quantity = ((dynamic)a).quantity,
                        user = ((dynamic)a).user,
                        date = ((dynamic)a).date,
                        status = ((dynamic)a).status
                    })
                    .ToList();

                return Ok(sortedActivities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Son hareketler getirilirken hata oluştu: {Message}", ex.Message);
                return StatusCode(500, new { message = "Son hareketler getirilemedi", error = ex.Message });
            }
        }

        // Test endpoint - authentication olmadan
        [HttpGet("test-activities")]
        [AllowAnonymous]
        public IActionResult GetTestActivities()
        {
            try
            {
                var testActivities = new List<object>
                {
                    new
                    {
                        id = "test_1",
                        type = "product_added",
                        product = "Test Ürün 1",
                        quantity = 0,
                        user = "Test Kullanıcı",
                        date = DateTime.Now.ToString("dd.MM.yyyy HH:mm"),
                        status = "completed"
                    },
                    new
                    {
                        id = "test_2", 
                        type = "stock_in",
                        product = "Test Ürün 2",
                        quantity = 50,
                        user = "Test Kullanıcı",
                        date = DateTime.Now.AddHours(-1).ToString("dd.MM.yyyy HH:mm"),
                        status = "completed"
                    }
                };

                return Ok(testActivities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Test hareketleri getirilirken hata oluştu");
                return StatusCode(500, new { message = "Test hareketleri getirilemedi" });
            }
        }

        [HttpGet("critical-stock")]
        public async Task<IActionResult> GetCriticalStock()
        {
            try
            {
                var lowStockProducts = await _productService.GetLowStockProductsAsync();
                var criticalStock = lowStockProducts.Select(p => new
                {
                    id = p.Id,
                    name = p.Name,
                    category = p.Category?.Name ?? $"Kategori ID: {p.CategoryId}",
                    currentStock = p.StockQuantity,
                    minStock = 10 // Varsayılan minimum stok seviyesi
                });

                return Ok(criticalStock);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kritik stok bilgileri getirilirken hata oluştu");
                return StatusCode(500, new { message = "Kritik stok bilgileri getirilemedi" });
            }
        }

        [HttpGet("notifications")]
        public async Task<IActionResult> GetNotifications()
        {
            try
            {
                // Gerçek verilerden bildirimler oluştur
                var allProducts = await _productService.GetAllProductDtosAsync();
                var totalProducts = allProducts.Count();
                var lowStockProducts = await _productService.GetLowStockProductsAsync();
                var lowStockCount = lowStockProducts.Count();
                
                var notifications = new List<object>();
                
                // Düşük stok uyarısı
                if (lowStockCount > 0)
                {
                    notifications.Add(new
                    {
                        id = 1,
                        message = $"{lowStockCount} ürünün stok seviyesi kritik",
                        type = "warning",
                        action = "Stok Ekle",
                        page = "/stock-movements",
                        pageName = "Stok Hareketleri",
                        time = "2 saat önce",
                        read = false
                    });
                }
                
                // Toplam ürün bilgisi
                notifications.Add(new
                {
                    id = 2,
                    message = $"Toplam {totalProducts} ürün bulunmaktadır",
                    type = "info",
                    action = "Görüntüle",
                    page = "/products",
                    pageName = "Ürünler",
                    time = "1 saat önce",
                    read = false
                });

                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bildirimler getirilirken hata oluştu");
                return StatusCode(500, new { message = "Bildirimler getirilemedi" });
            }
        }

        /// <summary>
        /// Belirli bir bildirimi okundu olarak işaretler
        /// </summary>
        [HttpPost("notifications/{id}/mark-read")]
        public IActionResult MarkNotificationAsRead(int id)
        {
            try
            {
                // Gerçek uygulamada veritabanında güncelleme yapılır
                // Şimdilik başarılı yanıt döndürüyoruz
                return Ok(new { success = true, message = "Bildirim okundu olarak işaretlendi" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bildirim okundu işaretlenirken hata oluştu");
                return StatusCode(500, new { message = "Bildirim okundu işaretlenemedi" });
            }
        }

        /// <summary>
        /// Tüm bildirimleri okundu olarak işaretler
        /// </summary>
        [HttpPost("notifications/mark-all-read")]
        public IActionResult MarkAllNotificationsAsRead()
        {
            try
            {
                // Gerçek uygulamada veritabanında güncelleme yapılır
                // Şimdilik başarılı yanıt döndürüyoruz
                return Ok(new { success = true, message = "Tüm bildirimler okundu olarak işaretlendi" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bildirimler okundu işaretlenirken hata oluştu");
                return StatusCode(500, new { message = "Bildirimler okundu işaretlenemedi" });
            }
        }
    }
}
