// Mock Implementation of chatSocket.js for sandbox mode
import { sendSessionMessage, fetchSessionMessages } from './sessionApi.js';

class MockSocket {
  constructor() {
    this.listeners = {};
    
    // Listen for custom events to propagate new mock responses
    if (typeof window !== 'undefined') {
      window.addEventListener('mock_message_received', (e) => {
        const sessionId = Number(e.detail.sessionId);
        fetchSessionMessages(sessionId).then(msgs => {
          const latest = msgs[msgs.length - 1];
          if (latest) {
            this.trigger('new_message', {
              id: latest.id,
              sessionId: latest.sessionId,
              senderId: latest.senderId,
              senderRole: latest.senderId === 1774032316 ? 'expert' : 'student',
              senderName: latest.senderId === 1774032316 ? 'Dr. Elena Rodriguez' : 'Jane Doe (Student)',
              messageText: latest.messageText,
              message: latest.messageText,
              createdAt: latest.createdAt,
              messageStatus: 'seen'
            });
          }
        });
      });
    }
  }

  on(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }

  off(event, cb) {
    if (!this.listeners[event]) return;
    if (cb) {
      this.listeners[event] = this.listeners[event].filter(l => l !== cb);
    } else {
      delete this.listeners[event];
    }
  }

  emit(event, data, callback) {
    if (event === 'send_message') {
      sendSessionMessage(data.sessionId, { messageText: data.message }).then(msg => {
        const socketMsg = {
          id: msg.id,
          sessionId: msg.sessionId,
          senderId: msg.senderId,
          senderRole: data.senderRole,
          senderName: data.senderName,
          messageText: msg.messageText,
          message: msg.messageText,
          createdAt: msg.createdAt,
          messageStatus: 'seen'
        };
        
        // Trigger local message reception instantly
        this.trigger('new_message', socketMsg);
        
        if (callback) {
          callback({ ok: true, data: socketMsg });
        }
      });
    } else {
      if (callback) callback({ ok: true });
    }
  }

  trigger(event, payload) {
    const list = this.listeners[event] || [];
    list.forEach(cb => {
      try {
        cb(payload);
      } catch (err) {}
    });
  }
}

const mockSocketInstance = new MockSocket();

export function getChatSocket() {
  return mockSocketInstance;
}
