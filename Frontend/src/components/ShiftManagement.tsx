import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  DatePicker,
  Select,
  Input,
  Space,
  Tag,
  message,
  Row,
  Col,
  Popconfirm,
  Upload,
  Alert,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  UploadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
  assignEldersToShift,
  startShift,
  completeShift,
  importShifts,
  Shift,
} from '../api/shifts';
import { getAllStaff, Staff } from '../api/staff';
import { fetchEldersController } from '../api/elders';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

interface ElderOption {
  elderId: number;
  fullName: string;
}

const ShiftManagement: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [elderList, setElderList] = useState<ElderOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<{ imported: number; failed: number } | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const { Text } = Typography;
  const [filters, setFilters] = useState<{
    staffId?: number;
    status?: string;
    from?: string;
    to?: string;
  }>({});

  const staffNameMap = useMemo(() => {
    const map = new Map<number, string>();
    staffList.forEach((staff) => {
      const userId = staff.user?.userId ?? staff.userId;
      if (userId !== undefined && userId !== null) {
        map.set(
          userId,
          staff.user?.fullName || `ID: ${userId}`,
        );
      }
    });
    return map;
  }, [staffList]);

  useEffect(() => {
    loadData();
    loadStaff();
    loadElders();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getShifts(filters);
      setShifts(data);
    } catch (error: any) {
      message.error('Không thể tải danh sách ca trực');
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const data = await getAllStaff();
      setStaffList(data);
    } catch (error) {
      console.error('Error loading staff:', error);
      setStaffList([]); // Set empty array on error
    }
  };

  const loadElders = async () => {
    try {
      const data = await fetchEldersController();
      setElderList(
        data.map((elder: any) => ({
          elderId: parseInt(elder.id),
          fullName: elder.fullName,
        })),
      );
    } catch (error) {
      console.error('Error loading elders:', error);
    }
  };

  const handleCreate = () => {
    setEditingShift(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);
    form.setFieldsValue({
      staffId: shift.staff?.userId ?? shift.staffId,
      startTime: dayjs(shift.startTime),
      endTime: dayjs(shift.endTime),
      location: shift.location,
      note: shift.note,
    });
    setModalVisible(true);
  };

  const handleDelete = async (shiftId: number) => {
    try {
      await deleteShift(shiftId);
      message.success('Đã xóa ca trực');
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xóa thất bại');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const staffUserId = Number(values.staffId);
      if (!Number.isFinite(staffUserId)) {
        message.error('ID nhân viên không hợp lệ');
        return;
      }

      const payload = {
        staffId: staffUserId,
        startTime: values.startTime.toISOString(), // ✅ ISO 8601 hợp lệ
        endTime: values.endTime.toISOString(),
        location: values.location,
        note: values.note,
      };
      console.log('⏰ Payload gửi:', payload);

      if (editingShift) {
        await updateShift(editingShift.shiftId, payload);
        message.success('Cập nhật ca trực thành công');
      } else {
        await createShift(payload);
        message.success('Tạo ca trực thành công');
      }

      setModalVisible(false);
      loadData();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || 'Lưu thất bại. Vui lòng thử lại.',
      );
    }
  };

  const handleAssignElders = (shift: Shift) => {
    setSelectedShift(shift);
    assignForm.setFieldsValue({
      elderIds: shift.elders?.map((e) => e.elderId) || [],
    });
    setAssignModalVisible(true);
  };

  const handleAssignSubmit = async () => {
    try {
      const values = await assignForm.validateFields();
      if (!selectedShift) return;

      await assignEldersToShift(selectedShift.shiftId, values.elderIds);
      message.success('Phân công người cao tuổi thành công');
      setAssignModalVisible(false);
      loadData();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || 'Phân công thất bại. Vui lòng thử lại.',
      );
    }
  };

  const handleStartShift = async (shiftId: number) => {
    try {
      await startShift(shiftId);
      message.success('Đã bắt đầu ca trực');
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Thất bại');
    }
  };

  const handleCompleteShift = async (shiftId: number) => {
    try {
      await completeShift(shiftId);
      message.success('Đã hoàn thành ca trực');
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Thất bại');
    }
  };

  const handleImport = async (file: File) => {
    try {
      setImporting(true);
      setImportErrors([]);
      setImportResult(null);
      
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'application/csv',
      ];
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        message.error('File không hợp lệ. Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV (.csv)');
        setImporting(false);
        return false;
      }

      const result = await importShifts(file);
      setImportResult({ imported: result.imported, failed: result.failed });
      
      if (result.success) {
        if (result.imported > 0) {
          message.success(
            `Import thành công! Đã tạo ${result.imported} ca trực. ${result.failed > 0 ? `${result.failed} ca trực bị lỗi.` : ''}`
          );
          loadData();
        }
        
        if (result.errors && result.errors.length > 0) {
          setImportErrors(result.errors);
        }
        
        if (result.failed === 0) {
          // All successful, close modal after 2 seconds
          setTimeout(() => {
            setImportModalVisible(false);
            setImportErrors([]);
            setImportResult(null);
          }, 2000);
        }
      } else {
        message.warning(result.message || 'Import thất bại');
        if (result.errors && result.errors.length > 0) {
          setImportErrors(result.errors);
        }
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể import file. Vui lòng kiểm tra định dạng file.';
      message.error(errorMessage);
      
      // Try to extract errors from response
      if (error?.response?.data?.errors) {
        setImportErrors(error.response.data.errors);
      }
    } finally {
      setImporting(false);
    }
    return false; // Prevent default upload
  };

  const handleDownloadTemplate = () => {
    // Create template Excel data with examples
    const templateData = [
      ['Mã nhân viên', 'Tên nhân viên', 'Ngày bắt đầu', 'Giờ bắt đầu', 'Ngày kết thúc', 'Giờ kết thúc', 'Địa điểm', 'Ghi chú'],
      ['1', 'Nguyễn Văn A', '2024-01-15', '08:00', '2024-01-15', '16:00', 'Phòng 101', 'Ca sáng'],
      ['2', 'Trần Thị B', '15/01/2024', '16:00', '15/01/2024', '00:00', 'Phòng 102', 'Ca tối'],
      ['3', 'Lê Văn C', '2024-01-16', '08:00', '2024-01-16', '12:00', 'Phòng 103', 'Ca sáng'],
      ['', '', '', '', '', '', '', ''],
      ['Lưu ý:', '', '', '', '', '', '', ''],
      ['- Mã nhân viên: Bắt buộc, phải tồn tại trong hệ thống', '', '', '', '', '', '', ''],
      ['- Ngày: Hỗ trợ YYYY-MM-DD (2024-01-15) hoặc DD/MM/YYYY (15/01/2024)', '', '', '', '', '', '', ''],
      ['- Giờ: Định dạng HH:mm (08:00, 16:00, 00:00)', '', '', '', '', '', '', ''],
      ['- Địa điểm và Ghi chú: Tùy chọn', '', '', '', '', '', '', ''],
      ['- Dòng đầu tiên là tiêu đề, không được xóa', '', '', '', '', '', '', ''],
    ];

    // Convert to CSV with proper escaping
    const csv = templateData.map(row => 
      row.map(cell => {
        const cellStr = String(cell || '');
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr || '';
      }).join(',')
    ).join('\n');
    
    // Add BOM for UTF-8 to ensure Vietnamese characters display correctly in Excel
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mau_import_lich_truc_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      Scheduled: { color: 'blue', text: 'Đã lên lịch' },
      InProgress: { color: 'green', text: 'Đang thực hiện' },
      Completed: { color: 'default', text: 'Hoàn thành' },
      Cancelled: { color: 'red', text: 'Đã hủy' },
    };

    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const columns: ColumnsType<Shift> = [
    {
      title: 'ID',
      dataIndex: 'shiftId',
      key: 'shiftId',
      width: 80,
    },
    {
      title: 'Nhân viên',
      key: 'staff',
      render: (_, record) => {
        const name =
          record.staff?.fullName ||
          (record.staffId !== undefined
            ? staffNameMap.get(record.staffId)
            : undefined);
        return name || `ID: ${record.staffId}`;
      },
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Người cao tuổi',
      key: 'elders',
      render: (_, record) => (
        <div>
          {record.elders && record.elders.length > 0 ? (
            <Tag color="blue">{record.elders.length} người</Tag>
          ) : (
            <Tag color="default">Chưa phân công</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleAssignElders(record)}
          >
            Phân công
          </Button>
          {record.status === 'Scheduled' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleStartShift(record.shiftId)}
            >
              Bắt đầu
            </Button>
          )}
          {record.status === 'InProgress' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleCompleteShift(record.shiftId)}
            >
              Hoàn thành
            </Button>
          )}
          <Popconfirm
            title="Bạn có chắc muốn xóa ca trực này?"
            onConfirm={() => handleDelete(record.shiftId)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <CalendarOutlined className="mr-2" />
            Quản lý ca trực
          </h2>
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
            >
              Tải mẫu Excel
            </Button>
            <Button
              icon={<UploadOutlined />}
              onClick={() => setImportModalVisible(true)}
            >
              Import lịch trực
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Tạo ca trực mới
            </Button>
          </Space>
        </div>

        <Row gutter={16} className="mb-4">
          <Col span={6}>
            <Select
              placeholder="Lọc theo nhân viên"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  staffId:
                    value !== undefined && value !== null
                      ? Number(value)
                      : undefined,
                })
              }
            >
              {Array.isArray(staffList) &&
                staffList.map((staff) => (
                  <Option
                    key={staff.staffId}
                    value={staff.user?.userId ?? staff.userId}
                  >
                    {staff.user?.fullName ||
                      `ID: ${staff.user?.userId ?? staff.userId}`}
                  </Option>
                ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) =>
                setFilters({ ...filters, status: value || undefined })
              }
            >
              <Option value="Scheduled">Đã lên lịch</Option>
              <Option value="InProgress">Đang thực hiện</Option>
              <Option value="Completed">Hoàn thành</Option>
              <Option value="Cancelled">Đã hủy</Option>
            </Select>
          </Col>
          <Col span={12}>
            <RangePicker
              showTime
              style={{ width: '100%' }}
              onChange={(dates) => {
                if (dates) {
                  setFilters({
                    ...filters,
                    from: dates[0]?.format('YYYY-MM-DD'),
                    to: dates[1]?.format('YYYY-MM-DD'),
                  });
                } else {
                  setFilters({
                    ...filters,
                    from: undefined,
                    to: undefined,
                  });
                }
              }}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={shifts}
          loading={loading}
          rowKey="shiftId"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal tạo/sửa ca trực */}
      <Modal
        title={editingShift ? 'Chỉnh sửa ca trực' : 'Tạo ca trực mới'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="staffId"
            label="Nhân viên"
            rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
          >
            <Select placeholder="Chọn nhân viên">
              {Array.isArray(staffList) &&
                staffList.map((staff) => (
                  <Option
                    key={staff.staffId}
                    value={staff.user?.userId ?? staff.userId}
                  >
                    {staff.user?.fullName ||
                      `ID: ${staff.user?.userId ?? staff.userId}`}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="startTime"
            label="Thời gian bắt đầu"
            rules={[
              { required: true, message: 'Vui lòng chọn thời gian bắt đầu' },
            ]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="endTime"
            label="Thời gian kết thúc"
            rules={[
              { required: true, message: 'Vui lòng chọn thời gian kết thúc' },
            ]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item name="location" label="Địa điểm">
            <Input placeholder="Nhập địa điểm" />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <TextArea rows={3} placeholder="Nhập ghi chú" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal phân công người cao tuổi */}
      <Modal
        title="Phân công người cao tuổi"
        open={assignModalVisible}
        onOk={handleAssignSubmit}
        onCancel={() => setAssignModalVisible(false)}
        width={500}
        destroyOnClose
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item
            name="elderIds"
            label="Chọn người cao tuổi"
            rules={[
              {
                required: true,
                message: 'Vui lòng chọn ít nhất một người cao tuổi',
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn người cao tuổi"
              showSearch
              filterOption={(input, option) => {
                const text = typeof option?.children === 'string' 
                  ? option.children 
                  : Array.isArray(option?.children)
                    ? option.children.map((c: any) => String(c)).join('')
                    : String(option?.children || '');
                return text.toLowerCase().includes(input.toLowerCase());
              }}
            >
              {elderList.map((elder) => (
                <Option key={elder.elderId} value={elder.elderId}>
                  {elder.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Import lịch trực */}
      <Modal
        title="Import lịch trực từ Excel"
        open={importModalVisible}
        onCancel={() => {
          setImportModalVisible(false);
          setImportErrors([]);
          setImportResult(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setImportModalVisible(false);
              setImportErrors([]);
              setImportResult(null);
            }}
          >
            Đóng
          </Button>,
        ]}
        width={700}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            message="Hướng dẫn Import"
            description={
              <div>
                <Text>
                  <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                    <li>File Excel/CSV phải có các cột: <strong>Mã nhân viên</strong>, Tên nhân viên, <strong>Ngày bắt đầu</strong>, <strong>Giờ bắt đầu</strong>, <strong>Ngày kết thúc</strong>, <strong>Giờ kết thúc</strong>, Địa điểm (tùy chọn), Ghi chú (tùy chọn)</li>
                    <li>Định dạng ngày: YYYY-MM-DD hoặc DD/MM/YYYY (ví dụ: 2024-01-15 hoặc 15/01/2024)</li>
                    <li>Định dạng giờ: HH:mm (ví dụ: 08:00, 16:00)</li>
                    <li>Mã nhân viên phải tồn tại trong hệ thống</li>
                    <li>Dòng đầu tiên là tiêu đề, dữ liệu bắt đầu từ dòng thứ 2</li>
                  </ul>
                </Text>
              </div>
            }
            type="info"
            showIcon
          />
          
          {importResult && (
            <Alert
              message={`Kết quả import: ${importResult.imported} ca trực thành công, ${importResult.failed} ca trực lỗi`}
              type={importResult.failed === 0 ? 'success' : 'warning'}
              showIcon
            />
          )}

          {importErrors.length > 0 && (
            <Alert
              message="Chi tiết lỗi"
              description={
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                    {importErrors.map((error, index) => (
                      <li key={index} style={{ marginBottom: '4px' }}>
                        <Text type="danger">{error}</Text>
                      </li>
                    ))}
                  </ul>
                  {importErrors.length >= 10 && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      (Chỉ hiển thị 10 lỗi đầu tiên)
                    </Text>
                  )}
                </div>
              }
              type="error"
              showIcon
            />
          )}
          
          <Upload
            accept=".xlsx,.xls,.csv"
            showUploadList={false}
            beforeUpload={handleImport}
            disabled={importing}
          >
            <Button
              type="primary"
              icon={<UploadOutlined />}
              loading={importing}
              block
              size="large"
            >
              {importing ? 'Đang import...' : 'Chọn file Excel/CSV để import'}
            </Button>
          </Upload>

          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
            block
          >
            Tải file mẫu CSV
          </Button>
        </Space>
      </Modal>
    </div>
  );
};

export default ShiftManagement;

