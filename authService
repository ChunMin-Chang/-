
import { User } from './types';

const USER_STORAGE_KEY = 'ccu_user_session';
const USERS_DB_KEY = 'ccu_users_db'; // 模擬後端資料庫

// 模擬延遲
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 初始化假資料 (為了讓 Demo 看起來豐富)
const initMockUsers = () => {
  const existingDb = localStorage.getItem(USERS_DB_KEY);
  if (!existingDb) {
    const mockUsers: User[] = [
      {
        id: 'mock1',
        name: '王小明',
        email: 'wang@ccu.edu.tw',
        department: '資工三',
        skills: ['Python', 'Django', 'React'],
        bio: '熱愛寫程式，曾經參加過兩次黑客松，擅長後端開發。',
        portfolioUrl: 'https://github.com/wang-example'
      },
      {
        id: 'mock2',
        name: '陳大文',
        email: 'chen@ccu.edu.tw',
        department: '企管四',
        skills: ['商業模式', '簡報設計', '專案管理'],
        bio: '擅長挖掘痛點與商業分析，正在尋找技術夥伴一起實踐創業點子。',
        portfolioUrl: 'https://www.linkedin.com/in/chen-example'
      }
    ];
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(mockUsers));
  }
};

// 執行初始化
initMockUsers();

// 獲取當前登入使用者
export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

// 根據 ID 獲取使用者公開資訊
export const getUserById = (id: string): User | undefined => {
  const usersDb = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
  return usersDb.find((u: User) => u.id === id);
};

// 登入
export const login = async (email: string): Promise<User> => {
  await delay(500);
  const usersDb = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
  const user = usersDb.find((u: User) => u.email === email);
  
  if (!user) {
    throw new Error('用戶不存在，請先註冊');
  }
  
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  return user;
};

// 註冊
export const register = async (name: string, email: string, department: string): Promise<User> => {
  await delay(500);
  const usersDb = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
  
  if (usersDb.find((u: User) => u.email === email)) {
    throw new Error('此 Email 已被註冊');
  }

  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    email,
    department,
    skills: [],
    bio: '這位同學很懶，還沒寫自我介紹...',
    portfolioUrl: ''
  };

  usersDb.push(newUser);
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
  
  return newUser;
};

// 更新個人資料
export const updateUserProfile = async (updatedUser: User): Promise<User> => {
  await delay(300);
  const usersDb = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
  const index = usersDb.findIndex((u: User) => u.id === updatedUser.id);
  
  if (index !== -1) {
    usersDb[index] = updatedUser;
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser)); // 更新 Session
    return updatedUser;
  }
  throw new Error('更新失敗');
};

// 登出
export const logout = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
};
