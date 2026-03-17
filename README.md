# Hệ thống tra cứu thông tin bệnh sử bệnh nhân

## Giới thiệu

Hệ thống hỗ trợ quản lý, lưu trữ và tra cứu hồ sơ bệnh án điện tử, ứng dụng Apache Spark và Elasticsearch nhằm tăng hiệu quả tìm kiếm dữ liệu, hỗ trợ bảo mật thông tin và quản lý tài liệu trong môi trường web.

## Công nghệ sử dụng

### Backend
- Java
- Spring Boot
- Maven

### Frontend
- React
- TypeScript
- Vite

### Big Data & Search Engine
- Apache Spark
- Elasticsearch
- Kibana

### Database
- MySQL 8.x

### Triển khai
- Docker
- Docker Compose

### Bảo mật
- SSL Certificate
- HTTPS Keystore

## Cấu trúc thư mục

- `src/`: mã nguồn backend Spring Boot  
- `frontend/src/components/`: các thành phần giao diện  
- `frontend/src/pages/`: các trang chức năng  
- `spark-conf/`: cấu hình Spark  
- `spark-jobs/`: tác vụ Spark  
- `docs/`: tài liệu dự án  
- `scripts/`: script hỗ trợ  
- `docker-compose.yml`: cấu hình Docker  
- `docker-compose.secure.yml`: cấu hình chế độ bảo mật  

## Hướng dẫn chạy hệ thống

### 1. Chuẩn bị môi trường

Cài đặt các thành phần sau:

- Docker  
- JDK 17  
- Maven  
- Node.js >= 18  
- MySQL 8.x  

Tạo database:

```sql
CREATE DATABASE hospitaldb;
```

Nếu cần, chỉnh cấu hình database trong file `application.yml`.

---

### 2. Tạo chứng chỉ bảo mật

```powershell
./generate-dev-certs.ps1
```

---

### 3. Khởi động Docker

```bash
docker compose -f docker-compose.secure.yml up -d
```

Kiểm tra container:

```bash
docker ps
```

---

### 4. Chạy backend

```powershell
$env:SPRING_PROFILES_ACTIVE="secure"
mvn spring-boot:run
```

Backend chạy tại:

```text
https://localhost:8083
```

---

### 5. Chạy frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại:

```text
https://localhost:5173
```

---

## Tài khoản demo

- admin / Admin@123  
- doctor / Doctor@123  
- patient / Patient@123  

## Chức năng chính

### ADMIN
- Quản lý tài khoản người dùng  
- Phân quyền vai trò  
- Khóa / mở khóa tài khoản  
- Quản trị khóa bảo mật  
- Sao lưu khóa  
- Tái lập chỉ mục dữ liệu  
- Xem nhật ký truy cập  

### DOCTOR
- Tra cứu bệnh nhân theo mã bệnh nhân  
- Thêm hồ sơ bệnh án mới  
- Tìm kiếm hồ sơ theo mã hoặc từ khóa  
- Chỉnh sửa hồ sơ bệnh án  
- Xóa hồ sơ khi cần  

### PATIENT
- Xem hồ sơ bệnh án cá nhân  
- Cập nhật thông tin cá nhân  
- Theo dõi trạng thái hồ sơ  
- Đổi mật khẩu  

## Mục tiêu dự án

- Quản lý hồ sơ bệnh án điện tử  
- Tìm kiếm dữ liệu nhanh bằng Elasticsearch  
- Hỗ trợ xử lý dữ liệu lớn bằng Apache Spark  
- Ứng dụng công nghệ Big Data trong lĩnh vực y tế  