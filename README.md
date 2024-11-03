# Apparel Measurement System

A web-based system for capturing and tracking body measurements using image processing and machine learning.

## Features
- User authentication
- Image-based measurement capture
- Measurement tracking and history
- Goal setting and tracking
- Analytics and progress visualization
- Social sharing capabilities

## Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL
- TypeScript

### Installation

1. Clone the repository:

```bash
git clone [your-repo-url]
```

2. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Set up environment variables:
```bash
# Create .env file in backend directory
cp .env.example .env
```

4. Initialize database:
```bash
# Run MySQL migrations
npm run migrate
```

5. Start the servers:
```bash
# Backend
npm run dev

# Frontend
npm start
```

## Tech Stack
- Frontend: React, TypeScript, Chart.js
- Backend: Node.js, Express, TypeScript
- Database: MySQL, Sequelize
- ML: TensorFlow.js