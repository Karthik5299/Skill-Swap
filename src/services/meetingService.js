const API_BASE_URL = 'http://localhost:5000/api';

export const meetingService = {
  // Create a new meeting
  createMeeting: async (meetingData) => {
    const response = await fetch(`${API_BASE_URL}/meetings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meetingData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create meeting');
    }
    
    return await response.json();
  },

  // Get meeting by room ID
  getMeeting: async (roomId) => {
    const response = await fetch(`${API_BASE_URL}/meetings/${roomId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch meeting');
    }
    
    return await response.json();
  },

  // Join a meeting
  joinMeeting: async (roomId, userId) => {
    const response = await fetch(`${API_BASE_URL}/meetings/${roomId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to join meeting');
    }
    
    return await response.json();
  },

  // Get user's meetings
  getUserMeetings: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/meetings/user/${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user meetings');
    }
    
    return await response.json();
  }
};