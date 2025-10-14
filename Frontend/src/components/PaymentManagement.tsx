import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Space, 
  Tag, 
  Row,
  Col,
  Statistic,
  Tabs,
  InputNumber,
  Alert
} from 'antd';
import {
  DollarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  BankOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;

interface Payment {
  id: string;
  elderlyId: string;
  elderlyName: string;
  amount: number;
  currency: 'VND' | 'USD';
  type: 'monthly_fee' | 'medical' | 'medication' | 'service' | 'other';
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'other';
  description: string;
  invoiceNumber?: string;
  notes?: string;
}

const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: '1',
      elderlyId: '1',
      elderlyName: 'Cụ Nguyễn Văn A',
      amount: 5000000,
      currency: 'VND',
      type: 'monthly_fee',
      status: 'paid',
      dueDate: '2024-01-01',
      paidDate: '2024-01-01',
      paymentMethod: 'bank_transfer',
      description: 'Phí chăm sóc tháng 1/2024',
      invoiceNumber: 'INV-2024-001',
      notes: 'Thanh toán đúng hạn'
    },
    {
      id: '2',
      elderlyId: '2',
      elderlyName: 'Cụ Trần Thị B',
      amount: 1200000,
      currency: 'VND',
      type: 'medical',
      status: 'pending',
      dueDate: '2024-01-15',
      paymentMethod: 'cash',
      description: 'Chi phí khám tim mạch',
      invoiceNumber: 'INV-2024-002',
      notes: 'Chờ thanh toán'
    },
    {
      id: '3',
      elderlyId: '1',
      elderlyName: 'Cụ Nguyễn Văn A',
      amount: 800000,
      currency: 'VND',
      type: 'medication',
      status: 'overdue',
      dueDate: '2024-01-10',
      paymentMethod: 'credit_card',
      description: 'Thuốc tim mạch tháng 1',
      invoiceNumber: 'INV-2024-003',
      notes: 'Quá hạn thanh toán'
    },
    {
      id: '4',
      elderlyId: '3',
      elderlyName: 'Cụ Lê Văn C',
      amount: 2000000,
      currency: 'VND',
      type: 'service',
      status: 'paid',
      dueDate: '2024-01-05',
      paidDate: '2024-01-05',
      paymentMethod: 'bank_transfer',
      description: 'Dịch vụ vật lý trị liệu',
      invoiceNumber: 'INV-2024-004'
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [form] = Form.useForm();

  const typeLabels = {
    monthly_fee: 'Phí chăm sóc hàng tháng',
    medical: 'Chi phí y tế',
    medication: 'Thuốc men',
    service: 'Dịch vụ',
    other: 'Khác'
  };

  const statusColors = {
    pending: 'orange',
    paid: 'green',
    overdue: 'red',
    cancelled: 'gray'
  };

  const statusLabels = {
    pending: 'Chờ thanh toán',
    paid: 'Đã thanh toán',
    overdue: 'Quá hạn',
    cancelled: 'Đã hủy'
  };

  const methodLabels = {
    cash: 'Tiền mặt',
    bank_transfer: 'Chuyển khoản',
    credit_card: 'Thẻ tín dụng',
    other: 'Khác'
  };

  const columns = [
    {
      title: 'Mã hóa đơn',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text: string) => (
        <div className="flex items-center">
          <FileTextOutlined className="mr-2 text-blue-500" />
          <span className="font-mono text-sm">{text}</span>
        </div>
      ),
    },
    {
      title: 'Người cao tuổi',
      dataIndex: 'elderlyName',
      key: 'elderlyName',
    },
    {
      title: 'Loại phí',
      dataIndex: 'type',
      key: 'type',
      render: (type: keyof typeof typeLabels) => typeLabels[type],
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Payment) => (
        <div className="text-right">
          <div className="font-medium">
            {amount.toLocaleString('vi-VN')} {record.currency}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof statusColors) => (
        <Tag color={statusColors[status]}>
          {statusLabels[status]}
        </Tag>
      ),
    },
    {
      title: 'Hạn thanh toán',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Payment) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          {record.status === 'pending' && (
            <Button 
              type="link" 
              onClick={() => handleMarkPaid(record.id)}
            >
              Đánh dấu đã thanh toán
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingPayment(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    form.setFieldsValue({
      ...payment,
      dueDate: dayjs(payment.dueDate),
      paidDate: payment.paidDate ? dayjs(payment.paidDate) : undefined
    });
    setIsModalVisible(true);
  };

  const handleView = (payment: Payment) => {
    setEditingPayment(payment);
    setIsModalVisible(true);
  };

  const handleMarkPaid = (id: string) => {
    setPayments(payments.map(p => 
      p.id === id 
        ? { 
            ...p, 
            status: 'paid' as const,
            paidDate: dayjs().format('YYYY-MM-DD')
          }
        : p
    ));
  };

  const handleSubmit = (values: any) => {
    if (editingPayment) {
      setPayments(payments.map(p => 
        p.id === editingPayment.id 
          ? { 
              ...p, 
              ...values,
              dueDate: values.dueDate.format('YYYY-MM-DD'),
              paidDate: values.paidDate ? values.paidDate.format('YYYY-MM-DD') : undefined
            }
          : p
      ));
    } else {
      const newPayment: Payment = {
        id: Date.now().toString(),
        ...values,
        dueDate: values.dueDate.format('YYYY-MM-DD'),
        paidDate: values.paidDate ? values.paidDate.format('YYYY-MM-DD') : undefined,
        invoiceNumber: `INV-2024-${String(Date.now()).slice(-3)}`,
        status: 'pending'
      };
      setPayments([...payments, newPayment]);
    }
    setIsModalVisible(false);
  };

  const getStatistics = () => {
    const total = payments.length;
    const paid = payments.filter(p => p.status === 'paid').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const overdue = payments.filter(p => p.status === 'overdue').length;
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    return { total, paid, pending, overdue, totalAmount, paidAmount };
  };

  const stats = getStatistics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý thanh toán</h1>
        <p className="text-gray-600">Theo dõi và quản lý các khoản thanh toán, hóa đơn của người cao tuổi</p>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng hóa đơn"
              value={stats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đã thanh toán"
              value={stats.paid}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Chờ thanh toán"
              value={stats.pending}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Quá hạn"
              value={stats.overdue}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Financial Summary */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats.totalAmount}
              prefix={<DollarOutlined />}
              suffix="VND"
              valueStyle={{ color: '#1890ff' }}
              formatter={(value) => value.toLocaleString('vi-VN')}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Đã thu"
              value={stats.paidAmount}
              prefix={<CheckCircleOutlined />}
              suffix="VND"
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => value.toLocaleString('vi-VN')}
            />
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {stats.overdue > 0 && (
        <Alert
          message="Cảnh báo thanh toán"
          description={`Có ${stats.overdue} hóa đơn quá hạn thanh toán. Vui lòng liên hệ khách hàng ngay.`}
          type="warning"
          icon={<ExclamationCircleOutlined />}
          showIcon
        />
      )}

      {/* Main Content */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Danh sách thanh toán</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm hóa đơn
          </Button>
        </div>

        <Tabs defaultActiveKey="all">
          <TabPane tab={`Tất cả (${stats.total})`} key="all">
            <Table 
              columns={columns} 
              dataSource={payments}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Chờ thanh toán (${stats.pending})`} key="pending">
            <Table 
              columns={columns} 
              dataSource={payments.filter(p => p.status === 'pending')}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Đã thanh toán (${stats.paid})`} key="paid">
            <Table 
              columns={columns} 
              dataSource={payments.filter(p => p.status === 'paid')}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Quá hạn (${stats.overdue})`} key="overdue">
            <Table 
              columns={columns} 
              dataSource={payments.filter(p => p.status === 'overdue')}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingPayment ? 'Sửa thông tin thanh toán' : 'Thêm hóa đơn mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="elderlyId"
                label="Người cao tuổi"
                rules={[{ required: true, message: 'Vui lòng chọn người cao tuổi' }]}
              >
                <Select placeholder="Chọn người cao tuổi">
                  <Option value="1">Cụ Nguyễn Văn A</Option>
                  <Option value="2">Cụ Trần Thị B</Option>
                  <Option value="3">Cụ Lê Văn C</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Loại phí"
                rules={[{ required: true, message: 'Vui lòng chọn loại phí' }]}
              >
                <Select placeholder="Chọn loại phí">
                  <Option value="monthly_fee">Phí chăm sóc hàng tháng</Option>
                  <Option value="medical">Chi phí y tế</Option>
                  <Option value="medication">Thuốc men</Option>
                  <Option value="service">Dịch vụ</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Số tiền"
                rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  placeholder="Nhập số tiền"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="currency"
                label="Đơn vị tiền tệ"
                rules={[{ required: true, message: 'Vui lòng chọn đơn vị tiền tệ' }]}
              >
                <Select placeholder="Chọn đơn vị tiền tệ">
                  <Option value="VND">VND</Option>
                  <Option value="USD">USD</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="Hạn thanh toán"
                rules={[{ required: true, message: 'Vui lòng chọn hạn thanh toán' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="paymentMethod"
                label="Phương thức thanh toán"
                rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
              >
                <Select placeholder="Chọn phương thức thanh toán">
                  <Option value="cash">Tiền mặt</Option>
                  <Option value="bank_transfer">Chuyển khoản</Option>
                  <Option value="credit_card">Thẻ tín dụng</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input placeholder="Nhập mô tả hóa đơn" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Ghi chú về hóa đơn..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingPayment ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PaymentManagement;
