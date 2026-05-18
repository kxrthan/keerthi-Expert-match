// Mock Implementation of sessionApi.js for sandbox mode
const SESSIONS_KEY = 'expertmatch_mock_sessions';
const MESSAGES_KEY = 'expertmatch_mock_messages';

const initialSessions = [
  {
    id: 501,
    doubtId: 102,
    doubt: {
      id: 102,
      title: "Quantum Entanglement State Calculation",
      description: "Need help solving a specific Bell state density matrix calculation. I have the basic tensor equations but the final trace calculation seems incorrect.",
      category: "Physics",
      budget: 80
    },
    studentId: 1001,
    expertId: 1774032316,
    expert: {
      id: 1774032316,
      fullName: "Dr. Elena Rodriguez",
      profileImageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80"
    },
    status: "active", // can be "requested", "active", "completed"
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const initialMessages = {
  501: [
    {
      id: 801,
      sessionId: 501,
      senderId: 1001,
      messageText: "Hello Dr. Rodriguez! Thanks for accepting my request.",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 802,
      sessionId: 501,
      senderId: 1774032316,
      messageText: "Hello! I looked at your Bell state calculations. The trace error is in the second step where you didn't normalize the coefficients.",
      createdAt: new Date(Date.now() - 3400000).toISOString()
    }
  ]
};

function getSessions() {
  const saved = localStorage.getItem(SESSIONS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (_) {}
  }
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(initialSessions));
  return initialSessions;
}

function getMessages() {
  const saved = localStorage.getItem(MESSAGES_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (_) {}
  }
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(initialMessages));
  return initialMessages;
}

export async function fetchSessions() {
  return getSessions();
}

export async function createSession(data) {
  const sessions = getSessions();
  const newSession = {
    id: Date.now(),
    doubtId: data.doubtId || Date.now() + 10,
    doubt: {
      id: data.doubtId || Date.now() + 10,
      title: data.doubtTitle || "Understanding Advanced Algorithms",
      description: "Session regarding algorithmic complexity.",
      category: "Computer Science",
      budget: 45
    },
    studentId: 1001,
    expertId: Number(data.expertId || 1774032316),
    expert: {
      id: Number(data.expertId || 1774032316),
      fullName: data.expertName || "Dr. Elena Rodriguez",
      profileImageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80"
    },
    status: "active",
    createdAt: new Date().toISOString()
  };
  sessions.unshift(newSession);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  return newSession;
}

export async function fetchSessionMessages(sessionId) {
  const messages = getMessages();
  return messages[sessionId] || [];
}

export async function sendSessionMessage(sessionId, data) {
  const messages = getMessages();
  if (!messages[sessionId]) {
    messages[sessionId] = [];
  }

  const userJson = localStorage.getItem('expertmatch_current_user');
  const currentUser = userJson ? JSON.parse(userJson) : { id: 1001, role: 'student' };

  const newMsg = {
    id: Date.now(),
    sessionId: Number(sessionId),
    senderId: currentUser.id,
    messageText: data.messageText,
    createdAt: new Date().toISOString()
  };

  messages[sessionId].push(newMsg);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

  // If student sent the message, trigger an AI automated response from the expert!
  if (currentUser.role === 'student') {
    setTimeout(() => {
      const liveMessages = getMessages();
      if (!liveMessages[sessionId]) liveMessages[sessionId] = [];

      const expertResponses = [
        "Let me analyze that part of your code. Usually, this happens due to state synchronization issues.",
        "That's a very interesting approach! Here is a tip: make sure to inspect the rendering path.",
        "Absolutely! We can resolve this using clean architecture principles.",
        "Could you provide a small code snippet or sample input so I can debug it on my end?",
        "I've updated the calculations. The output should now balance correctly. Let me know if you want to walk through it step-by-step!"
      ];
      const randomReply = expertResponses[Math.floor(Math.random() * expertResponses.length)];

      const aiMsg = {
        id: Date.now() + 1,
        sessionId: Number(sessionId),
        senderId: 1774032316,
        messageText: randomReply,
        createdAt: new Date().toISOString()
      };

      liveMessages[sessionId].push(aiMsg);
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(liveMessages));

      // Push custom event so the UI refreshes
      const event = new CustomEvent('mock_message_received', { detail: { sessionId } });
      window.dispatchEvent(event);
    }, 1500);
  }

  return newMsg;
}

export async function updateSessionStatus(sessionId, status) {
  const sessions = getSessions();
  const session = sessions.find(s => s.id === Number(sessionId));
  if (session) {
    session.status = status;
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }
  return session;
}

export async function respondToSessionRequest(sessionId, decision) {
  const status = decision === 'accept' ? 'active' : 'declined';
  return updateSessionStatus(sessionId, status);
}

export async function fetchUnreadCounts() {
  return {};
}

export async function markSessionRead(sessionId) {
  return { success: true };
}

export async function fetchSessionRating(sessionId) {
  return { rating: 5, feedback: "Excellent advice and very clear explanation." };
}

export async function fetchSessionBilling(sessionId) {
  return {
    id: Date.now(),
    sessionId: Number(sessionId),
    amount: 15.00,
    durationMinutes: 6,
    status: "paid",
    createdAt: new Date().toISOString()
  };
}

export async function submitSessionRating(sessionId, data) {
  return { success: true };
}

export async function checkAndActivateSession(sessionId) {
  return updateSessionStatus(sessionId, 'active');
}
