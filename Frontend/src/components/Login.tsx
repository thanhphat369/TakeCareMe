// import React, { useState } from 'react';
// import { Card, Button, Form, Input, Alert, message } from 'antd';
// import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
// import api from '../config/api';

// // ====================
// // Interface props và kiểu dữ liệu response
// // ====================

// // Props nhận từ component cha:
// // - onSuccess: callback khi đăng nhập thành công
// // - onShowRegister: callback chuyển sang giao diện đăng ký
// interface LoginProps {
//   onSuccess: () => void;
//   onShowRegister: () => void;
// }

// // Kiểu dữ liệu response trả về từ backend (NestJS AuthController)
// interface LoginResponse {
//   accessToken: string;
//   user: {
//     userId: number;
//     fullName: string;
//     email: string;
//     role: string;
//     avatar?: string;
//   };
// }

// // ====================
// // Component chính
// // ====================
// const Login: React.FC<LoginProps> = ({ onSuccess, onShowRegister }) => {
//   // Biến state lưu email và password nhập từ form
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   // Ant Design form instance (hiện chưa dùng nhiều, nhưng có thể dùng để reset form sau này)
//   const [form] = Form.useForm();

//   // Trạng thái tải và lỗi
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // ====================
//   // Hàm xử lý đăng nhập
//   // ====================
//   const handleLogin = async (values: { email: string; password: string }) => {
//     try {
//       setLoading(true);   // Hiển thị trạng thái loading trên nút
//       setError(null);     // Xóa lỗi cũ trước khi gọi API

//       // Gọi API login tới backend (qua axios instance `api`)
//       const res = await api.post<LoginResponse>('/api/auth/login', values);
//       const { accessToken, user } = res.data;

//       // Lưu token và thông tin user vào localStorage để tái sử dụng (ví dụ cho AuthGuard)
//       localStorage.setItem('accessToken', accessToken);
//       localStorage.setItem('userData', JSON.stringify(user));

//       // Hiển thị toast chào mừng
//       message.success(`Xin chào ${user.fullName}`);

//       // Chuyển sang màn hình sau login
//       onSuccess?.();
//     } catch (err: any) {
//       console.error('❌ Lỗi đăng nhập:', err);

//       // Lấy thông điệp lỗi trả về từ backend (NestJS UnauthorizedException)
//       const backendMessage = err.response?.data?.message;

//       // Nếu backend trả về mảng message (NestJS class-validator thường vậy) → nối lại thành chuỗi
//       const msg = Array.isArray(backendMessage)
//         ? backendMessage.join(', ')
//         : backendMessage || 'Đăng nhập thất bại, vui lòng thử lại.';

//       // Chỉ hiển thị 1 lỗi (Alert dưới form), không hiển thị popup message.error để tránh trùng lặp
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ====================
//   // UI Giao diện Login Form
//   // ====================
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <Card
//         className="w-full max-w-md shadow-xl rounded-2xl"
//         // Tiêu đề ở đầu thẻ login
//         title={
//           <div className="text-center">
//             <SafetyOutlined className="text-4xl text-blue-600 mb-2" />
//             <h1 className="text-2xl font-bold text-gray-800">Take Care Me</h1>
//             <p className="text-gray-600 text-sm">Hệ thống chăm sóc người cao tuổi</p>
//           </div>
//         }
//       >
//         {/* 
//           Ant Design Form:
//           - layout="vertical" giúp label nằm trên input
//           - onFinish tự động gọi khi người dùng bấm Enter hoặc nút submit
//         */}
//         <Form
//           layout="vertical"
//           onFinish={() => handleLogin({ email, password })} // Gọi hàm login với state hiện tại
//         >
//           {/* ===================== EMAIL ===================== */}
//           <Form.Item label="Email" required>
//             <Input
//               size="large"
//               prefix={<UserOutlined />}
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Nhập email"
//               // Không cần onPressEnter — Form sẽ tự submit khi Enter
//             />
//           </Form.Item>

//           {/* ===================== PASSWORD ===================== */}
//           <Form.Item label="Mật khẩu" required>
//             <Input.Password
//               size="large"
//               prefix={<LockOutlined />}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="Nhập mật khẩu"
//             />
//           </Form.Item>

//           {/* ===================== ALERT LỖI ===================== */}
//           {error && (
//             <Alert
//               message="Lỗi đăng nhập"
//               description={error}
//               type="error"
//               showIcon
//               closable
//               onClose={() => setError(null)} // cho phép người dùng tắt thông báo
//               className="mb-4"
//             />
//           )}

//           {/* ===================== NÚT ĐĂNG NHẬP ===================== */}
//           <Form.Item>
//             <Button
//               type="primary"
//               htmlType="submit" // ✅ Tự động trigger onFinish khi click hoặc nhấn Enter
//               size="large"
//               loading={loading}
//               disabled={!email || !password} // ✅ Ngăn submit khi thiếu thông tin
//               className="w-full"
//               style={{ height: '48px', fontSize: '16px' }}
//             >
//               {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
//             </Button>
//           </Form.Item>
//         </Form>

