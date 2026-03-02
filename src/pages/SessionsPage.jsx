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
  updateDoc,
  deleteDoc,
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
import { generateMeetingLink } from "../utils/meetingUtils";
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
  const [replyTo, setReplyTo] = useState(null); // NEW: For reply functionality

  // ---------------- FETCH USER DATA ----------------
  const fetchUserData = useCallback(async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
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

  // ---------------- MARK MESSAGES AS READ ----------------
  useEffect(() => {
    if (!activeSession?.id || !currentUser?.uid || !messages.length) return;

    const markAsRead = async () => {
      try {
        const batch = writeBatch(db);
        let hasUpdates = false;

        messages.forEach((message) => {
          // Mark other user's unread messages as read
          if (
            message.senderId !== currentUser.uid &&
            message.status !== "read" &&
            !message.readBy?.includes(currentUser.uid)
          ) {
            const messageRef = doc(
              db,
              "exchanges",
              activeSession.id,
              "messages",
              message.id
            );
            batch.update(messageRef, {
              status: "read",
              readBy: [...(message.readBy || []), currentUser.uid],
            });
            hasUpdates = true;
          }
        });

        if (hasUpdates) {
          await batch.commit();
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    };

    // Mark as read after a short delay
    const timer = setTimeout(markAsRead, 500);
    return () => clearTimeout(timer);
  }, [activeSession?.id, currentUser?.uid, messages]);

  // ---------------- SEND TEXT MESSAGE (ENHANCED) ----------------
  const handleSendMessage = async (text, options = {}) => {
    if (!activeSession || !text.trim()) return;

    try {
      // Get user photo from Firestore
      let senderPhoto = "";
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          senderPhoto = userDoc.data().photoURL || "";
        }
      } catch (err) {
        console.error("Failed to fetch user photo:", err);
        senderPhoto = currentUser.photoURL || "";
      }

      const newMessage = {
        text,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || "Anonymous",
        senderPhoto: senderPhoto,
        timestamp: serverTimestamp(),
        status: "sent",
        type: "text",
        ...(options.replyTo && { replyTo: options.replyTo }),
      };

      await addDoc(
        collection(db, "exchanges", activeSession.id, "messages"),
        newMessage
      );

      setReplyTo(null);

      // Update status to delivered
      setTimeout(async () => {
        try {
          const messagesRef = collection(
            db,
            "exchanges",
            activeSession.id,
            "messages"
          );
          const q = query(
            messagesRef,
            where("senderId", "==", currentUser.uid),
            where("status", "==", "sent")
          );
          const snapshot = await getDocs(q);
          const batch = writeBatch(db);

          snapshot.forEach((doc) => {
            batch.update(doc.ref, { status: "delivered" });
          });

          await batch.commit();
        } catch (error) {
          console.error("Error updating message status:", error);
        }
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    }
  };

  // ---------------- DELETE MESSAGE ----------------
  const handleDeleteMessage = async (message) => {
    if (!activeSession || message.senderId !== currentUser.uid) {
      toast.error("You can only delete your own messages");
      return;
    }

    try {
      await deleteDoc(
        doc(db, "exchanges", activeSession.id, "messages", message.id)
      );
      toast.success("Message deleted");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  // ---------------- HANDLE REPLY ----------------
  const handleReply = (message) => {
    setReplyTo({
      id: message.id,
      text: message.text,
      senderName: message.senderName || "User",
    });
  };

  // ---------------- CANCEL REPLY ----------------
  const handleCancelReply = () => {
    setReplyTo(null);
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

  // ---------------- SCHEDULE SESSION ----------------
  const handleScheduleSession = async (sessionData) => {
    if (!activeSession) return;

    try {
      let senderPhoto = "";
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          senderPhoto = userDoc.data().photoURL || "";
        }
      } catch (err) {
        senderPhoto = currentUser.photoURL || "";
      }


      const meetingLink = generateMeetingLink();

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
          senderPhoto: senderPhoto,
          status: "sent",
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
    <div
      className={`flex h-[calc(100vh-64px)] overflow-x-hidden overflow-y-hidden ${
        theme.mode === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <SessionSidebar
        sessions={filteredSessions}
        activeSession={activeSession}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSessionSelect={(session) => {
          setActiveSession(session);
          navigate(`/sessions/${session.id}`);
          setReplyTo(null);
        }}
      />

      {activeSession ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col h-full overflow-hidden"
        >
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
            onReply={handleReply}
            onDelete={handleDeleteMessage}
          />
          <MessageInput
            onSendMessage={handleSendMessage}
            currentUser={currentUser}
            mySkillsToTeach={activeSession?.mySkillsToTeach || []}
            mySkillsToLearn={activeSession?.mySkillsToLearn || []}
            replyTo={replyTo}
            onCancelReply={handleCancelReply}
          />
        </motion.div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            Select a session to start chatting
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionsPage;9