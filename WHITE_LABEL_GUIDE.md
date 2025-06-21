# n8n White Labeling Guide

This guide explains how to customize n8n for white labeling to match your brand identity.

## Overview

n8n supports extensive customization through its design system. You can modify:
- Logos and branding elements
- Color schemes and themes
- Typography
- UI components
- Email templates
- Static assets

## Quick Start

### 1. Logo Customization

Replace the default n8n logos with your brand:

**Files to modify:**
- `packages/frontend/editor-ui/src/components/Logo/logo-icon.svg` - Main logo icon
- `packages/frontend/editor-ui/src/components/Logo/logo-text.svg` - Brand text/name

**Example logo-icon.svg:**
```svg
<svg xmlns='http://www.w3.org/2000/svg' width="32" height="30">
  <path fill="#YOUR_BRAND_COLOR" d="YOUR_LOGO_PATH_DATA" />
</svg>
```

### 2. Color Theme Customization

Modify the brand colors in `packages/frontend/@n8n/design-system/src/css/_custom-brand.scss`:

```scss
:root {
  // Primary brand colors
  --prim-color-primary-h: 210; // Your brand hue (0-360)
  --prim-color-primary-s: 80%; // Saturation
  --prim-color-primary-l: 50%; // Lightness

  // Secondary colors
  --prim-color-secondary: #YOUR_SECONDARY_COLOR;

  // Status colors
  --prim-color-alt-a: #YOUR_SUCCESS_COLOR; // Success (green)
  --prim-color-alt-b: #YOUR_WARNING_COLOR; // Warning (orange)
  --prim-color-alt-c: #YOUR_DANGER_COLOR;  // Danger (red)
}
```

### 3. Build and Deploy

After making changes, rebuild the design system:

```bash
cd packages/frontend/@n8n/design-system
pnpm build:theme
```

Then rebuild the entire application:

```bash
pnpm build
```

## Detailed Customization

### Logo Components

The Logo component (`packages/frontend/editor-ui/src/components/Logo/Logo.vue`) handles:
- Dynamic favicon generation from logo SVG
- Different logo sizes for different contexts (sidebar, auth view)
- Release channel color variations

### Color System

The design system uses CSS custom properties for theming:

**Primary Colors:**
- `--color-primary`: Main brand color
- `--color-primary-shade-1`: Darker variant
- `--color-primary-tint-1/2/3`: Lighter variants

**Semantic Colors:**
- `--color-success`: Success states
- `--color-warning`: Warning states
- `--color-danger`: Error states

### Email Templates

Update email templates in `packages/cli/src/user-management/email/templates/`:
- `_logo.mjml` - Email logo
- `user-invited.mjml` - User invitation emails
- Other template files as needed

### Static Assets

Replace static assets:
- Favicon files
- OAuth callback logos
- Form template logos

## Advanced Customization

### Custom CSS Classes

Add custom styling in `_custom-brand.scss`:

```scss
.custom-brand {
  &.sidebar {
    background-color: var(--brand-background-color);
  }

  &.header {
    // Custom header styling
  }
}

.n8n-button {
  &.primary {
    background-color: var(--prim-color-primary);

    &:hover {
      background-color: var(--prim-color-primary-shade-100);
    }
  }
}
```

### Component Overrides

Override specific component styling by targeting their CSS classes:
- `.n8n-node-icon` - Node icons
- `.n8n-button` - Buttons
- `.n8n-input` - Input fields
- `.n8n-card` - Cards

### Environment Variables

Some branding can be controlled via environment variables:
- Custom domain references
- API endpoints
- Feature flags

## File Structure

```
packages/frontend/@n8n/design-system/
├── src/
│   ├── css/
│   │   ├── _tokens.scss          # Main color tokens
│   │   ├── _custom-brand.scss    # Your custom brand overrides
│   │   └── index.scss            # Main CSS entry point
│   └── components/
│       └── Logo/
│           ├── logo-icon.svg     # Replace with your logo
│           └── logo-text.svg     # Replace with your brand text
```

## Testing Your Changes

1. Start the development server:
   ```bash
   pnpm start
   ```

2. Check the following areas:
   - Login/signup pages (logo visibility)
   - Main sidebar (collapsed/expanded logo)
   - Button colors and hover states
   - Success/warning/error messages
   - Email templates (if configured)

## Production Deployment

1. Build the complete application:
   ```bash
   pnpm build
   ```

2. Deploy using your preferred method (Docker, npm, etc.)

3. Verify all branding elements appear correctly in production

## Troubleshooting

**Logo not updating:**
- Clear browser cache
- Rebuild design system: `pnpm build:theme`
- Check SVG syntax is valid

**Colors not applying:**
- Ensure CSS custom properties are properly defined
- Check import order in `index.scss`
- Verify SCSS syntax

**Build errors:**
- Check all file paths are correct
- Ensure SVG files are valid
- Verify SCSS syntax

## Best Practices

1. **Backup originals**: Keep copies of original files before modification
2. **Use version control**: Track all changes with git
3. **Test thoroughly**: Check all UI states and components
4. **Optimize assets**: Compress SVG files and optimize colors
5. **Document changes**: Keep track of all customizations made

## Support

For issues with white labeling:
1. Check the n8n community forum
2. Review the design system documentation
3. Test changes in development before production deployment

---

*Last updated: $(date)*
