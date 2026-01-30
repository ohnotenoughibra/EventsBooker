# Roots Collective Events

A modern, full-stack event booking system for gyms and training centers. Built with Next.js 14, Supabase, and shadcn/ui.

## Features

### For Members
- Sign up and login (email/password or magic link)
- Browse upcoming events and seminars
- Book events with automatic spot tracking
- SEPA QR code payment (EPC format) for easy bank transfers
- View booking history and payment status
- Dark/light mode support
- Mobile-responsive design

### For Admins
- Full event management (CRUD)
- Attendee tracking and management
- Bulk mark attendance (for door check-in)
- Toggle payment status
- Export attendees to CSV
- Dashboard with overview statistics

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Payment**: SEPA/EPC QR codes for bank transfers
- **Validation**: Zod
- **Forms**: React Hook Form

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase account (free tier works)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd roots-collective-events
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned
3. Go to **Settings > API** and copy:
   - Project URL
   - anon/public key

### 3. Configure Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Payment Configuration - SEPA Bank Transfer Details
NEXT_PUBLIC_PAYMENT_IBAN=AT12 3456 7890 1234 5678
NEXT_PUBLIC_PAYMENT_BIC=BKAUATWW
NEXT_PUBLIC_PAYMENT_CREDITOR_NAME=Roots Collective
NEXT_PUBLIC_PAYMENT_CREDITOR_ADDRESS=Musterstraße 1, 1010 Wien

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Database

1. Go to Supabase Dashboard > SQL Editor
2. Copy the contents of `supabase/migrations/00001_initial_schema.sql`
3. Paste and run it in the SQL Editor

This creates:
- `profiles` table (extends auth.users with is_admin)
- `events` table
- `bookings` table
- Row Level Security policies
- Necessary triggers and functions

### 5. Configure Supabase Auth

1. Go to **Authentication > Providers**
2. Make sure Email is enabled
3. Configure email templates if desired
4. (Optional) Enable email confirmations in **Authentication > Settings**

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Making Your First Admin User

1. Sign up through the app at `/signup`
2. Go to Supabase Dashboard > SQL Editor
3. Run the following (replace with your email):

```sql
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'your-email@example.com';
```

4. Refresh the app - you should now see the Admin link in the navigation

## Project Structure

```
├── app/
│   ├── (auth)/           # Auth pages (login, signup)
│   ├── (dashboard)/      # User dashboard pages
│   ├── admin/            # Admin pages
│   ├── auth/callback/    # Auth callback handler
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── admin/            # Admin-specific components
│   ├── bookings/         # Booking components
│   └── events/           # Event components
├── lib/
│   ├── supabase/         # Supabase clients
│   ├── epc-qr.ts         # SEPA QR code generator
│   ├── utils.ts          # Utility functions
│   └── validations.ts    # Zod schemas
├── types/
│   └── database.ts       # TypeScript types
└── supabase/
    └── migrations/       # SQL migrations
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

The app will automatically build and deploy.

### Production Checklist

- [ ] Update payment details in environment variables
- [ ] Configure proper email templates in Supabase
- [ ] Enable email confirmations if desired
- [ ] Create your admin account
- [ ] Test the full booking flow
- [ ] Test SEPA QR codes with your banking app

## Payment Flow

This app uses manual bank transfers (SEPA) instead of payment gateways:

1. User books an event
2. App generates a unique payment reference (e.g., ROOT-2025-0047)
3. User sees IBAN, amount, and SEPA QR code
4. User pays via bank transfer using their banking app
5. Admin manually marks payment as received in admin panel

The SEPA/EPC QR code follows the European Payments Council standard and works with most banking apps in Austria, Germany, and other SEPA countries.

## Customization

### Changing Colors

Edit `app/globals.css` to modify the theme colors. The default theme uses a green accent color suitable for a gym/fitness brand.

### Adding More Features

The codebase is structured to be easily extensible:
- Add new pages in the appropriate route group
- Create components in the `components/` directory
- Add new database tables with RLS policies
- Update types in `types/database.ts`

## Support

For issues and feature requests, please open a GitHub issue.

## License

MIT License - feel free to use this for your own gym or training center!
