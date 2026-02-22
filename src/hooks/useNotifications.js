import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch
} from "firebase/firestore";

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // We removed orderBy("createdAt", "desc") from the query 
    // to bypass the index requirement for now.
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      // Sort manually in JavaScript to fix the error immediately
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter((n) => !n.read).length);
    }, (err) => {
        console.error("Notification listener error:", err);
    });

    return () => unsubscribe();
  }, [userId]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true,
      });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (notifications.length === 0) return; // Prevent empty batch errors
      const batch = writeBatch(db);
      const unread = notifications.filter((n) => !n.read);
      
      if (unread.length === 0) return;

      unread.forEach((n) => {
          batch.update(doc(db, "notifications", n.id), { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error("Batch update error:", error);
    }
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
};