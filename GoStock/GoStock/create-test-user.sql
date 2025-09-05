-- Test admin kullanıcısı oluştur
-- Şifre: admin123 (SHA256 hash)
INSERT INTO Users (Username, Email, PasswordHash, FullName, Role, IsActive, CreatedAt, UpdatedAt)
VALUES ('admin', 'admin@test.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Admin', 'Admin', 1, GETDATE(), GETDATE());

-- Eğer kullanıcı zaten varsa güncelle
UPDATE Users 
SET PasswordHash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
WHERE Username = 'admin';
