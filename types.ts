export enum UserRole {
  STUDENT = 'STUDENT',
  BUILDER = 'BUILDER' // The admin
}

export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
}

export enum Subject {
  CHEMISTRY = 'Chemistry',
  BIOLOGY = 'Biology',
  PHYSICS = 'Physics',
  CALCULUS = 'Calculus'
}

export type RequestType = 'STUDY_GUIDE' | 'ANSWER_KEY';

export type MaterialCategory = 'MOCK_EXAM' | 'ASSIGNMENT' | 'PRACTICE' | 'ALL';

export interface RequestItem {
  id: string;
  userId: string;
  userName: string; // Denormalized for display
  userPhone: string; // Denormalized for "WhatsApp" sending
  subject: Subject;
  unit: string;
  type: RequestType;
  materialCategory?: MaterialCategory; // Only for STUDY_GUIDE
  attachedFileName?: string;
  description?: string; // User provided description/details
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
  content?: string; // The generated file content (markdown)
  createdAt: number;
}