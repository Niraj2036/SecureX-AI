import { ChevronDown, ChevronUp, Search, User, Users, Eye } from 'lucide-react';
export interface Employee {
  id: string;
  avatar: string | null;
  tenantId: string;
  name: string;
  email: string;
  phoneCode: string;
  mobile: string;
  teamId: string | null;
  managerId: string | null;
  joiningDate: string | null;
  designation: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  data: Record<string, any>;
  role: string;
  jobTitle?: string;
  manager?: {
    id: string;
    name: string;
  };
  company?: string;
  department: {
    id: string;
    name: string;
  };
  team: {
    id: string;
    name: string;
    parentId: string;
    avatar: string;
  };
  okrVisibility: ObjectiveVisibility;
  checkInVisibility: ObjectiveVisibility;
  oneOnOneVisibility: ObjectiveVisibility;
  performanceVisibility: ObjectiveVisibility;
}

export type ObjectiveVisibility = "all" | "team" | "self";
export interface VisibilityOption {
  value: ObjectiveVisibility;
  label: string;
  description: string;
  icon: React.ReactNode;
}

