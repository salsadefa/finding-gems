# Finding Gems 💎

**A modern platform for discovering, sharing, and monetizing digital tools and resources**

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Progress](https://img.shields.io/badge/Progress-90%25-yellow)

---

## 🚀 Live Deployment

- **Production:** [https://findinggems.dualangka.com](https://findinggems.dualangka.com)
- **Backend API:** [https://finding-gems-backend.onrender.com](https://finding-gems-backend.onrender.com)
- **Database:** Supabase (PostgreSQL + Realtime)

---

## 📖 Overview

Finding Gems is a comprehensive platform that connects creators and users in the digital tools ecosystem. Built with modern web technologies, it features real-time messaging, payment processing, advanced search, and a powerful admin dashboard.

### Key Features

#### For Users
- 🔍 **Discover Tools** - Browse curated collections of digital tools and resources
- ⭐ **Reviews & Ratings** - Read and write reviews for tools
- 💬 **Real-Time Messaging** - Instant communication with creators (< 1 sec delivery)
- 📚 **Bookmarks** - Save favorite tools for later
- 🎯 **Tool Requests** - Request specific tools from the community
- 💳 **Secure Payments** - Powered by Xendit payment gateway

#### For Creators
- 🎨 **Showcase Tools** - Submit and monetize your digital products
- 📊 **Analytics Dashboard** - Track views, sales, and engagement
- 💰 **Automated Payouts** - Receive earnings directly
- 🔔 **Notifications** - Stay updated on requests and sales
- 📈 **Performance Metrics** - Monitor tool performance

#### For Admins
- 🛠️ **Full CRUD Operations** - Manage all platform resources
- 📊 **Analytics & Reports** - Platform-wide insights
- 🎯 **Content Moderation** - Approve/reject submissions
- 💸 **Payment Management** - Handle payouts and refunds
- 🔒 **User Management** - Role-based access control

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16.1.1 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Query (TanStack Query)
- **Real-Time:** Supabase Realtime (WebSocket)
- **Forms:** React Hook Form
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (Supabase)
- **Authentication:** JWT
- **Payments:** Xendit
- **File Storage:** Supabase Storage
- **Deployment:** Render

### Infrastructure
- **Database:** Supabase (PostgreSQL 17)
- **Real-Time:** Supabase Realtime
- **CDN:** Vercel Edge Network
- **Monitoring:** Sentry
- **CI/CD:** GitHub Actions → Render/Vercel

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)
- Xendit account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/salsadefa/finding-gems.git
   cd finding-gems
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   
   Create `.env.local` in the root directory:
   ```env
   # Frontend
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

   Create `.env` in the `backend/` directory:
   ```env
   # Server
   PORT=8000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000

   # JWT
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d

   # Supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
   ```

5. **Run database migrations**
   ```bash
   cd backend
   npm run migrate
   cd ..
   ```

6. **Start the development servers**
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   # Runs on http://localhost:8000
   ```

   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   # Runs on http://localhost:3000
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentation

- **[Project Status](./PROJECT_STATUS.md)** - Current features and progress
- **[Development Roadmap](./agent.md/ROADMAP_UPDATED.md)** - Upcoming features and timeline
- **[QA Testing](./QA_BRIEF_REALTIME_MESSAGING.md)** - Latest QA testing results
- **[Release Notes](./RELEASE_NOTES_REALTIME_MESSAGING.md)** - Recent feature releases

---

## ✨ Recent Features

### Real-Time Messaging (Feb 11, 2026) ⚡
- Instant message delivery (< 1 second)
- WebSocket-based real-time updates
- Live connection indicator
- Multi-tab synchronization
- Auto-reconnect on network failure
- **QA Score:** 100% PASS ✅

[Read Full Release Notes](./RELEASE_NOTES_REALTIME_MESSAGING.md)

---

## 🧪 Testing

### Run Tests

**Backend Tests:**
```bash
cd backend
npm test                  # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

**Frontend Tests:**
```bash
npm test                 # Run component tests
npm run test:e2e        # Run Playwright E2E tests
```

### Test Coverage
- **Backend:** ~70% (Target: 80%)
- **Frontend:** Component tests for critical flows
- **E2E:** Key user journeys covered

---

## 📦 Build & Deploy

### Build for Production

**Frontend:**
```bash
npm run build
npm start
```

**Backend:**
```bash
cd backend
npm run build
npm run start:prod
```

### Deployment

- **Frontend:** Auto-deploys to Vercel on push to `main`
- **Backend:** Auto-deploys to Render on push to `main`
- **Database:** Supabase (managed)

---

## 🔒 Security

- **Authentication:** JWT-based with refresh tokens
- **Authorization:** Role-based access control (RBAC)
- **Database:** Row-level security (RLS) policies
- **API:** Rate limiting and input validation
- **Payments:** PCI-compliant via Xendit
- **HTTPS:** Enforced on all endpoints

---

## 📈 Performance

- **API Response Time:** < 200ms (p95)
- **Message Delivery:** < 1 second (real-time)
- **Frontend Build Time:** 54 seconds
- **Bundle Size:** Optimized with code splitting
- **WebSocket Latency:** < 100ms

---

## 🤝 Contributing

This is a private project currently under active development. For questions or collaboration, please contact the project owner.

---

## 📝 License

Proprietary - All rights reserved

---

## 🔗 Links

- **Production:** [https://findinggems.dualangka.com](https://findinggems.dualangka.com)
- **Backend API:** [https://finding-gems-backend.onrender.com](https://finding-gems-backend.onrender.com)
- **GitHub:** [https://github.com/salsadefa/finding-gems](https://github.com/salsadefa/finding-gems)

---

## 📞 Support

For technical issues or questions, please refer to the project documentation or contact the development team.

---

**Last Updated:** February 11, 2026  
**Status:** 🟢 Production Ready (90% Complete)  
**Next Milestone:** Advanced Search & Filtering (Feb 12-18, 2026)
