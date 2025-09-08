# Tubi Submissions Router

A Next.js application that routes content submissions to the appropriate Tubi channels - either Tubi Originals for development projects or RFD (Request for Distribution) for completed content.

## What it does

This application provides a streamlined submission flow that:
- Routes users to Tubi Originals Portal for ideas, pitches, treatments, or works-in-progress
- Handles RFD submissions for completed films/series through an integrated form
- Sends email notifications for RFD submissions via Resend API
- Provides FAQ section for common submission questions

## Local Development

1. Install dependencies:
   ```bash
   npm i
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

- `RESEND_API_KEY` - Your Resend API key for sending emails
- `EMAIL_FROM` - Email address to send from (default: onboarding@resend.dev)
- `RFD_NOTIFY_TO` - Email address to receive RFD submission notifications

See `.env.example` for the complete list.

## Deployment

This app is designed for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel Dashboard (Production environment):
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - `RFD_NOTIFY_TO`
3. Deploy or redeploy to Production

### API Endpoints

- `GET /api/ping` - Health check endpoint
- `POST /api/rfd-intake` - Handles RFD form submissions

## Security Notes

- No file uploads are supported - submissions use external links only
- Email submissions are handled server-side only
- Environment variables are required for email functionality
- All sensitive data is handled via environment variables

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## License

[License information to be added]