# Hệ thống Thông báo - Notification System

## Tổng quan

Hệ thống thông báo được xây dựng dựa trên các API từ Backend Alerts Service, cung cấp khả năng quản lý và hiển thị thông báo real-time cho hệ thống chăm sóc người cao tuổi.

## Cấu trúc

### 1. Notification Service (`src/services/notificationService.ts`)

**Chức năng chính:**
- Kết nối với Backend Alerts API
- Quản lý alerts (tạo, xem, xác nhận, giải quyết)
- Hiển thị thông báo UI
- Real-time notification listener

**API Functions:**
```typescript
// Lấy danh sách alerts
getAlerts(filters?: AlertFilters): Promise<Alert[]>

// Tạo alert mới
createAlert(alertData: CreateAlertDto): Promise<Alert>

// Lấy thống kê alerts
getAlertStatistics(elderId?: number): Promise<AlertStatistics>

// Xác nhận alert
acknowledgeAlert(alertId: number): Promise<Alert>

// Giải quyết alert
resolveAlert(alertId: number, notes?: string): Promise<Alert>
```

### 2. Notification Hook (`src/hooks/useNotifications.ts`)

**Chức năng:**
- Quản lý state của notifications
- Auto-refresh alerts
- Real-time listener
- Kiểm tra alerts khẩn cấp

**Sử dụng:**
```typescript
const { 
  alerts, 
  statistics, 
  loading, 
  error, 
  refreshAlerts, 
  hasNewAlerts, 
  criticalAlertsCount 
} = useNotifications(elderId);
```

### 3. Notification Components

#### AlertBanner (`src/components/AlertBanner.tsx`)
- Hiển thị banner cảnh báo ở đầu trang
- Tự động ẩn/hiện dựa trên alerts khẩn cấp
- Có thể dismiss

#### NotificationCenter (`src/components/NotificationCenter.tsx`)
- Trung tâm quản lý tất cả notifications
- Hiển thị danh sách alerts với filters
- Thống kê real-time
- Actions: acknowledge, resolve, assign

## Tích hợp vào App

### 1. App.tsx
```typescript
// Import components
import AlertBanner from './components/AlertBanner';
import NotificationCenter from './components/NotificationCenter';
import { useNotifications } from './hooks/useNotifications';

// Sử dụng hook
const { criticalAlertsCount, hasNewAlerts } = useNotifications();

// Thêm vào menu
{
  key: 'notifications',
  icon: <BellOutlined />,
  label: 'Trung tâm thông báo',
  roles: ['SuperAdmin', 'Admin', 'Doctor', 'Staff', 'Family']
}

// Thêm vào content
case 'notifications':
  return <NotificationCenter />;

// Thêm AlertBanner vào content area
<AlertBanner />
{renderContent()}
```

### 2. Login Component
- Hiển thị số lượng alerts khẩn cấp
- Kiểm tra alerts khi load trang
- Badge notification trên icon

## Backend API Endpoints

Hệ thống sử dụng các endpoints từ Backend Alerts Service:

```
GET    /api/alerts              - Lấy danh sách alerts
POST   /api/alerts              - Tạo alert mới
GET    /api/alerts/statistics   - Lấy thống kê
GET    /api/alerts/recent       - Lấy alerts gần đây
GET    /api/alerts/:id          - Lấy chi tiết alert
PATCH  /api/alerts/:id/acknowledge - Xác nhận alert
PATCH  /api/alerts/:id/resolve    - Giải quyết alert
PATCH  /api/alerts/:id/assign     - Gán alert
```

## Cấu hình

### Environment Variables
```env
REACT_APP_API_URL=http://localhost:3000
```

### Local Storage Keys
- `accessToken`: JWT token
- `userData`: Thông tin user
- `lastAlertId`: ID alert cuối cùng
- `rememberEmail`: Email đã lưu

## Tính năng

### 1. Real-time Notifications
- Polling mỗi 30 giây để kiểm tra alerts mới
- Auto hiển thị notification cho alerts mới
- Kiểm tra alerts khẩn cấp mỗi phút

### 2. Alert Management
- **Severity Levels**: Low, Medium, High, Critical
- **Status**: Open, Acknowledged, Resolved
- **Actions**: Acknowledge, Resolve, Assign
- **Filters**: By elder, status, severity, assignee

### 3. UI Features
- Badge hiển thị số lượng alerts
- Banner cảnh báo khẩn cấp
- Notification center với full management
- Auto-dismiss notifications
- Color coding theo severity

## Sử dụng

### 1. Trong Component
```typescript
import { useNotifications } from '../hooks/useNotifications';

const MyComponent = () => {
  const { alerts, criticalAlertsCount, refreshAlerts } = useNotifications();
  
  return (
    <div>
      {criticalAlertsCount > 0 && (
        <Alert message={`Có ${criticalAlertsCount} cảnh báo khẩn cấp`} />
      )}
    </div>
  );
};
```

### 2. Tạo Alert
```typescript
import { createAlert } from '../services/notificationService';

const handleCreateAlert = async () => {
  try {
    const alert = await createAlert({
      elderId: 1,
      type: 'Health Emergency',
      severity: 'Critical',
      notes: 'Cần can thiệp ngay lập tức'
    });
    console.log('Alert created:', alert);
  } catch (error) {
    console.error('Error creating alert:', error);
  }
};
```

### 3. Hiển thị Notification
```typescript
import { showAlertNotification } from '../services/notificationService';

// Hiển thị notification cho alert mới
showAlertNotification(alert);
```

## Lưu ý

1. **Authentication**: Tất cả API calls đều cần JWT token
2. **Permissions**: Một số actions chỉ dành cho Admin/Doctor
3. **Real-time**: Hiện tại sử dụng polling, có thể nâng cấp lên WebSocket
4. **Performance**: Có thể cần optimize cho large datasets
5. **Error Handling**: Tất cả errors đều được handle và hiển thị user-friendly

## Mở rộng

### 1. WebSocket Integration
```typescript
// Có thể thay thế polling bằng WebSocket
const socket = new WebSocket('ws://localhost:3000');
socket.onmessage = (event) => {
  const alert = JSON.parse(event.data);
  showAlertNotification(alert);
};
```

### 2. Push Notifications
```typescript
// Tích hợp với browser push notifications
if ('Notification' in window) {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      // Send push notification
    }
  });
}
```

### 3. Email/SMS Integration
```typescript
// Gửi email/SMS cho alerts khẩn cấp
const sendEmergencyAlert = async (alert) => {
  if (alert.severity === 'Critical') {
    await sendEmail(alert);
    await sendSMS(alert);
  }
};
```

