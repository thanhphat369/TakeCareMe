import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  message,
  Modal,
  Upload,
  Tabs,
  Tag,
  Tooltip,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { nutritionExerciseApi, NutritionProfile, ExerciseProfile, ProfileStatistics } from '../api/nutritionExerciseApi';
import NutritionProfileModal from './modals/NutritionProfileModal';
import ExerciseProfileModal from './modals/ExerciseProfileModal';

const { TabPane } = Tabs;
const { Search } = Input;
const { Option } = Select;

interface NutritionExerciseProfileProps {
  selectedElderId?: number;
}

const NutritionExerciseProfile: React.FC<NutritionExerciseProfileProps> = ({ selectedElderId }) => {
  const [activeTab, setActiveTab] = useState('nutrition');
  const [nutritionProfiles, setNutritionProfiles] = useState<NutritionProfile[]>([]);
  const [exerciseProfiles, setExerciseProfiles] = useState<ExerciseProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<ProfileStatistics | null>(null);
  
  // Modal states
  const [nutritionModalVisible, setNutritionModalVisible] = useState(false);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [editingNutrition, setEditingNutrition] = useState<NutritionProfile | null>(null);
  const [editingExercise, setEditingExercise] = useState<ExerciseProfile | null>(null);
  
  // Filter states
  const [searchText, setSearchText] = useState('');
  const [filterElderId, setFilterElderId] = useState<number | undefined>(selectedElderId);

  useEffect(() => {
    loadData();
    loadStatistics();
  }, []);

  useEffect(() => {
    if (selectedElderId) {
      setFilterElderId(selectedElderId);
    }
  }, [selectedElderId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [nutritionResponse, exerciseResponse] = await Promise.all([
        nutritionExerciseApi.getAllNutritionProfiles(),
        nutritionExerciseApi.getAllExerciseProfiles()
      ]);

      if (nutritionResponse.data.success) {
        setNutritionProfiles(nutritionResponse.data.data);
      }

      if (exerciseResponse.data.success) {
        setExerciseProfiles(exerciseResponse.data.data);
      }
    } catch (error) {
      message.error('Không thể tải dữ liệu hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await nutritionExerciseApi.getStatistics();
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Không thể tải thống kê:', error);
    }
  };

  const handleDeleteNutrition = async (id: number) => {
    try {
      const response = await nutritionExerciseApi.deleteNutritionProfile(id);
      if (response.data.success) {
        message.success('Xóa hồ sơ dinh dưỡng thành công');
        loadData();
        loadStatistics();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('Không thể xóa hồ sơ dinh dưỡng');
    }
  };

  const handleDeleteExercise = async (id: number) => {
    try {
      const response = await nutritionExerciseApi.deleteExerciseProfile(id);
      if (response.data.success) {
        message.success('Xóa hồ sơ vận động thành công');
        loadData();
        loadStatistics();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('Không thể xóa hồ sơ vận động');
    }
  };

  const handleExportNutrition = async () => {
    try {
      const response = await nutritionExerciseApi.exportNutritionProfiles();
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nutrition-profiles-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('Xuất file hồ sơ dinh dưỡng thành công');
    } catch (error) {
      message.error('Không thể xuất file hồ sơ dinh dưỡng');
    }
  };

  const handleExportExercise = async () => {
    try {
      const response = await nutritionExerciseApi.exportExerciseProfiles();
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `exercise-profiles-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('Xuất file hồ sơ vận động thành công');
    } catch (error) {
      message.error('Không thể xuất file hồ sơ vận động');
    }
  };

  const handleImportNutrition = async (file: File) => {
    try {
      const response = await nutritionExerciseApi.importNutritionProfiles(file);
      if (response.data.success) {
        message.success(response.data.message);
        loadData();
        loadStatistics();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('Không thể import hồ sơ dinh dưỡng');
    }
    return false; // Prevent default upload behavior
  };

  const handleImportExercise = async (file: File) => {
    try {
      const response = await nutritionExerciseApi.importExerciseProfiles(file);
      if (response.data.success) {
        message.success(response.data.message);
        loadData();
        loadStatistics();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('Không thể import hồ sơ vận động');
    }
    return false; // Prevent default upload behavior
  };

  // Filter data based on search and elder selection
  const filteredNutritionProfiles = nutritionProfiles.filter(profile => {
    const matchesSearch = !searchText || 
      profile.elder?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      profile.dietaryRestrictions?.toLowerCase().includes(searchText.toLowerCase()) ||
      profile.favoriteFoods?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesElder = !filterElderId || profile.elderId === filterElderId;
    
    return matchesSearch && matchesElder;
  });

  const filteredExerciseProfiles = exerciseProfiles.filter(profile => {
    const matchesSearch = !searchText || 
      profile.elder?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      profile.exerciseType?.toLowerCase().includes(searchText.toLowerCase()) ||
      profile.preferredActivities?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesElder = !filterElderId || profile.elderId === filterElderId;
    
    return matchesSearch && matchesElder;
  });

  const nutritionColumns: ColumnsType<NutritionProfile> = [
    {
      title: 'ID',
      dataIndex: 'nutritionId',
      key: 'nutritionId',
      width: 80,
    },
    {
      title: 'Người cao tuổi',
      dataIndex: 'elder',
      key: 'elderName',
      render: (elder) => elder?.fullName || 'N/A',
      width: 150,
    },
    {
      title: 'Hạn chế ăn uống',
      dataIndex: 'dietaryRestrictions',
      key: 'dietaryRestrictions',
      render: (text) => (
        <Tooltip title={text}>
          <span>{text ? (text.length > 30 ? text.substring(0, 30) + '...' : text) : 'Không có'}</span>
        </Tooltip>
      ),
      width: 200,
    },
    {
      title: 'Món ăn yêu thích',
      dataIndex: 'favoriteFoods',
      key: 'favoriteFoods',
      render: (text) => (
        <Tooltip title={text}>
          <span>{text ? (text.length > 30 ? text.substring(0, 30) + '...' : text) : 'Không có'}</span>
        </Tooltip>
      ),
      width: 200,
    },
    {
      title: 'Dị ứng',
      dataIndex: 'allergies',
      key: 'allergies',
      render: (text) => text ? <Tag color="red">{text}</Tag> : <Tag>Không có</Tag>,
      width: 120,
    },
    {
      title: 'Calo/ngày',
      dataIndex: 'dailyCalories',
      key: 'dailyCalories',
      render: (value) => value ? `${value} cal` : 'Chưa đặt',
      width: 100,
    },
    {
      title: 'Nước/ngày',
      dataIndex: 'dailyWaterIntake',
      key: 'dailyWaterIntake',
      render: (value) => value ? `${value} ml` : 'Chưa đặt',
      width: 100,
    },
    {
      title: 'Cập nhật lần cuối',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
      width: 130,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setEditingNutrition(record);
                setNutritionModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setEditingNutrition(record);
                setNutritionModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa hồ sơ dinh dưỡng"
            description="Bạn có chắc chắn muốn xóa hồ sơ này?"
            onConfirm={() => handleDeleteNutrition(record.nutritionId)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const exerciseColumns: ColumnsType<ExerciseProfile> = [
    {
      title: 'ID',
      dataIndex: 'exerciseId',
      key: 'exerciseId',
      width: 80,
    },
    {
      title: 'Người cao tuổi',
      dataIndex: 'elder',
      key: 'elderName',
      render: (elder) => elder?.fullName || 'N/A',
      width: 150,
    },
    {
      title: 'Loại vận động',
      dataIndex: 'exerciseType',
      key: 'exerciseType',
      render: (text) => text || 'Chưa đặt',
      width: 150,
    },
    {
      title: 'Tần suất',
      dataIndex: 'frequency',
      key: 'frequency',
      render: (text) => text || 'Chưa đặt',
      width: 120,
    },
    {
      title: 'Thời gian',
      dataIndex: 'duration',
      key: 'duration',
      render: (text) => text || 'Chưa đặt',
      width: 120,
    },
    {
      title: 'Cường độ',
      dataIndex: 'intensity',
      key: 'intensity',
      render: (text) => {
        const color = text === 'Cao' ? 'red' : text === 'Trung bình' ? 'orange' : 'green';
        return text ? <Tag color={color}>{text}</Tag> : <Tag>Chưa đặt</Tag>;
      },
      width: 120,
    },
    {
      title: 'Mục tiêu/tuần',
      dataIndex: 'weeklyGoalMinutes',
      key: 'weeklyGoalMinutes',
      render: (value) => value ? `${value} phút` : 'Chưa đặt',
      width: 120,
    },
    {
      title: 'Hạn chế vật lý',
      dataIndex: 'physicalLimitations',
      key: 'physicalLimitations',
      render: (text) => (
        <Tooltip title={text}>
          <span>{text ? (text.length > 30 ? text.substring(0, 30) + '...' : text) : 'Không có'}</span>
        </Tooltip>
      ),
      width: 200,
    },
    {
      title: 'Cập nhật lần cuối',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
      width: 130,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setEditingExercise(record);
                setExerciseModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setEditingExercise(record);
                setExerciseModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa hồ sơ vận động"
            description="Bạn có chắc chắn muốn xóa hồ sơ này?"
            onConfirm={() => handleDeleteExercise(record.exerciseId)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="nutrition-exercise-profile">
      {/* Statistics Cards */}
      {statistics && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng hồ sơ dinh dưỡng"
                value={statistics.totalNutritionProfiles}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng hồ sơ vận động"
                value={statistics.totalExerciseProfiles}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Hồ sơ đầy đủ"
                value={statistics.profilesWithBoth}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Cập nhật gần đây"
                value={statistics.recentUpdates}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card title="Quản lý Hồ sơ Dinh dưỡng & Vận động">
        {/* Toolbar */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Space>
                <Search
                  placeholder="Tìm kiếm theo tên, món ăn, bài tập..."
                  allowClear
                  style={{ width: 300 }}
                  onSearch={setSearchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Select
                  placeholder="Chọn người cao tuổi"
                  allowClear
                  style={{ width: 200 }}
                  value={filterElderId}
                  onChange={setFilterElderId}
                  showSearch
                  optionFilterProp="children"
                >
                  {/* Note: Elder options should be loaded from elders API */}
                  <Option value="">Tất cả</Option>
                </Select>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    loadData();
                    loadStatistics();
                  }}
                >
                  Làm mới
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            <Space>
              {activeTab === 'nutrition' && (
                <>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingNutrition(null);
                      setNutritionModalVisible(true);
                    }}
                  >
                    Thêm hồ sơ dinh dưỡng
                  </Button>
                  <Upload
                    accept=".xlsx,.xls"
                    showUploadList={false}
                    beforeUpload={handleImportNutrition}
                  >
                    <Button icon={<UploadOutlined />}>Import</Button>
                  </Upload>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleExportNutrition}
                  >
                    Export
                  </Button>
                </>
              )}
              {activeTab === 'exercise' && (
                <>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingExercise(null);
                      setExerciseModalVisible(true);
                    }}
                  >
                    Thêm hồ sơ vận động
                  </Button>
                  <Upload
                    accept=".xlsx,.xls"
                    showUploadList={false}
                    beforeUpload={handleImportExercise}
                  >
                    <Button icon={<UploadOutlined />}>Import</Button>
                  </Upload>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleExportExercise}
                  >
                    Export
                  </Button>
                </>
              )}
            </Space>
          }
        >
          <TabPane tab="Hồ sơ Dinh dưỡng" key="nutrition">
            <Table
              columns={nutritionColumns}
              dataSource={filteredNutritionProfiles}
              rowKey="nutritionId"
              loading={loading}
              scroll={{ x: 1500 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} hồ sơ`,
              }}
            />
          </TabPane>

          <TabPane tab="Hồ sơ Vận động" key="exercise">
            <Table
              columns={exerciseColumns}
              dataSource={filteredExerciseProfiles}
              rowKey="exerciseId"
              loading={loading}
              scroll={{ x: 1500 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} hồ sơ`,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Modals */}
      <NutritionProfileModal
        visible={nutritionModalVisible}
        onCancel={() => {
          setNutritionModalVisible(false);
          setEditingNutrition(null);
        }}
        onSuccess={() => {
          setNutritionModalVisible(false);
          setEditingNutrition(null);
          loadData();
          loadStatistics();
        }}
        editingProfile={editingNutrition}
        defaultElderId={filterElderId}
      />

      <ExerciseProfileModal
        visible={exerciseModalVisible}
        onCancel={() => {
          setExerciseModalVisible(false);
          setEditingExercise(null);
        }}
        onSuccess={() => {
          setExerciseModalVisible(false);
          setEditingExercise(null);
          loadData();
          loadStatistics();
        }}
        editingProfile={editingExercise}
        defaultElderId={filterElderId}
      />
    </div>
  );
};

export default NutritionExerciseProfile;
