import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { db } from "../config/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { motion } from "framer-motion";
import ProfilePlaceholder from "../assets/profile-placeholder.svg";
import {
  FiX,
  FiPlus,
  FiLoader,
  FiEdit2,
  FiSave,
  FiCamera,
  FiCheck,
} from "react-icons/fi";
import { useTheme } from "../contexts/ThemeContext";

// ─── Compress image to a small base64 string (stays well under Firestore 1MB) ─
const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not decode image"));
      img.onload = () => {
        // Max dimension 300px – keeps base64 well under 50 KB
        const MAX = 300;
        let w = img.width;
        let h = img.height;
        if (w > h && w > MAX) { h = Math.round((h * MAX) / w); w = MAX; }
        else if (h > MAX)     { w = Math.round((w * MAX) / h); h = MAX; }

        const canvas = document.createElement("canvas");
        canvas.width  = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);

        // quality 0.75 → ~10-30 KB for a 300px face photo
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

// ─── Component ────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { theme } = useTheme();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    skillsToTeach: [],
    skillsToLearn: [],
    photoURL: "",
    coverPhoto: "",
  });

  const [newSkill,     setNewSkill]     = useState({ teach: "", learn: "" });
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [isEditing,    setIsEditing]    = useState(false);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [coverChanged, setCoverChanged] = useState(false);
  const coverFileInputRef = useRef(null);

  // ─── Load profile from Firestore ──────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.uid) return;
    let live = true;

    const load = async () => {
      setLoading(true);
      try {
        const ref  = doc(db, "users", currentUser.uid);
        const snap = await getDoc(ref);

        if (!live) return;

        if (snap.exists()) {
          // ✅ Always prefer Firestore data (it stores the base64)
          const data = snap.data();
          setFormData({
            displayName:   data.displayName   || "",
            bio:           data.bio           || "",
            skillsToTeach: data.skillsToTeach || [],
            skillsToLearn: data.skillsToLearn || [],
            photoURL:      data.photoURL      || "",
            coverPhoto:    data.coverPhoto    || "",
          });
        
        } else {
          // First time – create document
          const initial = {
            displayName:   currentUser.displayName || "",
            bio:           "",
            skillsToTeach: [],
            skillsToLearn: [],
            photoURL:      currentUser.photoURL || "",
            coverPhoto:    "",
            email:         currentUser.email,
            uid:           currentUser.uid,
            createdAt:     serverTimestamp(),
            updatedAt:     serverTimestamp(),
          };
          await setDoc(ref, initial);
          if (live) setFormData(initial);
        }
      } catch (err) {
        console.error("Load error:", err);
        if (live) toast.error("Failed to load profile");
      } finally {
        if (live) setLoading(false);
      }
    };

    load();
    return () => { live = false; };
  }, [currentUser]);

  // ─── Pick & compress photo (pure base64 – zero CORS) ──────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // allow re-selecting same file

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG, PNG, WEBP…)");
      return;
    }

    setUploading(true);
    try {
      const compressed = await compressImage(file);
      // Sanity check – compressed string should be < 200 KB
      const sizeKB = Math.round((compressed.length * 3) / 4 / 1024);
      console.log(`Compressed photo: ~${sizeKB} KB`);

      setFormData((prev) => ({ ...prev, photoURL: compressed }));
      setPhotoChanged(true);
      toast.success("Photo ready — click Save Changes to apply ✅");
    } catch (err) {
      console.error(err);
      toast.error("Could not process image. Try another file.");
    } finally {
      setUploading(false);
    }
  };

  // ─── Use a URL instead ─────────────────────────────────────────────────────
  

  

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file (JPG, PNG, WEBP…)"); return; }
    try {
      const compressed = await compressImage(file);
      setFormData((prev) => ({ ...prev, coverPhoto: compressed }));
      setCoverChanged(true);
      toast.success("Cover ready — click Save Changes to apply ✅");
    } catch (err) {
      console.error(err);
      toast.error("Could not process cover image. Try another file.");
    }
  };

  // ─── Skills ────────────────────────────────────────────────────────────────
  const handleAddSkill = (type) => {
    const field = type === "Teach" ? "teach" : "learn";
    const skill = newSkill[field]?.trim();
    if (!skill) return;
    if (formData[`skillsTo${type}`].includes(skill)) {
      toast.error("Skill already added");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [`skillsTo${type}`]: [...prev[`skillsTo${type}`], skill],
    }));
    setNewSkill((prev) => ({ ...prev, [field]: "" }));
  };

  const handleRemoveSkill = (type, skill) =>
    setFormData((prev) => ({
      ...prev,
      [`skillsTo${type}`]: prev[`skillsTo${type}`].filter((s) => s !== skill),
    }));

  // ─── Save to Firestore (and Firebase Auth for non-base64 URLs) ────────────
  const handleSubmit = async () => {
    if (!currentUser) return;
    if (!formData.displayName.trim()) {
      toast.error("Display name cannot be empty");
      return;
    }

    setSubmitting(true);
    try {
      // Update Firebase Auth (only accepts real URLs, not base64)
      const authPhoto = formData.photoURL.startsWith("data:")
        ? (currentUser.photoURL || "")   // keep whatever was there
        : formData.photoURL;

      await updateUserProfile({
        displayName: formData.displayName.trim(),
        photoURL:    authPhoto,
      });

      // ✅ Save EVERYTHING (including base64) to Firestore
      await updateDoc(doc(db, "users", currentUser.uid), {
        displayName:   formData.displayName.trim(),
        bio:           formData.bio,
        skillsToTeach: formData.skillsToTeach,
        skillsToLearn: formData.skillsToLearn,
        photoURL:      formData.photoURL,   // base64 or URL – stored here
        coverPhoto:    formData.coverPhoto || "",
        email:         currentUser.email,
        uid:           currentUser.uid,
        updatedAt:     serverTimestamp(),
      });

      toast.success("Profile saved! ✅");
      setIsEditing(false);
      setPhotoChanged(false);
    } catch (err) {
      console.error("Save error:", err);
      // If doc doesn't exist yet, use setDoc instead
      if (err.code === "not-found") {
        try {
          await setDoc(doc(db, "users", currentUser.uid), {
            displayName:   formData.displayName.trim(),
            bio:           formData.bio,
            skillsToTeach: formData.skillsToTeach,
            skillsToLearn: formData.skillsToLearn,
            photoURL:      formData.photoURL,
            coverPhoto:    formData.coverPhoto || "",
            email:         currentUser.email,
            uid:           currentUser.uid,
            createdAt:     serverTimestamp(),
            updatedAt:     serverTimestamp(),
          });
          toast.success("Profile saved! ✅");
          setIsEditing(false);
          setPhotoChanged(false);
        } catch (e2) {
          toast.error(`Save failed: ${e2.message}`);
        }
      } else {
        toast.error(`Save failed: ${err.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  const dark = theme.mode === "dark";

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl animate-blob ${dark ? "bg-indigo-900 opacity-10" : "bg-indigo-100 opacity-40"}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl animate-blob animation-delay-2000 ${dark ? "bg-purple-900 opacity-10" : "bg-purple-100 opacity-40"}`} />
      </div>

      <div className="relative max-w-4xl mx-auto space-y-8">

        {/* ── Header card ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`glass rounded-3xl overflow-hidden shadow-2xl ${dark ? "border border-gray-700" : "border border-white"}`}
        >
          {/* Cover banner */}
          <div
            className={`h-48 relative ${dark ? "bg-gradient-to-r from-gray-800 to-gray-900" : "bg-gradient-to-r from-indigo-100 to-purple-100"}`}
            style={formData.coverPhoto ? { backgroundImage: `url(${formData.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          >
            {/* Cover edit controls */}
            {isEditing && (
              <div className="absolute right-4 top-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="bg-black/40 hover:bg-black/50 text-white p-2 rounded-md shadow"
                >
                  <FiCamera className="h-5 w-5" />
                </button>
              </div>
            )}
            <input ref={coverFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            {/* Avatar */}
            <div className="absolute ml-8 mt-28">
              <div className="relative group w-32 h-32">
                <img
                  key={formData.photoURL} // force re-render when photo changes
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800 object-cover shadow-xl"
                  src={formData.photoURL || ProfilePlaceholder}
                  alt="Profile"
                  onError={(e) => { e.target.src = ProfilePlaceholder; }}
                />

                {isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold gap-1 cursor-pointer"
                    >
                      {uploading
                        ? <FiLoader className="h-7 w-7 animate-spin" />
                        : <><FiCamera className="h-7 w-7" /><span>Change photo</span></>
                      }
                    </button>

                    {/* Camera badge */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-1 right-1 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg transition-colors"
                    >
                      <FiCamera className="h-4 w-4" />
                    </button>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </>
                )}

                {/* Green check when photo changed but not yet saved */}
                {photoChanged && !uploading && (
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white p-1 rounded-full shadow">
                    <FiCheck className="h-3 w-3" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info section */}
          <div className="px-8 pt-20 pb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formData.displayName || "Anonymous"}
                </h1>
                <p className="text-indigo-500 dark:text-indigo-400 text-sm mt-1">
                  {currentUser?.email}
                </p>
              </div>
              <button
                onClick={() => { setIsEditing(!isEditing); setPhotoChanged(false); }}
                className={`flex items-center px-4 py-2 rounded-lg shadow-md transition-colors ${
                  isEditing
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                {isEditing ? <><FiSave className="mr-2" />View Mode</> : <><FiEdit2 className="mr-2" />Edit Profile</>}
              </button>
            </div>

            {/* Upload hint */}
            {isEditing && (
              <div className={`mb-4 p-3 rounded-xl text-sm flex items-start gap-2 ${dark ? "bg-indigo-900/30 text-indigo-300" : "bg-indigo-50 text-indigo-700"}`}>
                <FiCamera className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  Click your avatar or the camera icon to upload a photo from your device.
                  Remember to click <strong>Save Changes</strong> after selecting.
                </span>
              </div>
            )}

            

            {/* Display Name */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-inner"
                  placeholder="Your name"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  {formData.displayName || "No name set"}
                </p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-inner"
                  placeholder="Tell others about yourself…"
                  maxLength={500}
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  {formData.bio || "No bio yet. Add something about yourself!"}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Skills card ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`glass rounded-3xl p-8 shadow-2xl ${dark ? "border border-gray-700" : "border border-white"}`}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            My Skills
          </h2>

          {/* Teach */}
          <SkillSection
            title="I Can Teach"
            skills={formData.skillsToTeach}
            value={newSkill.teach}
            isEditing={isEditing}
            colorClass="from-indigo-100 to-purple-100 text-indigo-800 dark:from-indigo-900 dark:to-purple-900 dark:text-indigo-200"
            onChange={(v) => setNewSkill({ ...newSkill, teach: v })}
            onAdd={() => handleAddSkill("Teach")}
            onRemove={(s) => handleRemoveSkill("Teach", s)}
            placeholder="Add a skill you can teach"
          />

          <div className="mt-8">
            {/* Learn */}
            <SkillSection
              title="I Want to Learn"
              skills={formData.skillsToLearn}
              value={newSkill.learn}
              isEditing={isEditing}
              colorClass="from-green-100 to-teal-100 text-green-800 dark:from-green-900 dark:to-teal-900 dark:text-green-200"
              onChange={(v) => setNewSkill({ ...newSkill, learn: v })}
              onAdd={() => handleAddSkill("Learn")}
              onRemove={(s) => handleRemoveSkill("Learn", s)}
              placeholder="Add a skill you want to learn"
            />
          </div>
        </motion.div>

        {/* ── Save button ───────────────────────────────────────────────────── */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end gap-3"
          >
            <button
              type="button"
              onClick={() => { setIsEditing(false); setPhotoChanged(false); }}
              className="px-6 py-3 rounded-xl font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting
                ? <><FiLoader className="animate-spin h-5 w-5" />Saving…</>
                : <><FiSave className="h-5 w-5" />Save Changes</>
              }
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ─── SkillSection sub-component ───────────────────────────────────────────────
const SkillSection = ({
  title, skills, value, isEditing,
  colorClass, onChange, onAdd, onRemove, placeholder,
}) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
      {title}
    </h3>
    {isEditing ? (
      <>
        <div className="flex rounded-lg shadow-sm mb-3">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAdd()}
            className="flex-1 px-4 py-3 rounded-l-lg border-0 focus:ring-2 focus:ring-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={onAdd}
            disabled={!value?.trim()}
            className="px-4 py-3 rounded-r-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <motion.span
              key={skill}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r shadow-md ${colorClass}`}
            >
              {skill}
              <button type="button" onClick={() => onRemove(skill)} className="ml-2 opacity-60 hover:opacity-100">
                <FiX className="h-3.5 w-3.5" />
              </button>
            </motion.span>
          ))}
        </div>
      </>
    ) : (
      <div className="flex flex-wrap gap-3">
        {skills.length > 0 ? (
          skills.map((skill) => (
            <span
              key={skill}
              className={`px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r shadow-md ${colorClass}`}
            >
              {skill}
            </span>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">None added yet</p>
        )}
      </div>
    )}
  </div>
);

export default ProfilePage;
