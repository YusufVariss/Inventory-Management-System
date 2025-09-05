# GoStock Backend API

GoStock stok yönetim sistemi için .NET 8 Web API backend uygulaması.

## 🚀 Özellikler

- **Entity Framework Core** ile SQLite veritabanı desteği
- **JWT Authentication** ile güvenli kimlik doğrulama
- **Repository Pattern** ile veri erişim katmanı
- **Service Layer** ile iş mantığı katmanı
- **Global Exception Handling** ile hata yönetimi
- **API Response Wrapper** ile standart API yanıtları
- **Swagger** ile API dokümantasyonu
- **CORS** desteği ile frontend entegrasyonu
- **Logging** ile detaylı log kayıtları

## 🏗️ Proje Yapısı

```
GoStock/
├── Controllers/          # API Controller'ları
├── Data/                # Entity Framework DbContext
├── Models/              # Entity modelleri ve DTOs
├── Repositories/        # Repository interface'leri ve implementasyonları
├── Services/            # Service interface'leri ve implementasyonları
├── Middleware/          # Custom middleware'ler
└── Program.cs           # Uygulama konfigürasyonu
```

## 📋 Gereksinimler

- .NET 8.0 SDK
- SQLite (gömülü veritabanı)

## 🛠️ Kurulum

1. **Projeyi klonlayın:**
   ```bash
   git clone <repository-url>
   cd GoStock
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   dotnet restore
   ```

3. **Veritabanını oluşturun:**
   ```bash
   dotnet ef database update
   ```

4. **Uygulamayı çalıştırın:**
   ```bash
   dotnet run
   ```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/refresh-token` - Token yenileme

### Products
- `GET /api/products` - Tüm ürünleri listele
- `GET /api/products/{id}` - ID'ye göre ürün getir
- `POST /api/products` - Yeni ürün oluştur
- `PUT /api/products/{id}` - Ürün güncelle
- `DELETE /api/products/{id}` - Ürün sil
- `GET /api/products/category/{categoryId}` - Kategoriye göre ürünler
- `GET /api/products/low-stock` - Düşük stok uyarısı

### Categories
- `GET /api/categories` - Tüm kategorileri listele
- `GET /api/categories/{id}` - ID'ye göre kategori getir
- `POST /api/categories` - Yeni kategori oluştur
- `PUT /api/categories/{id}` - Kategori güncelle
- `DELETE /api/categories/{id}` - Kategori sil

### Users
- `GET /api/users` - Tüm kullanıcıları listele
- `GET /api/users/{id}` - ID'ye göre kullanıcı getir
- `POST /api/users` - Yeni kullanıcı oluştur
- `PUT /api/users/{id}` - Kullanıcı güncelle
- `DELETE /api/users/{id}` - Kullanıcı sil

### Stock Movements
- `GET /api/stockmovements` - Stok hareketlerini listele
- `POST /api/stockmovements/stock-in` - Stok girişi
- `POST /api/stockmovements/stock-out` - Stok çıkışı

### Sales
- `GET /api/sales` - Satışları listele
- `POST /api/sales` - Yeni satış oluştur
- `PUT /api/sales/{id}` - Satış güncelle

### Returns
- `GET /api/returns` - İadeleri listele
- `POST /api/returns` - Yeni iade oluştur
- `PUT /api/returns/{id}` - İade güncelle

### Suppliers
- `GET /api/suppliers` - Tedarikçileri listele
- `POST /api/suppliers` - Yeni tedarikçi oluştur
- `PUT /api/suppliers/{id}` - Tedarikçi güncelle
- `DELETE /api/suppliers/{id}` - Tedarikçi sil

### Purchase Orders
- `GET /api/purchaseorders` - Siparişleri listele
- `POST /api/purchaseorders` - Yeni sipariş oluştur
- `PUT /api/purchaseorders/{id}` - Sipariş güncelle
- `DELETE /api/purchaseorders/{id}` - Sipariş sil

## 🔐 Authentication

API, JWT (JSON Web Token) kullanarak kimlik doğrulama yapar:

1. **Login** endpoint'i ile giriş yapın
2. Dönen JWT token'ı `Authorization` header'ında kullanın:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

## 📊 Veritabanı

SQLite veritabanı kullanılır ve otomatik olarak oluşturulur. Seed data ile başlangıç verileri eklenir:

- Varsayılan kategoriler
- Varsayılan ürünler
- Admin kullanıcısı
- Sistem ayarları

## 🚨 Güvenlik

- JWT token'lar 60 dakika geçerlidir
- Şifreler SHA256 ile hash'lenir
- Role-based authorization
- CORS politikaları yapılandırılmış

## 📝 Logging

Structured logging kullanılır:
- Console logging
- File logging (günlük rotasyon)
- Entity Framework query logging

## 🔧 Konfigürasyon

`appsettings.json` dosyasında:
- Veritabanı bağlantı string'i
- JWT ayarları
- Logging seviyeleri
- CORS politikaları

## 🧪 Test

```bash
# Unit testleri çalıştır
dotnet test

# Swagger UI'ı aç
# http://localhost:5000/swagger
```

## 📚 Teknolojiler

- **.NET 8** - Web API framework
- **Entity Framework Core** - ORM
- **SQLite** - Veritabanı
- **JWT Bearer** - Authentication
- **Swagger** - API dokümantasyonu
- **CORS** - Cross-origin resource sharing

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Proje sahibi: [Your Name]
Email: [your.email@example.com]
