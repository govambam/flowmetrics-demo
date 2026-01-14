# TaskFlow

A clean, modern task management app for teams to track their work.

## Features

- **Add tasks** - Create new tasks with a simple form
- **Mark complete** - Toggle task completion with a checkbox
- **Delete tasks** - Remove tasks you no longer need
- **Filter tasks** - View All, Active, or Completed tasks
- **Persistent storage** - Tasks saved to localStorage
- **Task count** - See how many active tasks remain

## Tech Stack

- **Next.js 14** (App Router)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **localStorage** for data persistence

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd taskflow

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Project Structure

```
taskflow/
├── app/
│   ├── globals.css     # Global styles and Tailwind
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main TaskFlow component
├── types/
│   └── task.ts         # TypeScript interfaces
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Usage

1. **Add a task** - Type in the input field and press Enter or click "Add Task"
2. **Complete a task** - Click the checkbox to mark as done
3. **Delete a task** - Hover over a task and click the trash icon
4. **Filter tasks** - Use the All/Active/Completed tabs

## Data Persistence

Tasks are stored in your browser's localStorage. They persist across page refreshes and browser sessions. To clear all data, open browser DevTools and clear localStorage.

## License

MIT
