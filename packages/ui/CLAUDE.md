# @repo/ui

## Boundaries

**CRITICAL - READ BEFORE ANY EDIT:**
- ONLY edit files within `packages/ui/`
- NEVER edit: root configs, `apps/*`, other `packages/*`
- You may import from: `@repo/utils`
- You may NOT modify packages you import from

## Purpose

Shared UI component library using shadcn/ui patterns with Tailwind CSS v4. Components are "dumb" (presentational only) - no business logic or data fetching.

## Key Files

- `src/index.ts` - Public exports
- `src/components/` - UI components
- `src/components/button.tsx` - Button with variants (CVA)
- `src/components/card.tsx` - Card container
- `src/components/input.tsx` - Form input
- `src/lib/utils.ts` - `cn()` utility for className merging
- `src/styles.css` - Tailwind v4 imports
- `tailwind.config.ts` - Shared Tailwind configuration

## Patterns

**Tailwind v4 setup:**
```css
/* src/styles.css */
@import "tailwindcss";
```

**cn() utility for class merging:**
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Component variants with CVA:**
```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva('inline-flex items-center...', {
  variants: {
    variant: { default: '...', outline: '...' },
    size: { default: '...', sm: '...', lg: '...' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});
```

**Dumb component pattern:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
```

## Commands

- `bun run typecheck` - Type check this package
- `bun run test` - Run tests in watch mode
- `bun run test:run` - Run tests once

## Testing

Tests in `src/__tests__/`. Uses Vitest with `happy-dom` and `@testing-library/react`. Setup in `vitest.setup.ts`.
