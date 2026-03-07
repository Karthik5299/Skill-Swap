// src/utils/meetingUtils.js

// Helper function to create a deterministic hash from input string
const createHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 12);
};

// Generate Jitsi Meet link with deterministic room name
export const generateMeetingLink = (participants = [], date = '', time = '') => {
  // Create a unique room ID based on participants and session details
  const participantIds = [...participants].sort().join(',');
  const sessionDetails = `${participantIds}-${date}-${time}`;
  const roomId = createHash(sessionDetails);
  
  // Jitsi Meet provides free, persistent rooms
  return `https://meet.jit.si/skillswap-${roomId}`;
};

// Alternative: Simple random room (for backward compatibility)
export const generateRandomMeetingLink = () => {
  const randomId = Math.random().toString(36).substring(2, 10);
  return `https://meet.jit.si/skillswap-${randomId}`;
};

// Create meeting with Jitsi
export const createMeeting = async (participants, date, time, duration) => {
  // Generate deterministic room ID
  const participantIds = participants.map(p => p.userId || p).sort();
  const roomId = createHash(`${participantIds.join(',')}-${date}-${time}`);
  
  return {
    meeting: {
      roomId: roomId,
      participants: participants.map((participant, index) => ({
        ...participant,
        role: index === 0 ? 'host' : 'participant'
      })),
      scheduledDate: date,
      scheduledTime: time,
      duration: duration
    },
    meetingLink: `https://meet.jit.si/skillswap-${roomId}`
  };
};

export const isMeetingActive = (session) => {
  if (!session.date || !session.time || !session.duration) return false;

  const sessionDateTime = new Date(`${session.date}T${session.time}`);
  const now = new Date();
  const tenMinutesBefore = new Date(sessionDateTime.getTime() - 10 * 60000);
  const sessionEndTime = new Date(
    sessionDateTime.getTime() + parseInt(session.duration) * 60000
  );
  const thirtyMinutesAfter = new Date(sessionEndTime.getTime() + 30 * 60000);

  // Meeting is active from 10 minutes before until 30 minutes after scheduled end
  return now >= tenMinutesBefore && now <= thirtyMinutesAfter;
};

export const shouldShowJoinButton = (session) => {
  if (!session.date || !session.time || !session.duration) return false;

  const sessionDateTime = new Date(`${session.date}T${session.time}`);
  const now = new Date();
  const tenMinutesBefore = new Date(sessionDateTime.getTime() - 10 * 60000);
  const sessionEndTime = new Date(
    sessionDateTime.getTime() + parseInt(session.duration) * 60000
  );

  // Show join button from 10 minutes before until scheduled end time
  return now >= tenMinutesBefore && now <= sessionEndTime;
};

export const isSessionCompleted = (session) => {
  if (!session.date || !session.time || !session.duration) return false;

  const sessionEndTime = new Date(
    new Date(`${session.date}T${session.time}`).getTime() +
      parseInt(session.duration) * 60000
  );
  const now = new Date();

  return now > sessionEndTime;
};