//         {/* ===================== LIÊN KẾT SANG ĐĂNG KÝ ===================== */}
//         <div className="text-center mt-4">
//           <Button
//             type="link"
//             onClick={onShowRegister}
//             className="text-blue-600 font-medium"
//           >
//             Chưa có tài khoản? Đăng ký ngay
//           </Button>
//         </div>
        
//       </Card>
//     </div>
//   );
// };

// export default Login;
import React, { useState } from 'react';
import { Card, Button, Form, Input, Alert, message } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import api from '../config/api';

// ====================
// Interface props và kiểu dữ liệu response
// ====================

// Props nhận từ component cha:
// - onSuccess: callback khi đăng nhập thành công
// - onShowRegister: callback chuyển sang giao diện đăng ký
interface LoginProps {
  onSuccess: () => void;
  onShowRegister: () => void;
}

// Kiểu dữ liệu response trả về từ backend (NestJS AuthController)
interface LoginResponse {
  accessToken: string;
  user: {
    userId: number;
    fullName: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

// ====================
// Component chính
// ====================
const Login: React.FC<LoginProps> = ({ onSuccess, onShowRegister }) => {
  // Biến state lưu email và password nhập từ form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Ant Design form instance (hiện chưa dùng nhiều, nhưng có thể dùng để reset form sau này)
  const [form] = Form.useForm();

  // Trạng thái tải và lỗi
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ====================
  // Hàm xử lý đăng nhập
  // ====================
  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);   // Hiển thị trạng thái loading trên nút
      setError(null);     // Xóa lỗi cũ trước khi gọi API
  
      // Gọi API login tới backend (qua axios instance `api`)
      const res = await api.post<LoginResponse>('/api/auth/login', values);
      
      const { accessToken, user } = res.data;

      // Lưu token và thông tin user vào localStorage để tái sử dụng (ví dụ cho AuthGuard)
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userData', JSON.stringify(user));

      // Hiển thị toast chào mừng
      message.success(`Xin chào ${user.fullName}`);

      // Chuyển sang màn hình sau login
      onSuccess?.();
    } catch (err: any) {
      console.error('❌ Lỗi đăng nhập:', err);

      // Lấy thông điệp lỗi trả về từ backend (NestJS UnauthorizedException)
      const backendMessage = err.response?.data?.message;

      // Nếu backend trả về mảng message (NestJS class-validator thường vậy) → nối lại thành chuỗi
      const msg = Array.isArray(backendMessage)
        ? backendMessage.join(', ')
        : backendMessage || 'Đăng nhập thất bại, vui lòng thử lại.';

      // Chỉ hiển thị 1 lỗi (Alert dưới form), không hiển thị popup message.error để tránh trùng lặp
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ====================
  // UI Giao diện Login Form
  // ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card
        className="w-full max-w-md shadow-xl rounded-2xl"
        // Tiêu đề ở đầu thẻ login
        title={
          <div className="text-center">
            <SafetyOutlined className="text-4xl text-blue-600 mb-2" />
            <h1 className="text-2xl font-bold text-gray-800">Take Care Me</h1>
            <p className="text-gray-600 text-sm">Hệ thống chăm sóc người cao tuổi</p>
          </div>
        }
      >
        {/* 
          Ant Design Form:
          - layout="vertical" giúp label nằm trên input
          - onFinish tự động gọi khi người dùng bấm Enter hoặc nút submit
        */}
        <Form
          layout="vertical"
          onFinish={() => handleLogin({ email, password })} // Gọi hàm login với state hiện tại
        >
          {/* ===================== EMAIL ===================== */}
          <Form.Item label="Email" required>
            <Input
              size="large"
              prefix={<UserOutlined />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
              // Không cần onPressEnter — Form sẽ tự submit khi Enter
            />
          </Form.Item>

          {/* ===================== PASSWORD ===================== */}
          <Form.Item label="Mật khẩu" required>
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>

          {/* ===================== ALERT LỖI ===================== */}
          {error && (
            <Alert
              message="Lỗi đăng nhập"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)} // cho phép người dùng tắt thông báo
              className="mb-4"
            />
          )}

          {/* ===================== NÚT ĐĂNG NHẬP ===================== */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit" // ✅ Tự động trigger onFinish khi click hoặc nhấn Enter
              size="large"
              loading={loading}
              disabled={!email || !password} // ✅ Ngăn submit khi thiếu thông tin
              className="w-full"
              style={{ height: '48px', fontSize: '16px' }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </Form.Item>
        </Form>

        {/* ===================== LIÊN KẾT SANG ĐĂNG KÝ ===================== */}
        <div className="text-center mt-4">
          <Button
            type="link"
            onClick={onShowRegister}
            className="text-blue-600 font-medium"
          >
            Chưa có tài khoản? Đăng ký ngay
          </Button>
        </div>
        
      </Card>
    </div>
  );
};

export default Login;