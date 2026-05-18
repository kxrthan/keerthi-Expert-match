// Mock Implementation of doubtApi.js for sandbox mode
const DOUBTS_KEY = 'expertmatch_mock_doubts';

const initialDoubts = [
  {
    id: 101,
    title: "Understanding React 19 Compiler",
    description: "I am trying to understand how the new React Compiler handles useMemo and useCallback optimization automatically under the hood, and if there are any edge cases where it fails.",
    category: "Computer Science",
    tags: "React, Frontend, JavaScript",
    budget: 50,
    status: "open",
    studentId: 1001,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 102,
    title: "Quantum Entanglement State Calculation",
    description: "Need help solving a specific Bell state density matrix calculation. I have the basic tensor equations but the final trace calculation seems incorrect.",
    category: "Physics",
    tags: "Quantum, Physics, Math",
    budget: 80,
    status: "assigned",
    studentId: 1001,
    assignedExpertId: 1,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
  }
];

function getDoubts() {
  const saved = localStorage.getItem(DOUBTS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (_) {}
  }
  localStorage.setItem(DOUBTS_KEY, JSON.stringify(initialDoubts));
  return initialDoubts;
}

export async function fetchDoubts() {
  return getDoubts();
}

export async function createDoubt(data) {
  const list = getDoubts();
  const newDoubt = {
    id: Date.now(),
    title: data.title || "Untitled Doubt",
    description: data.description || "No description provided.",
    category: data.category || "General",
    tags: data.tags || "",
    budget: Number(data.budget || 20),
    status: "open",
    studentId: 1001,
    createdAt: new Date().toISOString()
  };
  list.unshift(newDoubt);
  localStorage.setItem(DOUBTS_KEY, JSON.stringify(list));
  return newDoubt;
}

export async function updateDoubt(doubtId, data) {
  const list = getDoubts();
  const doubt = list.find(d => d.id === Number(doubtId));
  if (doubt) {
    Object.assign(doubt, data);
    localStorage.setItem(DOUBTS_KEY, JSON.stringify(list));
  }
  return doubt;
}

export async function fetchDoubtMatches(doubtId) {
  // Return the mock list of experts as matching options
  const savedExperts = localStorage.getItem('expertmatch_mock_experts');
  return savedExperts ? JSON.parse(savedExperts) : [];
}

export async function assignExpertToDoubt(doubtId, expertId) {
  const list = getDoubts();
  const doubt = list.find(d => d.id === Number(doubtId));
  if (doubt) {
    doubt.status = "assigned";
    doubt.assignedExpertId = Number(expertId);
    localStorage.setItem(DOUBTS_KEY, JSON.stringify(list));
  }
  return doubt;
}
