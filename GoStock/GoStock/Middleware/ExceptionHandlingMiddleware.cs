using System.Net;
using System.Text.Json;
using GoStock.Models;

namespace GoStock.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Beklenmeyen hata oluştu: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var response = new ApiResponse
            {
                Success = false,
                Message = "Bir hata oluştu",
                Errors = new List<string>()
            };

            switch (exception)
            {
                case ArgumentException argEx:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response.Message = "Geçersiz parametre";
                    response.Errors.Add(argEx.Message);
                    break;

                case InvalidOperationException invOpEx:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response.Message = "Geçersiz işlem";
                    response.Errors.Add(invOpEx.Message);
                    break;

                case UnauthorizedAccessException unauthEx:
                    context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    response.Message = "Yetkisiz erişim";
                    response.Errors.Add(unauthEx.Message);
                    break;

                case KeyNotFoundException keyNotFoundEx:
                    context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    response.Message = "Kayıt bulunamadı";
                    response.Errors.Add(keyNotFoundEx.Message);
                    break;

                default:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    response.Message = "Sunucu hatası";
                    response.Errors.Add("Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
                    break;
            }

            var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(jsonResponse);
        }
    }
}
