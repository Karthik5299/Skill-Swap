import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../config/firebase";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import CommunityPost from "../components/community/CommunityPost";
import CommunityPostForm from "../components/community/CommunityPostForm";
import SearchAndSort from "../components/community/SearchAndSort";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useTheme } from "../contexts/ThemeContext";

const CommunityPage = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories] = useState([
    "General",
    "Questions",
    "Feedback",
    "Success Stories",
    "Tips & Tricks",
  ]);

  useEffect(() => {
    // Removed orderBy("createdAt", "desc") to prevent Firebase Index errors
    const q = query(collection(db, "communityPosts"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newPost.trim()) return;

    try {
      // currentUser.photoURL is now enriched from Firestore by AuthContext
      // so it always contains the latest photo including base64
      await addDoc(collection(db, "communityPosts"), {
        content: newPost,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || "Anonymous",
        authorPhoto: currentUser.photoURL || "",
        createdAt: serverTimestamp(),
        likes: [],
        comments: [],
        category: activeCategory !== "all" ? activeCategory : "General",
      });
      setNewPost("");
      toast.success("Post shared successfully!");
    } catch (error) {
      toast.error("Failed to share post: " + error.message);
    }
  };

  // useMemo prevents unnecessary re-calculations and potential loops
  const sortedAndFilteredPosts = useMemo(() => {
    let result = posts.filter((post) => {
      const content = post.content || "";
      const author = post.authorName || "";
      const matchesSearch =
        content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        activeCategory === "all" ||
        (post.category && post.category === activeCategory);

      return matchesSearch && matchesCategory;
    });

    return result.sort((a, b) => {
      const dateA = a.createdAt?.seconds ? a.createdAt.seconds : 0;
      const dateB = b.createdAt?.seconds ? b.createdAt.seconds : 0;

      switch (sortOption) {
        case "newest":
          return dateB - dateA;
        case "oldest":
          return dateA - dateB;
        case "mostLiked":
          return (b.likes?.length || 0) - (a.likes?.length || 0);
        case "mostCommented":
          return (b.comments?.length || 0) - (a.comments?.length || 0);
        default:
          return 0;
      }
    });
  }, [posts, searchQuery, activeCategory, sortOption]);

  return (
    <div className="min-h-screen">
      {/* Background Decorations */}
      <div className={`fixed inset-0 -z-10 overflow-hidden`}>
        <div className={`absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl opacity-20 ${theme.mode === 'dark' ? 'bg-indigo-900' : 'bg-indigo-100'}`}></div>
        <div className={`absolute bottom-20 right-10 w-64 h-64 rounded-full blur-3xl opacity-20 ${theme.mode === 'dark' ? 'bg-purple-900' : 'bg-purple-100'}`}></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 mb-2">
            Community Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Connect, collaborate and grow with fellow skill enthusiasts.
          </p>
        </motion.div>

        <div className="space-y-8">
          {currentUser && (
            <CommunityPostForm
              onSubmit={handleSubmit}
              value={newPost}
              onChange={setNewPost}
              currentUser={currentUser}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              categories={categories}
            />
          )}

          <SearchAndSort
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortOption={sortOption}
            setSortOption={setSortOption}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            categories={categories}
          />

          {loading ? (
            <div className="flex justify-center py-12"><LoadingSpinner /></div>
          ) : sortedAndFilteredPosts.length === 0 ? (
            <div className="text-center py-16 glass rounded-2xl p-8">
              <h3 className="text-2xl font-semibold">No posts found</h3>
              <p>Be the first to start a conversation!</p>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {sortedAndFilteredPosts.map((post) => (
                  <CommunityPost
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;