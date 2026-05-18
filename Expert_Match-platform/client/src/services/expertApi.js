// Mock Implementation of expertApi.js for sandbox mode
const EXPERTS_KEY = 'expertmatch_mock_experts';
const BOOKMARKS_KEY = 'expertmatch_mock_bookmarks';

const initialExperts = [
  {
    id: 1,
    slug: 'elena-rodriguez',
    fullName: 'Dr. Elena Rodriguez',
    title: 'Senior Research Scientist & Educator',
    headline: 'Bridging theoretical physics and practical engineering.',
    category: 'Physics',
    experienceYears: 12,
    rating: 4.8,
    reviewCount: 124,
    consultations: 350,
    successRate: 98,
    avgResponseMinutes: 5,
    solvedDoubts: 240,
    pricePerMinute: 2.5,
    availabilityStatus: 'available',
    isOnline: true,
    profileImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    about: 'With over 12 years of experience in academia and industry, I specialize in helping students and professionals convert complex concepts into practical solutions.',
    education: 'PhD in Theoretical Physics, MIT',
    languages: ['English', 'Spanish', 'German'],
    specialties: ['Quantum Mechanics', 'Mathematics', 'Physics'],
    perks: ['Verified Expert Identity', 'Encrypted Video & Chat', 'Downloadable Session Notes']
  },
  {
    id: 2,
    slug: 'marcus-chen',
    fullName: 'Marcus Chen',
    title: 'Full Stack Tech Lead',
    headline: 'Building scalable web architectures and leading engineering teams.',
    category: 'Computer Science',
    experienceYears: 8,
    rating: 4.9,
    reviewCount: 85,
    consultations: 180,
    successRate: 99,
    avgResponseMinutes: 2,
    solvedDoubts: 120,
    pricePerMinute: 3.0,
    availabilityStatus: 'available',
    isOnline: true,
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    about: 'Tech Lead specializing in React, Node.js, and Kubernetes. Passionate about mentoring developers and designing robust cloud systems.',
    education: 'BS in Computer Science, Stanford University',
    languages: ['English', 'Mandarin'],
    specialties: ['React', 'Node.js', 'System Design', 'Kubernetes'],
    perks: ['Verified Expert Identity', 'Live Code Sharing', 'Architectural Audits']
  },
  {
    id: 3,
    slug: 'sarah-jenkins',
    fullName: 'Sarah Jenkins',
    title: 'UI/UX Design Director',
    headline: 'Designing intuitive digital experiences for millions of users.',
    category: 'Design',
    experienceYears: 10,
    rating: 4.7,
    reviewCount: 62,
    consultations: 110,
    successRate: 97,
    avgResponseMinutes: 8,
    solvedDoubts: 80,
    pricePerMinute: 2.8,
    availabilityStatus: 'busy',
    isOnline: false,
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    about: 'Award-winning designer with a passion for human-centered design. I help product teams and founders polish their design systems and user flows.',
    education: 'BFA in Communication Design, Carnegie Mellon',
    languages: ['English', 'French'],
    specialties: ['Design Systems', 'Figma', 'User Research', 'Prototyping'],
    perks: ['Verified Expert Identity', 'Interactive Figma Reviews', 'Portfolio Critiques']
  }
];

function getExperts() {
  const saved = localStorage.getItem(EXPERTS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (_) {}
  }
  localStorage.setItem(EXPERTS_KEY, JSON.stringify(initialExperts));
  return initialExperts;
}

function getBookmarks() {
  const saved = localStorage.getItem(BOOKMARKS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (_) {}
  }
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([]));
  return [];
}

export async function fetchExpertProfile(identifier) {
  const list = getExperts();
  const found = list.find(e => String(e.slug) === String(identifier) || String(e.id) === String(identifier));
  return found || list[0];
}

export async function fetchExpertList() {
  return getExperts();
}

export async function createExpertProfile(data) {
  const list = getExperts();
  const newExpert = {
    ...initialExperts[0],
    id: Date.now(),
    fullName: data.fullName || "Dr. Alex Rivera",
    title: data.title || "Subject Matter Expert",
    category: data.category || "General Science",
    about: data.about || "Experienced educator.",
    pricePerMinute: Number(data.pricePerMinute || 2.0)
  };
  list.unshift(newExpert);
  localStorage.setItem(EXPERTS_KEY, JSON.stringify(list));
  return newExpert;
}

export async function fetchMyExpertProfile() {
  const list = getExperts();
  return list[0]; // Elena Rodriguez acts as our active expert profile
}

export async function updateMyExpertAvailability(availabilityStatus) {
  const profile = await fetchMyExpertProfile();
  profile.availabilityStatus = availabilityStatus;
  return profile;
}

export async function uploadMyExpertAvatar(file) {
  const profile = await fetchMyExpertProfile();
  return profile;
}

export async function searchExperts(filters = {}) {
  let list = getExperts();
  if (filters.category && filters.category !== 'All') {
    list = list.filter(e => e.category === filters.category);
  }
  if (filters.availability && filters.availability !== 'all') {
    list = list.filter(e => e.availabilityStatus === filters.availability);
  }
  return list;
}

export async function toggleExpertBookmark(expertId) {
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(Number(expertId));
  if (idx !== -1) {
    bookmarks.splice(idx, 1);
  } else {
    bookmarks.push(Number(expertId));
  }
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  return { success: true };
}

export async function fetchUserBookmarks() {
  const bookmarks = getBookmarks();
  const list = getExperts();
  return list.filter(e => bookmarks.includes(e.id));
}
