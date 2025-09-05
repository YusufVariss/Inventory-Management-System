using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 🔹 Controller servislerini ekle
builder.Services.AddControllers();

// (Opsiyonel) Swagger ekle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 🔹 JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(builder.Configuration["JwtSettings:SecretKey"]!)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// 🔹 Authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("admin"));
    options.AddPolicy("ManagerOrAdmin", policy => policy.RequireRole("admin", "manager"));
    options.AddPolicy("UserOrAbove", policy => policy.RequireRole("admin", "manager", "user"));
});

// 🔹 Entity Framework Core + SQL Server
builder.Services.AddDbContext<GoStock.Data.GoStockDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 🔹 Repository ve Service dependency injection
builder.Services.AddScoped<GoStock.Repositories.IProductRepository, GoStock.Repositories.ProductRepository>();
builder.Services.AddScoped<GoStock.Services.IProductService, GoStock.Services.ProductService>();

// 🔹 JWT Service
builder.Services.AddScoped<GoStock.Services.IJwtService, GoStock.Services.JwtService>();

// User Services
builder.Services.AddScoped<GoStock.Repositories.IUserRepository, GoStock.Repositories.UserRepository>();
builder.Services.AddScoped<GoStock.Services.IUserService, GoStock.Services.UserService>();

// Category Services
builder.Services.AddScoped<GoStock.Repositories.ICategoryRepository, GoStock.Repositories.CategoryRepository>();
builder.Services.AddScoped<GoStock.Services.ICategoryService, GoStock.Services.CategoryService>();

// Supplier Services
builder.Services.AddScoped<GoStock.Repositories.ISupplierRepository, GoStock.Repositories.SupplierRepository>();
builder.Services.AddScoped<GoStock.Services.ISupplierService, GoStock.Services.SupplierService>();

// Stock Movement Services
builder.Services.AddScoped<GoStock.Repositories.IStockMovementRepository, GoStock.Repositories.StockMovementRepository>();
builder.Services.AddScoped<GoStock.Services.IStockMovementService, GoStock.Services.StockMovementService>();

// Sale Services
builder.Services.AddScoped<GoStock.Repositories.ISaleRepository, GoStock.Repositories.SaleRepository>();
builder.Services.AddScoped<GoStock.Services.ISaleService, GoStock.Services.SaleService>();

// Return Services
builder.Services.AddScoped<GoStock.Repositories.IReturnRepository, GoStock.Repositories.ReturnRepository>();
builder.Services.AddScoped<GoStock.Services.IReturnService, GoStock.Services.ReturnService>();

// Purchase Order Services
builder.Services.AddScoped<GoStock.Repositories.IPurchaseOrderRepository, GoStock.Repositories.PurchaseOrderRepository>();
builder.Services.AddScoped<GoStock.Services.IPurchaseOrderService, GoStock.Services.PurchaseOrderService>();

// Purchase Order Item Services
builder.Services.AddScoped<GoStock.Repositories.IPurchaseOrderItemRepository, GoStock.Repositories.PurchaseOrderItemRepository>();
builder.Services.AddScoped<GoStock.Services.IPurchaseOrderItemService, GoStock.Services.PurchaseOrderItemService>();

// Audit Log Services
builder.Services.AddScoped<GoStock.Repositories.IAuditLogRepository, GoStock.Repositories.AuditLogRepository>();
builder.Services.AddScoped<GoStock.Services.IAuditLogService, GoStock.Services.AuditLogService>();

// Setting Services
builder.Services.AddScoped<GoStock.Repositories.ISettingRepository, GoStock.Repositories.SettingRepository>();
builder.Services.AddScoped<GoStock.Services.ISettingService, GoStock.Services.SettingService>();

// Event Services
builder.Services.AddScoped<GoStock.Repositories.IEventRepository, GoStock.Repositories.EventRepository>();
builder.Services.AddScoped<GoStock.Services.IEventService, GoStock.Services.EventService>();

// Notification Services
builder.Services.AddScoped<GoStock.Repositories.INotificationRepository, GoStock.Repositories.NotificationRepository>();
builder.Services.AddScoped<GoStock.Services.INotificationService, GoStock.Services.NotificationService>();

// 🔹 CORS ayarları - React frontend için
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// 🔹 Global exception handling middleware
app.UseMiddleware<GoStock.Middleware.ExceptionHandlingMiddleware>();

// 🔹 Geliştirme ortamında Swagger aç
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// 🔹 CORS middleware'i ekle
app.UseCors("AllowReactApp");

// 🔹 Authentication & Authorization middleware
app.UseAuthentication();
app.UseAuthorization();

// 🔹 Controller endpointlerini aktif et
app.MapControllers();

app.Run();
