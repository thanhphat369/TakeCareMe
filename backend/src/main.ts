import { NestFactory } from '@nestjs/core'; // Tạo ứng dụng NestJS
import { ValidationPipe } from '@nestjs/common'; // Dùng để kiểm tra (validate) dữ liệu gửi từ client
import { ConfigService } from '@nestjs/config'; // Dùng để đọc biến môi trường (.env)
import { AppModule } from './app.module'; // Module gốc của ứng dụng NestJS

// Import các thư viện ngoài
import * as express from 'express'; // Dùng để phục vụ file tĩnh (ảnh upload, v.v.)
import { join } from 'path'; // Hỗ trợ thao tác với đường dẫn file hệ thống
import { DataSource } from 'typeorm'; // Dùng để kiểm tra kết nối database (SQL Server)

// Hàm khởi động ứng dụng NestJS
async function bootstrap() {
  // Tạo một instance của ứng dụng NestJS từ AppModule
  const app = await NestFactory.create(AppModule);

  // Lấy service cấu hình để đọc biến môi trường từ .env
  const configService = app.get(ConfigService);

  // Cấu hình CORS (Cross-Origin Resource Sharing)
  // Cho phép Frontend (React chạy ở port 8080) gọi API đến Backend (port 3000)
  app.enableCors({
    origin: [
      'http://localhost:5173', // Vite (React)
      'http://localhost:3000', // CRA
      'http://localhost:8080', // Nếu dùng cổng này
    ],
    credentials: true, // Cho phép gửi cookie/token giữa frontend và backend
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Các phương thức HTTP được phép
    allowedHeaders: ['Content-Type', 'Authorization', 'x-device-token'], // Header được phép gửi
  });

  // Thêm ValidationPipe toàn cục
  // Giúp NestJS tự động kiểm tra dữ liệu gửi từ client dựa trên DTO (Data Transfer Object)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động bỏ qua các thuộc tính không khai báo trong DTO
      forbidNonWhitelisted: true, // Nếu client gửi thuộc tính lạ → báo lỗi ngay
      transform: true, // Tự động chuyển kiểu dữ liệu (vd: "1" → 1)
      transformOptions: { enableImplicitConversion: true, }, // Cho phép convert ngầm kiểu dữ liệu
    }),
  );

  // Cấu hình để phục vụ file tĩnh (uploads)
  // Khi người dùng tải ảnh lên server, ảnh được lưu trong thư mục /uploads
  // Ta cho phép truy cập ảnh qua đường dẫn: http://localhost:3000/uploads/<filename>
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Đặt prefix chung cho toàn bộ API
  // Mọi route đều phải bắt đầu bằng `/api`, ví dụ: `/api/staff`, `/api/users`
  app.setGlobalPrefix('api');

  // Lấy PORT từ file .env (hoặc mặc định là 3000)
  const port = configService.get('PORT') || 3000;

  // Bắt đầu chạy server NestJS
  await app.listen(port);

  // Ghi log thông tin khởi động ra console
  console.log('='.repeat(60));
  console.log('Take Care Me Backend Server');
  console.log('='.repeat(60));
  console.log(`Server running on: http://localhost:${port}`); // Link truy cập server
  console.log(`Environment: ${configService.get('NODE_ENV')}`); // Môi trường (dev/test/prod)
  console.log(`Database: ${configService.get('DB_DATABASE')}`); // Tên database đang kết nối
  console.log('='.repeat(60));

  // Kiểm tra kết nối cơ sở dữ liệu (SQL Server)
  const dataSource = app.get(DataSource); // Lấy kết nối từ TypeORM
  try {
    await dataSource.query('SELECT 1'); // Gửi truy vấn test đơn giản
    console.log('Kết nối SQL Server thành công'); // Nếu chạy được → OK
  } catch (err) {
    console.error('Không thể kết nối SQL Server:', err.message); // Nếu lỗi → In ra console
  }

  // In thêm dòng phân cách để dễ nhìn
  console.log('='.repeat(60));
}

// Gọi hàm để khởi động ứng dụng
bootstrap();
