# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ryan Cruz's personal website (ryancruz.com) - An aviation-themed portfolio site built with Next.js 15, TypeScript, and Tailwind CSS 4.

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Package Manager**: Bun
- **Deployment**: Cloudflare Workers via OpenNext adapter

## Build Commands

```bash
# Development
bun run dev          # Start development server (http://localhost:3000)

# Build & Deploy
bun run build        # Build Next.js app
bun run build:worker # Build for Cloudflare Workers
bun run preview      # Preview Worker locally
bun run deploy       # Deploy to Cloudflare

# Other
bun run lint         # Run ESLint
bun test            # Run tests (when configured)
```

## Project Structure

- `/app` - Next.js App Router pages and layouts
- `/components` - React components (aviation-themed UI)
- `/public` - Static assets (fonts, images, icons)
- `tailwind.config.ts` - Tailwind configuration with aviation design tokens
- `wrangler.toml` - Cloudflare Workers configuration
- `open-next.config.ts` - OpenNext adapter configuration

## Design System

Aviation/airport theme with:
- Frutiger-style typography (Inter/DM Sans fallbacks)
- Airport signage color palette (black, yellow #FFB612, white)
- Departure board animations
- Boarding pass and luggage tag components
- Airport wayfinding iconography

## User Preferences (from global CLAUDE.md)

- Run "bun run build" without permission when applicable
- Never create files unless absolutely necessary
- Always prefer editing existing files over creating new ones
- Never proactively create documentation files unless explicitly requested