# CampusConnect (Hackathon Submission)

CampusConnect is a modern campus hub where students can share Blogs, add Resources, and use an AI PDF Summarizer. It provides an end-to-end experience with authentication-protected features and a clean, modern UI.

## Live UI [NOTE: This is a replit demo of our application created from the backend and frontend  files of our hardcoded folder .To ensure smooth working of the application we put a replit deployment here]
https://campus-connect-hub--mailfromshivava.replit.app/

## Tech Stack
Frontend: React (Vite) + Tailwind CSS + Zustand + Axios (withCredentials: true)  
Backend: Node.js + Express + MongoDB (Mongoose) + Redis (refresh tokens) + Cookie-based auth (httpOnly cookies)  
AI: PDF parsing + AI summarization using an OpenAI-compatible gateway (supports SambaNova-style OpenAI compatibility).  

## Features
Authentication (Login required):
- Protected routes for: writing blogs, editing/deleting owned blogs, uploading resources, and using AI summarizer.

Blogs:
- Campus feed UI with blog cards (title, category, excerpt/snippet, tags, author label).
- Blog detail page.
- Edit & delete for owned blogs.

Resources:
- Public Resources listing + “My Resources” section.
- For this hackathon version, resource upload uses a shareable Google Drive link (so you can instantly verify download).

AI PDF Summarizer:
- Upload a PDF to generate a structured summary (PDF-only server capability).

## Hackathon Resource Mode (Drive Link)
Instead of uploading raw files for resources, the Upload Resource page accepts a shareable Drive link and stores it as the resource `fileUrl`.
Recommended link format:
https://drive.google.com/file/d/<FILE_ID>/view?usp=sharing
The link must be publicly accessible (anyone with the link can view) so the demo works.

## Project Structure
- `backend/` - Express API + MongoDB models/routes + AI summarizer endpoint + resource handlers.
- `frontend/` - React UI with Zustand store, pages, and Tailwind styling.

## Getting Started (Local Development)

### 1) Backend Setup
1. Go to backend directory:
   cd backend
2. Install dependencies:
   npm install
3. Create environment file:
   Copy `backend/.env.example` to `backend/.env`
4. Update `backend/.env` values:
   - `MONGO_URL`
   - `REDIS_URL`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (only needed if you still use file upload to Cloudinary; for Drive-link demo you may not need Cloudinary uploads)
   - AI configuration:
     - `OPENAI_API_KEY` (use your OpenAI-compatible key, e.g., SambaNova key)
     - `OPENAI_BASE_URL` (must be the OpenAI-compatible base URL)
     - `OPENAI_MODEL` (optional; if left blank, backend will attempt model discovery from `${OPENAI_BASE_URL}/models`)
5. Run backend:
   npm run dev
Backend runs on:
http://localhost:8001

### 2) Frontend Setup
1. Go to frontend directory:
   cd frontend
2. Install dependencies:
   npm install
3. Run frontend:
   npm run dev
Frontend runs on:
http://localhost:5173

## Environment Notes
- The app uses cookie-based auth (`accessToken`, `refreshToken` as httpOnly cookies).
- Axios requests are made with `withCredentials: true`.
- Backend CORS allows localhost frontend in development; for deployment, update backend CORS origins as needed.

## Backend API Endpoints (Main Ones)
Auth:
- POST `/api/auth/signup`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/profile` (protected)
Blogs:
- GET `/api/blogs`
- GET `/api/blogs/:id`
- GET `/api/blogs/getMyBlogs` (protected)
- POST `/api/blogs` (protected)
- PUT `/api/blogs/:id` (protected)
- DELETE `/api/blogs/:id` (protected)
Resources:
- GET `/api/resources`
- GET `/api/resources/my` (protected)
- POST `/api/resources/upload` (protected)
  - For hackathon mode: send a shareable Drive link using `fileUrl` (multipart upload is optional if you’re not sending `file`)
- DELETE `/api/resources/:id` (protected)
AI Summarizer:
- POST `/api/ai/summarize` (protected)
  - Expects multipart form-data with `file` and `application/pdf`

## How to Demo (Fast)
Open the frontend UI:
1. Login
2. AI: Go to AI PDF Summarizer, upload a PDF, click Generate Summary, verify structured output appears.
3. Blogs: Create a blog post, verify it appears in the feed.
4. Resources: Use Upload Resource, paste a public Drive link, submit, then verify the resource appears in Resources feed and is downloadable via the link.

## Security & Privacy (Hackathon Friendly)
- Do not commit `backend/.env` to GitHub. Use `backend/.env.example`.
- Auth tokens are httpOnly cookies and refresh tokens are stored in Redis.
- Sensitive keys should stay on the server environment.

## Additional Notes
- Blog card UI reads cover/excerpt/tags from the stored blog content format so the UI remains consistent with the deployed look and feel.
- AI summarization uses PDF text extraction from uploaded file buffer.
