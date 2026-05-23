export type Role = "ADMIN" | "STAFF";
export type LeadStatus = "NEW" | "IN_PROGRESS" | "CONTRACTED" | "CLOSED";
export type BoardCategory = "공지사항" | "상담 스크립트" | "보험사 대응" | "제휴업체 자료" | "병원 영업 자료" | "업무 매뉴얼" | "기타";
export type TargetType = "LEAD" | "INSURANCE" | "PARTNER" | "HOSPITAL";

export type Profile = {
  id: string;
  auth_user_id: string | null;
  name: string;
  email: string | null;
  login_id: string | null;
  auth_email: string | null;
  phone: string | null;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  contact_method: string | null;
  insurance_company: string | null;
  status: LeadStatus;
  assigned_to: string | null;
  manager_name: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type LeadNote = {
  id: string;
  lead_id: string;
  author_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type LeadNoteWithAuthor = LeadNote & {
  profiles?: { name: string; email: string | null } | null;
};

export type LeadContract = {
  id: string;
  lead_id: string;
  designated_fee_rate: string | null;
  settlement_amount: number | null;
  fee_amount: number | null;
  memo: string | null;
  primary_manager_id: string | null;
  primary_manager_name: string | null;
  secondary_manager_id: string | null;
  secondary_manager_name: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type InsuranceContact = {
  id: string;
  insurance_company: string;
  manager_name: string | null;
  position: string | null;
  phone: string | null;
  memo: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type PartnerCompany = {
  id: string;
  company_name: string;
  region: string | null;
  phone: string | null;
  contract_status: string | null;
  manager_name: string | null;
  memo: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type Hospital = {
  id: string;
  hospital_name: string;
  region: string | null;
  hospital_type: string | null;
  manager_name: string | null;
  position: string | null;
  phone: string | null;
  partnership_status: string | null;
  internal_manager_name: string | null;
  memo: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type DbFile = {
  id: string;
  target_type: TargetType;
  target_id: string;
  file_name: string;
  file_path: string;
  file_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
  deleted_at: string | null;
  profiles?: { name: string; email: string | null } | null;
};

export type BoardPost = {
  id: string;
  title: string;
  content: string;
  category: BoardCategory;
  author_id: string | null;
  is_notice: boolean;
  pin_order: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  profiles?: { name: string; email: string | null } | null;
};

export type BoardFile = {
  id: string;
  post_id: string;
  file_name: string;
  file_path: string;
  file_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
  deleted_at: string | null;
};
