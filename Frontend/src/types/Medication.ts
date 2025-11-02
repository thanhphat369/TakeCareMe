export interface Medication {
  medicationId: number;
  elderId: number;
  name: string;
  dose?: string;
  frequency?: string;
  time?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  diagnosis: string;
  prescribedBy?: number;
  elder?: {
    elderId: number;
    fullName: string;
  };
  prescriber?: {
    userId: number;
    fullName: string;
  };
}

export interface Elder {
  elderId: number;
  fullName: string;
  age?: number;
  gender?: string;
  phone?: string;
}

export interface Doctor {
  userId: number;
  fullName: string;
  role: string;
}
export interface PrescriptionSummary {
  elderId: number;
  elderName: string;
  diagnosis?: string;
  prescribedBy?: string;
  medications: Medication[];
  startDate?: string;
  endDate?: string;
}

interface ElderlyDetailModalProps {
  visible: boolean;
  elderly: any | null; // hoặc kiểu Elder
  onClose: () => void;
}