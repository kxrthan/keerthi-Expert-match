// Mock Implementation of authApi.js for sandbox mode
const TOKEN_KEY = 'expertmatch_token';
const USER_KEY = 'expertmatch_current_user';

const defaultStudent = {
  id: 1001,
  fullName: "Jane Doe (Student)",
  email: "student@expertmatch.com",
  role: "student",
  profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256"
};

const defaultExpert = {
  id: 1774032316,
  fullName: "Dr. Elena Rodriguez",
  email: "elena.rodriguez@expertmatch.com",
  role: "expert",
  profileImageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
  title: "Senior Research Scientist & Educator",
  headline: "Bridging theoretical physics and practical engineering.",
  category: "Physics",
  experienceYears: 12,
  rating: 4.8,
  reviewCount: 124,
  consultations: 350,
  successRate: 98,
  avgResponseMinutes: 5,
  solvedDoubts: 240,
  pricePerMinute: 2.5,
  about: "With over 12 years of experience in academia and industry, I specialize in helping students and professionals convert complex concepts into practical solutions.",
  education: "PhD in Theoretical Physics, MIT",
  languages: ["English", "Spanish"],
  specialties: ["Quantum Mechanics", "Physics", "Mathematics"]
};

function getSavedUser() {
  const saved = localStorage.getItem(USER_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (_) { }
  }
  localStorage.setItem(USER_KEY, JSON.stringify(defaultStudent));
  localStorage.setItem(TOKEN_KEY, 'mock_token');
  return defaultStudent;
}

export async function registerUser(payload) {
  const newUser = {
    id: Date.now(),
    fullName: payload.fullName || "New User",
    email: payload.email || "user@expertmatch.com",
    role: payload.role || "student",
    profileImageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256"
  };
  localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  localStorage.setItem(TOKEN_KEY, 'mock_token');
  return { user: newUser, token: 'mock_token' };
}

export async function loginUser(payload) {
  // Support logging in with ANY credentials instantly!
  const isExpert = String(payload.email || '').includes('expert');
  const user = isExpert ? defaultExpert : {
    ...defaultStudent,
    email: payload.email || defaultStudent.email
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, 'mock_token');
  return { user, token: 'mock_token' };
}

export async function fetchCurrentUser() {
  return getSavedUser();
}

export async function loginWithGoogle(payload) {
  const user = payload.role === 'expert' ? defaultExpert : defaultStudent;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, 'mock_token');
  return { user, token: 'mock_token' };
}

export async function uploadMyAvatar(file) {
  const user = getSavedUser();
  user.profileImageUrl = "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=256";
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function completeOnboarding() {
  const user = getSavedUser();
  return user;
}

export default {
  registerUser,
  loginUser,
  fetchCurrentUser,
  loginWithGoogle,
  uploadMyAvatar,
  completeOnboarding
};
