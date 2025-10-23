import dayjs, { Dayjs } from 'dayjs';

/**
 * 🔹 Kiểu dữ liệu Medication — tương ứng với entity Medications (backend)
 */
export interface Medication {
  /** ID thuốc (PK) */
  medicationId: number;

  /** ID người cao tuổi (FK -> Elders) */
  elderId: number;

  /** Thông tin người cao tuổi (nếu có join từ backend) */
  elder?: {
    elderId: number;
    fullName: string;
    age?: number;
    gender?: string;
    phone?: string;
  };

  /** Tên thuốc */
  name: string;

  /** Liều lượng (vd: 500mg, 2 viên, ...) */
  dose?: string;

  /** Tần suất (vd: 2 lần/ngày) */
  frequency?: string;

  /** Ngày bắt đầu uống */
  startDate?: string | Date | Dayjs | null;

  /** Ngày kết thúc (nếu có) */
  endDate?: string | Date | Dayjs | null;

  /** Ghi chú */
  notes?: string;

  /** ID người kê đơn (nếu có) */
  prescribedBy?: number | null;

  /** Thông tin người kê đơn (join User) */
  prescriber?: {
    userId: number;
    fullName: string;
  };

  /** Giờ uống thuốc (vd: '08:00 - 20:00') */
  time?: string | null;
}
