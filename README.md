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

### Installation

```bash
npm install
```

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

