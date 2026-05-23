export const STAFF_NAME_OPTIONS = ["강이삭", "홍성원", "이중호", "장중원"];
export const CONTACT_METHODS = ["카톡", "텔레그램", "전화", "지식인", "제휴", "그 외"];
export const LEAD_STATUSES = ["NEW", "IN_PROGRESS", "CONTRACTED", "CLOSED"] as const;
export const LEAD_STATUS_LABEL: Record<string, string> = {
  NEW: "신규",
  IN_PROGRESS: "상담중",
  CONTRACTED: "계약완료",
  CLOSED: "종결"
};
export const CONTRACT_STATUS_OPTIONS = ["미계약", "제안중", "계약완료", "보류"];
export const HOSPITAL_TYPES = ["정형외과", "한의원", "재활의학과", "신경외과", "통증의학과", "기타"];
export const PARTNERSHIP_STATUS_OPTIONS = ["미접촉", "연락완료", "미팅예정", "제휴논의중", "제휴완료", "보류"];
export const BOARD_CATEGORIES = ["공지사항", "상담 스크립트", "보험사 대응", "제휴업체 자료", "병원 영업 자료", "업무 매뉴얼", "기타"];
export const ALLOWED_FILE_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg", "webp", "hwp", "hwpx"];
export const MAX_FILE_SIZE = 20 * 1024 * 1024;
