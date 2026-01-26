# Gifting Marketplace

A custom Shopify theme for Gifting, a Mexican marketplace connecting gift-givers with local entrepreneurs. Built with a distinctive paper collage aesthetic.

## Features

- **Collage Design System**: Paper textures, tape effects, polaroid frames, stickers, and handwritten elements
- **Editorial About Page**: Magazine-style layout with asymmetric grids and bold typography
- **Custom Sections**: Hero, product cards, entrepreneur showcase, occasions, FAQs, and more
- **Spanish Localization**: Fully translated for Mexican Spanish
- **Mobile-First**: Responsive design with mobile menu and cart drawer

## Theme Structure

```
gifting_liquid/
├── assets/           # CSS, JS, and images
│   ├── base.css            # Core styles and CSS variables
│   ├── collage.css         # Collage design system styles
│   ├── component-card.css  # Component and section styles
│   ├── global.js           # Cart, menu, and UI interactions
│   └── collage-effects.js  # Paper/sticker animations
├── config/           # Theme settings
│   ├── settings_schema.json  # Theme customizer schema
│   └── settings_data.json    # Current settings values
├── layout/
│   └── theme.liquid  # Main layout template
├── locales/
│   └── es.default.json  # Spanish translations
├── sections/         # Shopify sections (21 total)
│   ├── hero.liquid
│   ├── featured-products.liquid
│   ├── how-it-works.liquid
│   ├── why-gifting.liquid
│   ├── categories.liquid
│   ├── occasions.liquid
│   ├── entrepreneurs.liquid
│   ├── newsletter.liquid
│   ├── page-about.liquid
│   ├── page-faqs.liquid
│   ├── page-contact.liquid
│   ├── page-sell-with-us.liquid
│   └── ...
├── snippets/         # Reusable components (44 total)
│   ├── product-card.liquid
│   ├── cart-drawer.liquid
│   ├── newsletter-popup.liquid
│   └── icon-*.liquid (35 SVG icons)
└── templates/        # Page templates (JSON)
    ├── index.json
    ├── product.json
    ├── collection.json
    ├── cart.json
    ├── page.about.json
    ├── page.faqs.json
    ├── page.contact.json
    └── ...
```

## Design System

### Colors

| Color | Variable | Hex |
|-------|----------|-----|
| Primary (Terracotta) | `--color-primary` | `#ac5134` |
| Secondary (Coral) | `--color-secondary` | `#ac5b3c` |
| Accent (Dusty Pink) | `--color-accent` | `#dcae9c` |
| Navy | `--color-navy` | `#3c4c6c` |
| Brown | `--color-brown` | `#713c27` |
| Background | `--color-background` | `#faf8f5` |

### Typography

- **Headings**: Playfair Display (serif)
- **Body**: Work Sans (sans-serif)
- **Accent**: Pacifico (handwritten)

### Collage Elements

CSS classes for the paper/collage aesthetic:

```css
.collage-paper         /* Paper card with shadow */
.collage-polaroid      /* Polaroid photo frame */
.collage-photo--tape   /* Photo with tape corners */
.collage-photo--pin    /* Photo with pin */
.collage-sticker       /* Sticker badge effect */
.collage-element--tape /* Decorative tape strip */
```

## Development

### Prerequisites

- [Shopify CLI](https://shopify.dev/docs/themes/tools/cli) (v3+)
- A Shopify development store

### Local Development

```bash
# Start the development server
shopify theme dev --store YOUR-STORE.myshopify.com

# Preview at http://127.0.0.1:9292
```

### Deployment

```bash
# Push to connected theme
shopify theme push

# Push to a new theme
shopify theme push --unpublished
```

## Customization

Access theme settings in **Online Store > Themes > Customize**:

- **Brand Colors**: Primary, secondary, accent colors
- **Typography**: Heading, body, and accent fonts
- **Logo & Branding**: Logo image and favicon
- **Social Media**: Instagram, Facebook, TikTok, WhatsApp
- **Shipping**: Free shipping threshold and costs
- **Collage Style**: Toggle decorative elements on/off

## Pages

| Page | Template | URL |
|------|----------|-----|
| Home | `index.json` | `/` |
| About | `page.about.json` | `/pages/nosotros` |
| FAQs | `page.faqs.json` | `/pages/faqs` |
| Contact | `page.contact.json` | `/pages/contact` |
| Sell With Us | `page.sell-with-us.json` | `/pages/sell-with-us` |

## Author

**DigiHoriz**
[digihoriz.com](https://digihoriz.com)

## License

Proprietary - All rights reserved.
