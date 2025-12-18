
export enum CompetitionCategory {
  TECH = '資訊科技',
  BUSINESS = '商業競賽',
  ART = '藝術設計',
  SOCIAL = '社會實踐',
  SCIENCE = '基礎科學',
  LANGUAGE = '語文文學'
}

export enum CompetitionLocation {
  ONLINE = '線上',
  OFFLINE = '線下',
  HYBRID = '實體/線上混合'
}

// 這是前端 UI 使用的介面 (CamelCase)
export interface Competition {
  id: string;
  name: string;
  organizer: string;
  prize: string;
  category: CompetitionCategory;
  location: CompetitionLocation;
  deadline: string;
  summary: string;
  rules: string;
  registrationMethod: string;
  officialLink: string;
  imageUrl: string;
}

// 這是模擬後端 API 回傳的原始介面 (SnakeCase)
export interface ApiCompetitionData {
  id: string;
  name: string; // 競賽名稱
  organizer: string;
  prize: string; // 獎金
  category: string;
  location: string;
  end_date: string; // 截止日
  summary: string;
  rules: string;
  registration_method: string;
  official_url: string; // 官網連結
  image_url: string;
}

export interface FilterState {
  searchQuery: string;
  category: CompetitionCategory | 'all';
  location: CompetitionLocation | 'all';
  sortBy: 'deadline_asc' | 'deadline_desc' | 'prize_desc' | 'prize_asc';
}

// --- 新增：使用者與媒合相關介面 ---

export interface User {
  id: string;
  name: string;
  email: string;
  department?: string; // 系級
  skills: string[];    // 技能標籤 (e.g., Python, Figma)
  bio?: string;        // 自我介紹
  portfolioUrl?: string; // 作品集連結
}

export interface TeamPost {
  id: string;
  authorId: string;
  authorName: string;
  authorDept?: string;
  competitionName: string; // 想參加的比賽
  roleNeeded: string;      // 需要的角色 (e.g., 前端工程師, 行銷企劃)
  description: string;     // 需求描述
  tags: string[];          // 相關技術標籤
  createdAt: string;
}
