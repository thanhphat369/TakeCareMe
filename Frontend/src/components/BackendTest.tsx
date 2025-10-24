import React, { useState } from 'react';
import { Card, Button, Space, message, Spin, Table, Tag } from 'antd';
import { ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { fetchEldersController } from '../controllers/medicationController';
import { getUsers } from '../api/users';
import { fetchPrescriptions } from '../controllers/prescriptionController';

interface TestResult {
  endpoint: string;
  status: 'success' | 'error' | 'loading';
  message: string;
  data?: any;
}

const BackendTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const testEndpoints = async () => {
    setLoading(true);
    setResults([]);

    const tests = [
      {
        name: 'Elders API',
        test: async () => {
          const data = await fetchEldersController();
          return { count: data.length, sample: data[0] };
        }
      },
      {
        name: 'Users API',
        test: async () => {
          const data = await getUsers();
          return { count: data.length, sample: data[0] };
        }
      },
      {
        name: 'Prescriptions API',
        test: async () => {
          const data = await fetchPrescriptions();
          return { count: data.length, sample: data[0] };
        }
      }
    ];

    const testResults: TestResult[] = [];

    for (const test of tests) {
      try {
        testResults.push({
          endpoint: test.name,
          status: 'loading',
          message: 'Đang kiểm tra...'
        });
        setResults([...testResults]);

        const result = await test.test();
        testResults[testResults.length - 1] = {
          endpoint: test.name,
          status: 'success',
          message: `✅ Thành công! Tìm thấy ${result.count} bản ghi`,
          data: result
        };
      } catch (error: any) {
        testResults[testResults.length - 1] = {
          endpoint: test.name,
          status: 'error',
          message: `❌ Lỗi: ${error.message}`
        };
      }
      setResults([...testResults]);
    }

    setLoading(false);
    message.success('Hoàn thành kiểm tra kết nối backend!');
  };

  const columns = [
    {
      title: 'Endpoint',
      dataIndex: 'endpoint',
      key: 'endpoint',
      width: 150,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_: any, record: TestResult) => {
        if (record.status === 'loading') {
          return <Spin size="small" />;
        }
        return record.status === 'success' ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>Thành công</Tag>
        ) : (
          <Tag color="red" icon={<CloseCircleOutlined />}>Lỗi</Tag>
        );
      },
    },
    {
      title: 'Thông báo',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
  ];

  return (
    <div className="p-6">
      <Card
        title="🧪 Kiểm tra kết nối Backend"
        extra={
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={testEndpoints}
            loading={loading}
          >
            Chạy test
          </Button>
        }
      >
        <div className="mb-4">
          <p className="text-gray-600">
            Component này giúp kiểm tra kết nối với backend và xem dữ liệu thật.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Đảm bảo backend đang chạy trên port 3000 và bạn đã đăng nhập.
          </p>
        </div>

        {results.length > 0 && (
          <Table
            columns={columns}
            dataSource={results}
            rowKey="endpoint"
            pagination={false}
            size="small"
          />
        )}

        {results.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            Nhấn "Chạy test" để kiểm tra kết nối backend
          </div>
        )}
      </Card>
    </div>
  );
};

export default BackendTest;

