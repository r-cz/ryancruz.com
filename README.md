# ryancruz.com

Ryan Cruz's personal website - An aviation-themed portfolio site showcasing professional experience and technical expertise.

## 🛫 Overview

A modern, aviation-inspired personal website built with Bun and TypeScript, deployed on Cloudflare Workers. Features authentic airport design elements including a real KDAL airport diagram background.

## ✈️ Features

- **Aviation-themed design system** with airport signage aesthetics
- **Real KDAL airport diagram background** with gradient overlay
- **Authentic DOT transportation symbols** for wayfinding
- **Responsive design** optimized for all devices
- **Modern CSS custom properties** for theming
- **Clean, minimal interface** with professional focus

## 🛠 Tech Stack

- **Build Tool**: Bun + Custom Build Script
- **Deployment**: Cloudflare Workers with Static Assets
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Package Manager**: Bun
- **Testing**: Bun Test with jsdom
- **Deployment**: Cloudflare Workers

## 🚀 Getting Started

```bash
# Install dependencies
bun install

# Start development server with hot reloading
bun run dev

# Build for production
bun run build

# Watch and rebuild on changes
bun run build:watch

# Run tests
bun test

# Type checking
bun run typecheck

# Linting
bun run lint

# Deploy to Cloudflare Workers
bun run deploy
```

The development server will start on port 8787 with automatic rebuilding when you save files.

## 🎨 Design System

The site features an aviation/airport theme with:

- Clean typography optimized for readability
- Airport signage color palette (black, yellow #FFB612, white)
- Real KDAL airport diagram as background
- CSS custom properties for theming
- Airport wayfinding iconography from DOT transportation symbols

## 📁 Project Structure

```text
├── src/                 # Source code
│   ├── main.ts         # Main application entry point
│   ├── style.css       # Global styles and CSS variables
│   └── main.test.ts    # Test files
├── public/
│   ├── icons/          # DOT transportation symbols (50+ icons)
│   ├── images/         # Profile and company assets
│   └── kdal.svg        # KDAL airport diagram background
├── build.ts            # Custom build script
├── bunfig.toml         # Bun configuration
├── wrangler.toml       # Cloudflare Workers configuration
└── tailwind.config.ts  # Tailwind CSS configuration
```

## 🧪 Testing

The project uses Bun's native test runner with jsdom for DOM testing:

- Test setup in `test-setup.ts` configures jsdom environment
- Tests located in `src/main.test.ts`
- Coverage reports generated in `coverage/` directory

## 🌐 Deployment

The site deploys to Cloudflare Workers with static assets providing:

- Global edge distribution
- Automatic static file serving
- Cost-effective hosting (static assets are free)
- Custom domain support
- No custom worker code needed

## 📄 License

© 2025 Ryan Cruz. All rights reserved.
