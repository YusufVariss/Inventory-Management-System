using Microsoft.EntityFrameworkCore;
using GoStock.Models;

namespace GoStock.Data
{
    public class GoStockDbContext : DbContext
    {
        public GoStockDbContext(DbContextOptions<GoStockDbContext> options) : base(options)
        {
        }

        // DbSet'ler
        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<UserPermission> UserPermissions { get; set; }
        public DbSet<StockMovement> StockMovements { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<Return> Returns { get; set; }
        public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
        public DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Setting> Settings { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User entity configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Password).IsRequired();
                entity.Property(e => e.Role).HasDefaultValue("user");
                entity.Property(e => e.IsActive).HasDefaultValue(true);
            });

            // Category entity configuration
            modelBuilder.Entity<Category>(entity =>
            {
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            });

            // Product entity configuration
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasIndex(e => e.Name);
                entity.HasIndex(e => e.StockQuantity);
                entity.Property(e => e.Price).HasPrecision(18, 2);
            });

            // Supplier entity configuration
            modelBuilder.Entity<Supplier>(entity =>
            {
                entity.HasIndex(e => e.Name);
                entity.HasIndex(e => e.IsActive);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
            });

            // UserPermission entity configuration
            modelBuilder.Entity<UserPermission>(entity =>
            {
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => new { e.UserId, e.Permission }).IsUnique();
            });

            // StockMovement entity configuration
            modelBuilder.Entity<StockMovement>(entity =>
            {
                entity.ToTable("StokHareketleri");
                entity.HasIndex(e => e.ProductId);
                entity.HasIndex(e => e.MovementType);
                entity.HasIndex(e => e.MovementDate);
                entity.HasIndex(e => e.UserId);
                entity.Property(e => e.MovementDate).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
                entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
                
                // Sütun isimlerini açıkça belirt
                entity.Property(e => e.Id).HasColumnName("Id");
                entity.Property(e => e.ProductId).HasColumnName("ProductId");
                entity.Property(e => e.MovementType).HasColumnName("HareketTuru");
                entity.Property(e => e.Quantity).HasColumnName("Miktar");
                entity.Property(e => e.PreviousStock).HasColumnName("OncekiStok");
                entity.Property(e => e.NewStock).HasColumnName("YeniStok");
                entity.Property(e => e.UnitPrice).HasColumnName("BirimFiyat");
                entity.Property(e => e.TotalAmount).HasColumnName("ToplamTutar");
                entity.Property(e => e.Reference).HasColumnName("Referans");
                entity.Property(e => e.Notes).HasColumnName("Notlar");
                entity.Property(e => e.MovementDate).HasColumnName("HareketTarihi");
                entity.Property(e => e.UserId).HasColumnName("KullaniciId");
            });

            // Sale entity configuration
            modelBuilder.Entity<Sale>(entity =>
            {
                entity.HasIndex(e => e.ProductId);
                entity.HasIndex(e => e.SaleDate);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.UserId);
                entity.Property(e => e.SaleDate).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.Status).HasDefaultValue("completed");
                entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
                entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
            });

            // Return entity configuration
            modelBuilder.Entity<Return>(entity =>
            {
                entity.HasIndex(e => e.ReturnType);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.ReturnDate);
                entity.Property(e => e.ReturnDate).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.Status).HasDefaultValue("pending");
                entity.Property(e => e.Amount).HasPrecision(18, 2);
            });

            // PurchaseOrder entity configuration
            modelBuilder.Entity<PurchaseOrder>(entity =>
            {
                entity.HasIndex(e => e.OrderNumber).IsUnique();
                entity.HasIndex(e => e.SupplierId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.OrderDate);
                entity.Property(e => e.OrderDate).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.Status).HasDefaultValue("pending");
                entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
            });

            // PurchaseOrderItem entity configuration
            modelBuilder.Entity<PurchaseOrderItem>(entity =>
            {
                entity.HasIndex(e => e.PurchaseOrderId);
                entity.HasIndex(e => e.ProductId);
                entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
                entity.Property(e => e.TotalPrice).HasPrecision(18, 2);
            });

            // AuditLog entity configuration
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.HasIndex(e => e.TableName);
                entity.HasIndex(e => e.RecordId);
                entity.HasIndex(e => e.EntityId);
                entity.HasIndex(e => e.Timestamp);
                entity.HasIndex(e => e.UserId);
                entity.Property(e => e.Timestamp).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.UserId).IsRequired(false); // Explicitly mark as nullable
            });

            // Event entity configuration
            modelBuilder.Entity<Event>(entity =>
            {
                entity.HasIndex(e => e.AgendaDate);
                entity.HasIndex(e => e.AgendaTime);
                entity.HasIndex(e => e.Priority);
                entity.Property(e => e.AgendaDate).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            });

            // Setting entity configuration
            modelBuilder.Entity<Setting>(entity =>
            {
                entity.HasIndex(e => e.SettingKey).IsUnique();
                entity.Property(e => e.IsSystem).HasDefaultValue(false);
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETDATE()");
            });

            // Notification entity configuration
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.IsRead);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.CreatedAt);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsRead).HasDefaultValue(false);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
            });

            // Relationships
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserPermission>()
                .HasOne(up => up.User)
                .WithMany(u => u.UserPermissions)
                .HasForeignKey(up => up.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StockMovement>()
                .HasOne(sm => sm.Product)
                .WithMany(p => p.StockMovements)
                .HasForeignKey(sm => sm.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StockMovement>()
                .HasOne(sm => sm.User)
                .WithMany(u => u.StockMovements)
                .HasForeignKey(sm => sm.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Sale>()
                .HasOne(s => s.Product)
                .WithMany(p => p.Sales)
                .HasForeignKey(s => s.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Sale>()
                .HasOne(s => s.User)
                .WithMany(u => u.Sales)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Return entity no longer has foreign key relationship with Product

            // User relationship removed from Return model

            modelBuilder.Entity<PurchaseOrder>()
                .HasOne(po => po.Supplier)
                .WithMany(s => s.PurchaseOrders)
                .HasForeignKey(po => po.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PurchaseOrder>()
                .HasOne(po => po.User)
                .WithMany(u => u.PurchaseOrders)
                .HasForeignKey(po => po.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PurchaseOrderItem>()
                .HasOne(poi => poi.PurchaseOrder)
                .WithMany(po => po.PurchaseOrderItems)
                .HasForeignKey(poi => poi.PurchaseOrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PurchaseOrderItem>()
                .HasOne(poi => poi.Product)
                .WithMany(p => p.PurchaseOrderItems)
                .HasForeignKey(poi => poi.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            // Event entity no longer has User relationship

            modelBuilder.Entity<AuditLog>()
                .HasOne(al => al.User)
                .WithMany(u => u.AuditLogs)
                .HasForeignKey(al => al.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            // Seed data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Static DateTime values for consistent migrations
            var staticDateTime = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            
            // Varsayılan kategoriler
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Elektronik", Description = "Elektronik cihazlar ve aksesuarlar", CreatedAt = staticDateTime },
                new Category { Id = 2, Name = "Aksesuar", Description = "Telefon, bilgisayar aksesuarları", CreatedAt = staticDateTime },
                new Category { Id = 3, Name = "Kablo", Description = "Çeşitli kablolar ve adaptörler", CreatedAt = staticDateTime },
                new Category { Id = 4, Name = "Giriş Cihazı", Description = "Klavye, mouse, webcam vb.", CreatedAt = staticDateTime },
                new Category { Id = 5, Name = "Yazıcı", Description = "Yazıcılar ve mürekkepler", CreatedAt = staticDateTime },
                new Category { Id = 6, Name = "Mobil", Description = "Telefonlar ve tabletler", CreatedAt = staticDateTime },
                new Category { Id = 7, Name = "Bilgisayar", Description = "Laptop ve masaüstü bilgisayarlar", CreatedAt = staticDateTime },
                new Category { Id = 8, Name = "Gaming", Description = "Oyun ekipmanları ve aksesuarları", CreatedAt = staticDateTime },
                new Category { Id = 9, Name = "Ses Sistemleri", Description = "Hoparlör, kulaklık, mikrofon", CreatedAt = staticDateTime },
                new Category { Id = 10, Name = "Güvenlik", Description = "Kamera, alarm sistemleri", CreatedAt = staticDateTime }
            );

            // Varsayılan ayarlar
            modelBuilder.Entity<Setting>().HasData(
                new Setting { Id = 1, SettingKey = "company_name", SettingValue = "GoStock", Description = "Şirket adı", IsSystem = true, UpdatedAt = staticDateTime },
                new Setting { Id = 2, SettingKey = "currency", SettingValue = "TRY", Description = "Para birimi", IsSystem = true, UpdatedAt = staticDateTime },
                new Setting { Id = 3, SettingKey = "tax_rate", SettingValue = "18", Description = "KDV oranı (%)", IsSystem = true, UpdatedAt = staticDateTime },
                new Setting { Id = 4, SettingKey = "low_stock_threshold", SettingValue = "10", Description = "Düşük stok uyarı eşiği", IsSystem = true, UpdatedAt = staticDateTime },
                new Setting { Id = 5, SettingKey = "backup_frequency", SettingValue = "daily", Description = "Yedekleme sıklığı", IsSystem = true, UpdatedAt = staticDateTime }
            );

            // Varsayılan admin kullanıcısı
            modelBuilder.Entity<User>().HasData(
                new User 
                { 
                    Id = 1, 
                    Username = "admin", 
                    Email = "admin@test.com", 
                    Password = "admin", // Düz şifre
                    FullName = "Sistem Yöneticisi", 
                    Role = "Admin", 
                    IsActive = true, 
                    CreatedAt = staticDateTime,
                    UpdatedAt = staticDateTime
                }
            );

            // Varsayılan ürünler (güncellenmiş)
            modelBuilder.Entity<Product>().HasData(
                new Product { Id = 1, Name = "Laptop Dell XPS 13", CategoryId = 7, Price = 25000.00m, StockQuantity = 15, Description = "Dell XPS 13 13.4 inch Intel i7 16GB RAM", CreatedAt = staticDateTime, UpdatedAt = staticDateTime },
                new Product { Id = 2, Name = "iPhone 15 Pro", CategoryId = 6, Price = 45000.00m, StockQuantity = 8, Description = "Apple iPhone 15 Pro 128GB Titanium", CreatedAt = staticDateTime, UpdatedAt = staticDateTime },
                new Product { Id = 3, Name = "Samsung 4K TV", CategoryId = 1, Price = 18000.00m, StockQuantity = 12, Description = "Samsung 4K Ultra HD Smart TV", CreatedAt = staticDateTime, UpdatedAt = staticDateTime },
                new Product { Id = 4, Name = "AirPods Pro", CategoryId = 2, Price = 7500.00m, StockQuantity = 25, Description = "Apple AirPods Pro 2. nesil", CreatedAt = staticDateTime, UpdatedAt = staticDateTime },
                new Product { Id = 5, Name = "MacBook Air M2", CategoryId = 7, Price = 35000.00m, StockQuantity = 2, Description = "Apple MacBook Air M2 13 inch 256GB", CreatedAt = staticDateTime, UpdatedAt = staticDateTime }
            );
        }
    }
}
