import { Subject, MaterialCategory } from './types';

export const UNITS_STANDARD = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
export const UNITS_WITH_ALL = [...UNITS_STANDARD, "All Units"];

// Default export for generic use, though we override in components now
export const SUBJECTS_AND_UNITS: Record<Subject, string[]> = {
  [Subject.CHEMISTRY]: UNITS_STANDARD,
  [Subject.BIOLOGY]: UNITS_STANDARD,
  [Subject.PHYSICS]: UNITS_STANDARD,
  [Subject.CALCULUS]: UNITS_STANDARD
};

export const MATERIAL_OPTIONS: { value: MaterialCategory; label: string }[] = [
  { value: 'MOCK_EXAM', label: 'Mock Exam' },
  { value: 'ASSIGNMENT', label: 'Assignment / Homework' },
  { value: 'PRACTICE', label: 'Practice Problems' },
  { value: 'ALL', label: 'All (Comprehensive Package)' },
];

export const BUILDER_EMAIL = "aneeshejji@gmail.com";
export const BUILDER_PASSWORD = "AneesDayaf@2009";