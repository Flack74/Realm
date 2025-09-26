import axios from 'axios';

const API_BASE_URL = '/api/v1';

// Auth API instance
const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Realm API instance
const realmAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Remove CSRF for realm API as well

// Add auth token to realm API requests
realmAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Service
export const authService = {
  login: async (email: string, password: string) => {
    const response = await authAPI.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (data: { username: string; email: string; password: string }) => {
    const response = await authAPI.post('/auth/register', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await realmAPI.get('/protected/profile');
    return response.data;
  },

  logout: async () => {
    const token = localStorage.getItem('token');
    await authAPI.post('/auth/logout', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

// Realm Service
export const realmService = {
  createRealm: async (name: string, description?: string) => {
    const response = await realmAPI.post('/protected/realms', { name, description });
    return response.data;
  },

  getUserRealms: async () => {
    const response = await realmAPI.get('/protected/realms');
    return response.data;
  },

  getRealm: async (id: string) => {
    const response = await realmAPI.get(`/protected/realms/${id}`);
    return response.data;
  },

  joinRealm: async (inviteCode: string) => {
    const response = await realmAPI.post(`/protected/realms/${inviteCode}/join`);
    return response.data;
  },

  leaveRealm: async (id: string) => {
    const response = await realmAPI.delete(`/protected/realms/${id}/leave`);
    return response.data;
  },

  generateInvite: async (id: string) => {
    const response = await realmAPI.post(`/realms/${id}/invite`);
    return response.data;
  },

  getMembers: async (id: string) => {
    const response = await realmAPI.get(`/realms/${id}/members`);
    return response.data;
  }
};

// Channel Service
export const channelService = {
  createChannel: async (realmId: string, name: string, type: 'text' | 'voice' = 'text', topic?: string) => {
    const response = await realmAPI.post(`/protected/realms/${realmId}/channels`, { name, type, topic });
    return response.data;
  },

  getRealmChannels: async (realmId: string) => {
    const response = await realmAPI.get(`/protected/realms/${realmId}/channels`);
    return response.data;
  },

  updateChannel: async (channelId: string, name?: string, topic?: string) => {
    const response = await realmAPI.put(`/protected/channels/${channelId}`, { name, topic });
    return response.data;
  },

  deleteChannel: async (channelId: string) => {
    const response = await realmAPI.delete(`/protected/channels/${channelId}`);
    return response.data;
  }
};

// Message Service
export const messageService = {
  sendMessage: async (channelId: string, content: string, type = 'text') => {
    const response = await realmAPI.post(`/channels/${channelId}/messages`, { content, type });
    return response.data;
  },

  getMessages: async (channelId: string, limit = 50, offset = 0) => {
    const response = await realmAPI.get(`/channels/${channelId}/messages?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  editMessage: async (messageId: string, content: string) => {
    const response = await realmAPI.put(`/messages/${messageId}`, { content });
    return response.data;
  },

  deleteMessage: async (messageId: string) => {
    const response = await realmAPI.delete(`/messages/${messageId}`);
    return response.data;
  },

  addReaction: async (messageId: string, emoji: string) => {
    const response = await realmAPI.post(`/messages/${messageId}/reactions`, { emoji });
    return response.data;
  },

  sendDirectMessage: async (userId: string, content: string) => {
    const response = await realmAPI.post(`/users/${userId}/messages`, { content });
    return response.data;
  },

  getDirectMessages: async (userId: string, limit = 50, offset = 0) => {
    const response = await realmAPI.get(`/users/${userId}/messages?limit=${limit}&offset=${offset}`);
    return response.data;
  }
};