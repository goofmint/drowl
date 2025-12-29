# drowl Landing Page

The marketing landing page for drowl, built with [Astro](https://astro.build/).

## Responsibilities

The Landing page serves as the **marketing site** for drowl and provides:

- **Product Information**: Feature highlights, use cases, benefits
- **Getting Started**: Quick start guides, installation instructions
- **Documentation Links**: Links to full documentation, API reference
- **Pricing**: Pricing tiers (for SaaS offering)
- **Blog**: DevRel insights, product updates, case studies
- **Community**: Links to GitHub, Discord, Twitter

## Technology Stack

- **Framework**: Astro 4 (static site generator)
- **Styling**: Inline CSS / CSS Modules / Tailwind (TBD)
- **Deployment**: Cloudflare Pages / Vercel / Netlify
- **Performance**: Optimized for Core Web Vitals, minimal JavaScript

## Why Astro?

- **Zero JS by default**: Fast page loads, great SEO
- **Island Architecture**: Hydrate only interactive components
- **Markdown Support**: Easy content management for blog
- **Component Framework Agnostic**: Can use React, Vue, Svelte if needed

## Development

### Start Development Server

```bash
# From repository root
pnpm dev:landing

# Or from this directory
pnpm dev
```

The landing page will start on http://localhost:4321 with hot reload.

## Page Structure

```
src/
├── pages/
│   ├── index.astro          # Homepage
│   ├── features.astro       # Features overview
│   ├── pricing.astro        # Pricing tiers
│   ├── docs.astro           # Documentation landing
│   └── blog/
│       ├── index.astro      # Blog index
│       └── [slug].astro     # Blog post template
├── components/
│   ├── Header.astro         # Site header
│   ├── Footer.astro         # Site footer
│   ├── FeatureCard.astro    # Feature highlight card
│   └── PricingCard.astro    # Pricing tier card
└── layouts/
    ├── BaseLayout.astro     # Base HTML layout
    └── BlogLayout.astro     # Blog post layout
```

## Content Management

Astro supports Markdown and MDX for content:

```markdown
---
title: "Measuring DevRel ROI with drowl"
date: 2024-01-15
author: "Your Name"
---

# Measuring DevRel ROI with drowl

DevRel activities can be hard to quantify...
```

## SEO

The landing page includes SEO optimizations:

- **Meta Tags**: Title, description, Open Graph, Twitter Cards
- **Sitemap**: Automatically generated
- **Robots.txt**: Search engine instructions
- **Structured Data**: Schema.org markup for rich snippets

## Performance

Astro's static output ensures:

- **Fast TTI**: Time to Interactive < 1s
- **Small Bundles**: Minimal JavaScript shipped
- **CDN-Ready**: Static files deployed to edge network
- **Perfect Lighthouse Scores**: 100 in all categories (goal)

## Building for Production

```bash
pnpm build        # Builds static site to dist/
pnpm preview      # Preview production build
```

## Deployment

### Cloudflare Pages

```bash
# Build command
pnpm build

# Output directory
dist
```

### Vercel

```bash
# Framework preset: Astro
# Build command: pnpm build
# Output directory: dist
```

### Netlify

```bash
# Build command: pnpm build
# Publish directory: dist
```

## Content Updates

To add a new blog post:

1. Create `src/pages/blog/new-post.md`
2. Add frontmatter (title, date, author)
3. Write content in Markdown
4. Commit and deploy

## Code Quality

```bash
pnpm typecheck    # Astro check (TypeScript in .astro files)
pnpm lint         # ESLint
pnpm lint:fix     # Auto-fix linting issues
```

## Related Documentation

- [UI (Product Dashboard)](../ui/README.md)
- [API Documentation](../api/README.md)
- [Main README](../../README.md)
