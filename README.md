# 🎓 SkillSwap - Peer-to-Peer Skill Exchange Platform

<div align="center">

![SkillSwap](https://img.shields.io/badge/SkillSwap-v1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-10.7.0-FFCA28?logo=firebase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.0-38B2AC?logo=tailwind-css)

**Learn. Teach. Grow.**

*Connect with people who want to share their skills and learn from you.*

</div>

---

## 📖 About

SkillSwap is a modern peer-to-peer skill exchange platform that connects learners with teachers. Exchange your skills with others - teach what you know and learn what you want. No money needed, just a willingness to share knowledge.

### 🎯 Why SkillSwap?

- **100% Free** - No subscriptions, no hidden fees
- **Skill-Based Barter** - Exchange skills instead of money  
- **Video Calls** - Built-in Jitsi Meet integration for free unlimited video sessions
- **Real-Time Chat** - WhatsApp-like messaging with read receipts
- **Smart Matching** - AI-powered skill matching algorithm
- **Community** - Join discussions, share resources, grow together

---

## ✨ Key Features

### 💬 WhatsApp-Like Messaging
- Real-time chat with status indicators:
  - ⏱️ Clock (sending)
  - ✓ Single tick (sent)
  - ✓✓ Double gray ticks (delivered)
  - ✓✓ **Double blue ticks (read)**
- Reply to messages
- Delete own messages
- Copy message text
- Auto-read receipts

### 🎥 Video Conferencing
- **Jitsi Meet** integration
- Free unlimited video calls
- Deterministic rooms (same users + time = same room)
- Screen sharing
- Recording capability
- Mobile support

### 🔄 Skill Exchange
- Browse users by skills
- Smart matching algorithm
- Filter by location/skills
- Request & schedule exchanges
- Session management

### 👥 Community Features
- Discussion forums
- Post & comment
- Like & follow topics
- Search & filter

### 📚 Resource Sharing
- Share learning materials
- Rate & review
- Bookmark favorites
- Multiple formats support

---

## 🛠 Tech Stack

- **Frontend:** React 18.2, Vite, TailwindCSS
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Video:** Jitsi Meet
- **Animations:** Framer Motion
- **State:** React Context API
- **Icons:** React Icons
- **Routing:** React Router
- **Notifications:** React Hot Toast

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Firebase account

### Installation

1. **Clone repository:**
```bash
git clone https://github.com/yourusername/skillswap.git
cd skillswap
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup Firebase:**
   - Create Firebase project
   - Enable Authentication (Email, Google)
   - Create Firestore database
   - Enable Storage

4. **Configure environment:**

Create `.env` file:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. **Start development server:**
```bash
npm run dev
```

Visit `http://localhost:5173`

---

## 📁 Project Structure

```
skillswap/
├── src/
│   ├── components/       # React components
│   │   ├── auth/        # Authentication
│   │   ├── community/   # Forum & posts
│   │   ├── exchange/    # Skill exchange
│   │   ├── sessions/    # Chat & video
│   │   └── layout/      # Navigation
│   ├── pages/           # Page components
│   ├── contexts/        # React contexts
│   ├── utils/           # Utilities
│   ├── config/          # Configuration
│   └── styles/          # Global styles
├── public/              # Static assets
└── package.json
```

---

## 🎮 Usage

1. **Sign Up** - Create account or use Google Sign-In
2. **Complete Profile** - Add skills & bio
3. **Find Partners** - Browse skill exchange page
4. **Send Request** - Schedule exchange session
5. **Video Call** - Join Jitsi meeting
6. **Chat & Learn** - Real-time messaging

---

## 🔐 Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /exchanges/{exchangeId} {
      allow read, write: if request.auth.uid in resource.data.participants;
      
      match /messages/{messageId} {
        allow read, write: if request.auth.uid in 
          get(/databases/$(database)/documents/exchanges/$(exchangeId)).data.participants;
      }
    }
  }
}
```

---

## 🚢 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```
---

## 🐛 Troubleshooting

**Firebase errors:**
- Check `.env` configuration
- Verify Firebase project settings

**Messages not sending:**
- Check Firestore security rules
- Verify authentication

**Video calls not working:**
- Check Jitsi URLs
- Verify firewall settings

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 👨‍💻 Author

**Jami Karthikeya**

- GitHub: [[@karthik5299](https://github.com/Karthik5299/Skill-Swap)]()
- Email: jamikarthikeya99@gmail.com

---

## 🙏 Credits

- Firebase - Backend
- Jitsi Meet - Video calls
- TailwindCSS - Styling
- React - UI framework
- Framer Motion - Animations

---

## 🗺️ Roadmap

### v1.1 (Upcoming)
- [ ] Mobile app
- [ ] Advanced filters
- [ ] Group video calls
- [ ] Calendar integration

### v1.2 (Future)
- [ ] AI recommendations
- [ ] Gamification
- [ ] Multi-language support
- [ ] Skill certificates

---

## 🌟 Show Support

Give a ⭐ if you like this project!

---

<div align="center">

**Made with ❤️ by Jami Karthikeya**

</div>
