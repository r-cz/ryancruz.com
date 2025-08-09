# ryancruz.com

Ryan Cruz's personal website - An aviation-themed portfolio site showcasing professional experience and technical expertise.

## 🛫 Overview

A modern, aviation-inspired personal website built with Vite and TypeScript, featuring authentic airport design elements including a real KDAL airport diagram background and DOT transportation symbols throughout.

## ✈️ Features

- **Aviation-themed design system** with airport signage aesthetics
- **Real KDAL airport diagram background** with gradient overlay
- **Authentic DOT transportation symbols** for wayfinding
- **Responsive design** optimized for all devices
- **Modern CSS custom properties** for theming
- **Clean, minimal interface** with professional focus

## 🛠 Tech Stack

- **Build Tool**: Vite 6
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Package Manager**: Bun
- **Testing**: Bun Test with jsdom
- **Deployment**: Cloudflare Workers

## 🚀 Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Run tests
bun test

# Run tests with coverage
bun test --coverage

# Type checking
bun run typecheck

# Linting
bun run lint
```

Open [http://localhost:5173](http://localhost:5173) to view the site locally.

## 🎨 Design System

The site features an aviation/airport theme with:
- Clean typography optimized for readability
- Airport signage color palette (black, yellow #FFB612, white)
- Real KDAL airport diagram as background
- CSS custom properties for theming
- Airport wayfinding iconography from DOT transportation symbols

## 📁 Project Structure

```
├── src/                 # Source code
│   ├── main.ts         # Main application entry point
│   ├── style.css       # Global styles and CSS variables
│   ├── worker.ts       # Cloudflare Worker for deployment
│   └── main.test.ts    # Test files
├── public/
│   ├── icons/          # DOT transportation symbols (50+ icons)
│   ├── images/         # Profile and company assets
│   └── kdal.svg        # KDAL airport diagram background
├── bunfig.toml         # Bun configuration
├── wrangler.toml       # Cloudflare Workers configuration
└── vite.config.ts      # Vite build configuration
```

## 🧪 Testing

The project uses Bun's native test runner with jsdom for DOM testing:
- Test setup in `test-setup.ts` configures jsdom environment
- Tests located in `src/main.test.ts`
- Coverage reports generated in `coverage/` directory

## 🌐 Deployment

The site deploys to Cloudflare Workers providing:
- Global edge distribution
- Fast cold starts
- Cost-effective hosting
- Custom domain support

## 📄 License

© 2025 Ryan Cruz. All rights reserved.
