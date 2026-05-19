#  Kanban Pro | Task Manager

[![Live Demo](https://img.shields.io/badge/Live_Deployment-kanban--pro--beta.vercel.app-10B981?style=for-the-badge&logo=vercel)](https://kanban-pro-beta.vercel.app)
[![Frontend](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)]()
[![Backend](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)]()
[![Database](https://img.shields.io/badge/PostgreSQL_+-Prisma-2D3748?style=for-the-badge&logo=postgresql&logoColor=white)]()
[![DevOps](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)]()

A high-performance, full-stack task management application engineered for fluid workflow orchestration, strict tenant data isolation, and enterprise-grade scalability. 

**🔗 [Access the Live Website Here](https://kanban-pro-beta.vercel.app)**

---

## 📐 The Architecture & "The Why"

This repository is structured as a decoupled monorepo (`/frontend` and `/backend`). Every technology was specifically chosen to balance developer experience, application performance, and cloud-native scalability.

### 1. Frontend Engineering (Next.js 15 & React)
* **Framework:** Utilized the Next.js App Router for unparalleled Server-Side Rendering (SSR) and seamless route interception.
* **Cinematic UI/UX:** Built with **Tailwind CSS**, **Shadcn UI**, and **Framer Motion**. Instead of jarring native browser alerts or static loading screens, the application uses cinematic glassmorphic transitions, inline success states, and a premium Dark/Light mode toggle for an Awwwards-level user experience.
* **Complex Interactions:** Integrated `@dnd-kit` for physics-based drag-and-drop mechanics.
* **Mobile-First Physics:** Native HTML5 drag-and-drop natively conflicts with mobile touch scrolling. This was solved by engineering custom `TouchSensor` and `MouseSensor` configurations with explicit activation constraints (delay and tolerance) alongside `touch-none` CSS properties, ensuring flawless card manipulation across iOS and Android.

### 2. Backend Engineering (NestJS & TypeScript)
* **Framework:** NestJS was chosen to enforce strict, Angular-like architectural patterns (Controllers, Services, Modules). This guarantees a scalable, predictable, and heavily decoupled codebase compared to unstructured Express.js backends.
* **Stateless Authentication:** Implemented JWT-based authentication using Passport.js. Passwords are cryptographically hashed, and endpoints are heavily guarded by custom Auth Guards to ensure strict multi-tenant data isolation (users can solely query and mutate their own pipelines).

### 3. Database Layer (PostgreSQL & Prisma)
* **ORM:** Relational data (Users → Projects → Tasks) demands a rigid SQL schema. Prisma provides end-to-end type safety, instantly catching database query errors during compile time. 
* **Cloud Infrastructure:** Hosted securely on **Supabase**, utilizing connection pooling (pgBouncer) for high availability.

### 4. DevOps & Hybrid Cloud Deployment
This application utilizes a modern **Hybrid Deployment Architecture**:
* **Frontend (Serverless Edge):** Deployed on **Vercel** for native Next.js optimization, global Edge network caching, and instantaneous CI/CD pipeline routing. Included a dynamic root interceptor (`/page.tsx`) to seamlessly route naked traffic to the secure authorization node.
* **Backend (Docker Containerization):** The NestJS API is fully containerized and hosted on **Render**. 
  * *The Docker Strategy:* Built a highly optimized, custom **Alpine Linux Dockerfile**. Engineered build-stage environment variable injection to bypass CI/CD Prisma config checks, injected OpenSSL directly into the Alpine image for database client generation, and utilized `.dockerignore` mapping to prevent root directory expansion. This ensures the API is completely platform-agnostic, lightweight, and immune to cloud environment discrepancies.

---

## ⚡ Core Capabilities Audit

- [x] **Secure Authorization:** JWT-based stateless login and registration handoffs.
- [x] **Data Isolation:** Enterprise-grade tenant isolation; pipelines are strictly bound to the authenticated identity.
- [x] **Workspace Management:** Complete CRUD capabilities for project matrices.
- [x] **Interactive Kanban:** Fluid drag-and-drop task progression across statuses (To Do, In Progress, Done).
- [x] **Progress Analytics:** Dynamic analytics rendering active workflow states.
- [x] **Cinematic Feedback:** Asynchronous form processing with inline, animated success/error states and artificial authorization latency.

---

## 🛠️ Local Development Setup

To evaluate this project locally without needing a Docker daemon running, the system is configured to connect directly to the active Supabase cloud database. You will need Node.js (v18+) and Git installed.

### Phase 1: Backend API Initialization

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
2. Install dependencies:
    ```bash
   npm install
3. Environment Configuration

Create a `.env` file in the `backend` folder. You can copy the structure from the included `.env.example` file:

```env
# Connect to your local or cloud PostgreSQL database
DATABASE_URL="postgresql://user:password@localhost:5432/kanban?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/kanban"

# A secure random string for signing JWT tokens
JWT_SECRET="your_super_secret_development_key"
PORT=3000
```
4. Sync the Database Schema and generate the Prisma client:
    ```bash
    npx prisma db push
    npx prisma generate
5. Ignite the NestJS Server:
    ```bash
    npm run start:dev 

### Phase 2: Frontend Client Initialization

1. Open a second terminal window and navigate to the frontend directory:
    ```bash
    cd frontend
2. Install dependencies:
    ```bash
    npm install
3. Environment Configuration: Create a `.env.local` file in the `frontend` folder to point the client to your local API:
    ```bash
    NEXT_PUBLIC_API_URL="http://localhost:3000"
4. Ignite the Next.js Client:
    ```bash
    npm run dev
5. Access the Matrix: Open your browser and navigate to `http://localhost:3001` (or whichever port Next.js assigns). You will automatically hit the root interceptor and enter the secure authorization node.
