import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../config/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  orderBy,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import ChatHeader from "../components/sessions/ChatHeader";
import MessageList from "../components/sessions/MessageList";
import MessageInput from "../components/sessions/MessageInput";
import SessionSidebar from "../components/sessions/SessionSidebar";
import { toast } from "react-hot-toast";
import { createMeeting, generateMeetingLink } from "../utils/meetingUtils";
import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";

const SessionsPage = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ---------------- FETCH USER DATA ----------------
  const fetchUserData = useCallback(async (userId) => {
    const userDoc = await getDoc(doc(db, "users", userId));
    return userDoc.exists() ? userDoc.data() : null;
  }, []);

  // ---------------- FETCH SESSIONS ----------------
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "exchanges"),
      where("participants", "array-contains", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const sessionsData = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const session = { id: docSnapshot.id, ...docSnapshot.data() };
          const otherUserId = session.participants.find(
            (id) => id !== currentUser.uid
          );

          // Fetch both users profiles to get real skills
          const [otherUser, myUser] = await Promise.all([
            fetchUserData(otherUserId),
            fetchUserData(currentUser.uid),
          ]);

          const myTeach    = myUser?.skillsToTeach    || [];
          const myLearn    = myUser?.skillsToLearn    || [];
          const theirTeach = otherUser?.skillsToTeach || [];
          const theirLearn = otherUser?.skillsToLearn || [];

          // Best match: skill I teach that they want to learn
          const teachMatch = myTeach.find((s) => theirLearn.includes(s));
          // Best match: skill they teach that I want to learn
          const learnMatch = theirTeach.find((s) => myLearn.includes(s));

          return {
            ...session,
            otherUser,
            skillToTeach : teachMatch  || myTeach[0]    || "",
            skillToLearn : learnMatch  || myLearn[0]    || "",
            mySkillsToTeach  : myTeach,
            mySkillsToLearn  : myLearn,
            theirSkillsToTeach: theirTeach,
            theirSkillsToLearn: theirLearn,
          };
        })
      );

      setSessions(sessionsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, fetchUserData]);

  // ---------------- SET ACTIVE SESSION ----------------
  useEffect(() => {
    if (!sessions.length) return;

    if (sessionId) {
      const found = sessions.find((s) => s.id === sessionId);
      if (found) setActiveSession(found);
    } else {
      setActiveSession(sessions[0]);
      navigate(`/sessions/${sessions[0].id}`, { replace: true });
    }
  }, [sessions, sessionId, navigate]);

  // ---------------- REAL-TIME MESSAGE LISTENER ----------------
  useEffect(() => {
    if (!activeSession?.id) return;

    const q = query(
      collection(db, "exchanges", activeSession.id, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp || null,
      }));

      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [activeSession?.id]);

  // ---------------- SEND TEXT MESSAGE ----------------
  const handleSendMessage = async (text) => {
    if (!activeSession || !text.trim()) return;

    try {
      await addDoc(
        collection(db, "exchanges", activeSession.id, "messages"),
        {
          text,
          senderId: currentUser.uid,
          senderName: currentUser.displayName,
          senderPhoto: currentUser.photoURL || "",
          timestamp: serverTimestamp(),
          type: "text",
        }
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    }
  };

  // ---------------- CLEAR CHAT ----------------
  const handleClearChat = async () => {
    if (!window.confirm("Are you sure you want to clear this chat?")) return;

    try {
      const messagesRef = collection(
        db,
        "exchanges",
        activeSession.id,
        "messages"
      );

      const snapshot = await getDocs(messagesRef);
      const batch = writeBatch(db);

      snapshot.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      await addDoc(messagesRef, {
        type: "system",
        text: `${currentUser.displayName} cleared the chat`,
        timestamp: serverTimestamp(),
        senderId: currentUser.uid,
      });

      toast.success("Chat cleared successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear chat");
    }
  };

  // ---------------- SCHEDULE SESSION (SEND LINK IN CHAT ONLY) ----------------
  const handleScheduleSession = async (sessionData) => {
    if (!activeSession) return;

    try {
      // Create meeting through backend API
      const participants = [
        {
          userId: activeSession.requesterId,
          name: activeSession.requesterName,
          email: activeSession.requesterEmail
        },
        {
          userId: activeSession.recipientId,
          name: activeSession.recipientName,
          email: activeSession.recipientEmail
        }
      ];
      
      const meetingResponse = await createMeeting(
        participants,
        sessionData.date,
        sessionData.time,
        sessionData.duration
      );
      
      const meetingLink = generateMeetingLink(meetingResponse.meeting.roomId);

      await addDoc(
        collection(db, "exchanges", activeSession.id, "messages"),
        {
          type: "video",
          text: `Session scheduled for ${sessionData.date} at ${sessionData.time} (${sessionData.duration} minutes)`,
          meetingLink,
          date: sessionData.date,
          time: sessionData.time,
          duration: sessionData.duration,
          timestamp: serverTimestamp(),
          senderId: currentUser.uid,
          senderName: currentUser.displayName,
          senderPhoto: currentUser.photoURL || "",
        }
      );

      toast.success("Meeting link sent in chat!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to schedule");
    }
  };

  // ---------------- FILTER ----------------
  const filteredSessions = sessions.filter((session) => {
    const search = searchTerm.toLowerCase();
    return (
      session.otherUser?.displayName?.toLowerCase().includes(search) ||
      session.skillToTeach?.toLowerCase().includes(search) ||
      session.skillToLearn?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-indigo-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${theme.mode === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
      <SessionSidebar
        sessions={filteredSessions}
        activeSession={activeSession}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSessionSelect={(session) => {
          setActiveSession(session);
          navigate(`/sessions/${session.id}`);
        }}
      />

      {activeSession ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
          <ChatHeader
            session={activeSession}
            currentUser={currentUser}
            onScheduleSession={handleScheduleSession}
            onClearChat={handleClearChat}
          />
          <MessageList
            messages={messages}
            currentUserId={currentUser.uid}
            session={activeSession}
          />
          <MessageInput
            onSendMessage={handleSendMessage}
            currentUser={currentUser}
            mySkillsToTeach={activeSession?.mySkillsToTeach || []}
            mySkillsToLearn={activeSession?.mySkillsToLearn || []}
          />
        </motion.div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p>Select a session to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
