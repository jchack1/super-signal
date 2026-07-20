import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * A beveled surface — the core vintage/2000s chrome cue. `raised` catches light
 * from the top-left (buttons, panels, title bar); `inset` reverses it for sunken
 * fields (the address bar, the message input). The two-tone border does the work,
 * using the `--bevel-hi` / `--bevel-lo` tokens.
 */
const panelVariants = cva('border', {
  variants: {
    variant: {
      raised: 'border-t-bevel-hi border-l-bevel-hi border-b-bevel-lo border-r-bevel-lo',
      inset: 'border-t-bevel-lo border-l-bevel-lo border-b-bevel-hi border-r-bevel-hi',
    },
  },
  defaultVariants: {
    variant: 'raised',
  },
});

export type PanelProps = ComponentProps<'div'> & VariantProps<typeof panelVariants>;

export function Panel({ className, variant, ...props }: PanelProps) {
  return <div className={cn(panelVariants({ variant }), className)} {...props} />;
}
