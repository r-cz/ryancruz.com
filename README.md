# ryancruz.com

Ryan Cruz's personal website - An aviation-themed portfolio site showcasing professional experience and technical expertise.

## 🛫 Overview

A modern, aviation-inspired personal website built with Next.js 15, featuring airport-style design elements including boarding passes for work experience, luggage tags for education, and authentic DOT transportation symbols throughout.

## ✈️ Features

- **Aviation-themed design system** with airport signage aesthetics
- **Boarding pass work experience cards** with company logos
- **Luggage tag education credentials** 
- **Departure board animations** with flip-card effects
- **Authentic DOT transportation symbols** for wayfinding
- **Responsive design** optimized for all devices
- **Dark/light mode support** for Apple logo

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Package Manager**: Bun
- **Deployment**: Cloudflare Workers via OpenNext adapter

## 🚀 Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Build for Cloudflare Workers
bun run build:worker

# Deploy to Cloudflare
bun run deploy
```

Open [http://localhost:3000](http://localhost:3000) to view the site locally.

## 🎨 Design System

The site uses an aviation/airport theme with:
- Frutiger-style typography (with Inter/DM Sans fallbacks)
- Airport signage color palette (black, yellow #FFB612, white)
- Departure board flip animations
- Boarding pass and luggage tag components
- Airport wayfinding iconography from DOT transportation symbols

## 📁 Project Structure

```
├── app/                 # Next.js App Router pages
├── components/          # React components (aviation-themed)
├── public/
│   ├── icons/          # DOT transportation symbols
│   └── images/         # Company logos and assets
├── wrangler.toml       # Cloudflare Workers configuration
└── open-next.config.ts # OpenNext adapter configuration
```

## 🌐 Deployment

The site is configured for deployment to Cloudflare Workers using the OpenNext adapter. This provides:
- Global edge distribution
- Fast cold starts
- Cost-effective hosting
- Custom domain support

## 📄 License

© 2025 Ryan Cruz. All rights reserved.
