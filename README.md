# Hachlamti

A content-driven platform that publishes recovery stories and connects them to therapists.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript (strict mode)
- MongoDB Atlas + Mongoose
- SCSS Modules
- React Hook Form + Zod
- NextAuth (admin only)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (for database)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory with:

```env
# MongoDB Atlas Connection
MONGODB_URI=your_mongodb_atlas_connection_string_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Admin Credentials (MVP)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password_here
```

**For Vercel deployment:** Add all environment variables in your Vercel project settings under Environment Variables.

**Note:** Generate a secure `NEXTAUTH_SECRET` using: `openssl rand -base64 32`

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

## Project Structure

```
/app              # Next.js App Router pages and layouts
/lib              # Utility functions and database connection
/models           # Mongoose models
/styles           # Global SCSS files (variables, globals)
```

## Deployment

This project is configured for Vercel deployment. Connect your repository to Vercel for automatic deployments.

