# Dashboard Monitor Tender - Frontend

Dashboard admin untuk mengelola tender dengan fitur lengkap management events, users, milestones, dan progress reports.

## Features

✅ **Authentication**
- Login/Logout
- Role-based access control (Admin, Supervisor, Petugas)
- JWT token management

✅ **Dashboard**
- Statistics overview
- Events by status
- Recent activities
- Events summary with progress

✅ **Events Management**
- CRUD operations for events
- Event detail with milestones
- Assign petugas to events
- Progress tracking

✅ **Users Management**
- CRUD operations for users
- Role management (Admin, Supervisor, Petugas)
- Activate/Deactivate users

✅ **UI Components**
- Responsive design
- Modern UI with Tailwind CSS
- Reusable components (Cards, Tables, Forms, Modals, Badges)
- Loading states and error handling

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Date Formatting**: date-fns
- **Charts**: Recharts

## Getting Started

### 1. Install Dependencies

```bash
cd dashboard-monitor
npm install
```

### 2. Environment Setup

File `.env.local` sudah dibuat dengan konfigurasi:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Sesuaikan URL API jika backend berjalan di port yang berbeda.

### 3. Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
npm start
```

## Default Login Credentials

Sesuai dengan API documentation:

```
Username: admin
Password: password123
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/          # Dashboard pages
│   │   ├── events/         # Events management
│   │   ├── users/          # Users management
│   │   └── page.tsx        # Dashboard home
│   ├── login/              # Login page
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home (redirect)
├── components/             # Reusable components
│   ├── ui/                 # UI components
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Table.tsx
│   └── layout/             # Layout components
│       ├── Navbar.tsx
│       └── Sidebar.tsx
├── context/                # React Context
│   └── AuthContext.tsx     # Authentication context
├── lib/                    # Libraries & utilities
│   └── api.ts              # Axios instance
└── types/                  # TypeScript types
    └── index.ts            # Type definitions
```

## Available Pages

### Public Routes
- `/` - Home (auto redirect)
- `/login` - Login page

### Protected Routes (Admin/Supervisor)
- `/dashboard` - Dashboard overview
- `/dashboard/events` - Events list
- `/dashboard/events/create` - Create new event
- `/dashboard/events/[id]` - Event details
- `/dashboard/events/[id]/edit` - Edit event
- `/dashboard/users` - Users management (Admin only)

## API Endpoints Used

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/events-summary` - Events summary
- `GET /api/dashboard/recent-activities` - Recent activities

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/:id/milestones` - Get milestones
- `GET /api/events/:id/petugas` - Get assigned petugas
- `GET /api/events/:id/progress` - Get progress reports

### Users
- `GET /api/users` - Get all users (with filters)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/status` - Toggle user status

## Features by Role

### Admin
- Full access to all features
- Manage users (CRUD)
- Manage events (CRUD)
- View all statistics
- Assign petugas to events

### Supervisor
- View dashboard statistics
- View all events
- View progress reports
- Cannot manage users

### Petugas
- View assigned events only
- Create progress reports
- View own progress reports

## Customization

### Changing API URL

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-api-url.com/api
```

### Adding New Pages

1. Create new page in `src/app/dashboard/`
2. Add route to sidebar in `src/components/layout/Sidebar.tsx`
3. Add required API calls in the page component

### Styling

The project uses Tailwind CSS. You can customize:
- Colors in component files
- Global styles in `src/app/globals.css`
- Component variants in UI components

## Troubleshooting

### CORS Errors
Make sure your backend API allows requests from `http://localhost:3000`

### 401 Unauthorized
- Check if token is valid
- Try logging in again
- Check API URL in `.env.local`

### Build Errors
```bash
rm -rf .next node_modules
npm install
npm run dev
```

## Support

Untuk pertanyaan atau issue, silakan buat issue di repository.
