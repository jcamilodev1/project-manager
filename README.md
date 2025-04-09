# Grayola App

A modern web application with authentication and a clean, responsive UI using ShadCN UI and Tailwind CSS.

## Features

- Clean and modern UI using ShadCN UI and Tailwind CSS
- Light and dark mode support
- User authentication with Supabase
- Responsive design for all device sizes

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/grayola-app.git
cd grayola-app
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

Copy the `.env.local.example` file to `.env.local` and update the values with your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your Supabase credentials from your Supabase project dashboard.

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication

This project uses Supabase for authentication. The login and registration flows are set up and ready to use.

To enable authentication:

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Enable Email/Password authentication in Authentication > Providers
3. Update your environment variables with your Supabase credentials

## Customization

- Theme colors can be adjusted in `src/app/globals.css`
- Components are in `src/components/ui`
- Page layouts are in `src/app` directory

## Deployment

This is a Next.js project that can be deployed to Vercel, Netlify, or any other platform that supports Next.js.

For more information on deployment, see the [Next.js deployment documentation](https://nextjs.org/docs/deployment).

## License

This project is licensed under the MIT License.
