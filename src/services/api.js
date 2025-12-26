import { Platform } from 'react-native';

// Auto-detect API URL based on platform
// Real Android device: Use your computer's local IP address
// iOS simulator: localhost
// Web: localhost
const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Use your computer's local IP address for real Android devices
      // Make sure your device is on the same WiFi network
      return 'http://10.77.141.108:5000';
    } else {
      // iOS simulator or web
      return 'http://localhost:5000';
    }
  }
  // Production URL - update this when deploying
  return 'http://localhost:5000';
};

const BASE_URL = getBaseUrl();

const request = async (path, options = {}) => {
  const url = `${BASE_URL}${path}`;
  console.log(`[API] ${options.method || 'GET'} ${url}`);
  console.log(`[API] Base URL: ${BASE_URL}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    clearTimeout(timeoutId);

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      console.error(`[API] Error ${res.status}:`, data);
      throw new Error(data?.message || `Request failed with status ${res.status}`);
    }

    console.log(`[API] Success:`, path);
    return data;
  } catch (error) {
    console.error(`[API] Request failed:`, error.message);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please check your connection and ensure the backend server is running.');
    }
    if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
      throw new Error(`Cannot connect to server at ${BASE_URL}. Make sure the backend is running on port 5000.`);
    }
    throw error;
  }
};

export const api = {
  // Test connectivity
  testConnection: () => request('/api/auth/test'),
  signup: (payload) =>
    request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getIssues: () => request('/api/issues'),
  getMyIssues: (userId) =>
    request(`/api/issues/my?userId=${encodeURIComponent(userId)}`),
  createIssue: (payload) =>
    request('/api/issues', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  upvoteIssue: (id, userId) =>
    request(`/api/issues/${id}/upvote`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
  markIssueDone: (id, userId) =>
    request(`/api/issues/${id}/done`, {
      method: 'PATCH',
      body: JSON.stringify({ userId }),
    }),
  deleteIssue: (id, userId) =>
    request(`/api/issues/${id}?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    }),
  getCommunityPosts: (city) =>
    request(`/api/community${city && city !== 'All' ? `?city=${encodeURIComponent(city)}` : ''}`),
  createCommunityPost: (payload) =>
    request('/api/community', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  likeCommunityPost: (id, userId) =>
    request(`/api/community/${id}/like`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
  updateCommunityPost: (id, payload) =>
    request(`/api/community/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteCommunityPost: (id, userId) =>
    request(`/api/community/${id}?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    }),
};

export { BASE_URL };


