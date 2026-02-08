# MenuX Admin Login System

This project implements a complete admin login system with Spring Boot backend and Next.js frontend.

## Features
- Admin authentication with username/password
- Session management using Zustand
- Protected dashboard routes
- Logout functionality
- Database integration with PostgreSQL

## Setup Instructions

### Backend (Spring Boot)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build and run the application:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

3. The backend will start on `http://localhost:8080`

### Frontend (Next.js)
1. Navigate to the frontend directory:
   ```bash
   cd menux-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The frontend will start on `http://localhost:3000`

## Default Admin Credentials
- Username: `admin`
- Password: `password`

## Project Structure
```
MenuX/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/com/menux/backend/
│   │   ├── entity/         # Database entities
│   │   ├── repository/     # Data access layer
│   │   ├── service/        # Business logic
│   │   └── controller/     # REST API endpoints
│   └── src/main/resources/ # Configuration files
└── menux-frontend/         # Next.js frontend
    ├── src/app/            # Next.js App Router pages
    ├── src/components/     # React components
    ├── src/store/          # Zustand state management
    └── src/app/api/        # API routes
```

## API Endpoints
- `POST /api/admin/login` - Admin login endpoint
- `GET /` - Redirects to login or dashboard based on authentication

## Database
- Uses PostgreSQL
- Auto-creates admin table and inserts default admin user on first startup
- Default admin credentials are stored in `backend/scripts/create-admin.sql`

## Technologies Used
- **Backend**: Spring Boot, Spring Security, JPA, PostgreSQL
- **Frontend**: Next.js, React, TypeScript, Zustand, Tailwind CSS
- **Database**: PostgreSQL