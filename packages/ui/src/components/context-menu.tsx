import type { ComponentProps } from 'react';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { cn } from '../lib/utils';

/**
 * A right-click menu, built on Radix's headless primitive for the a11y/
 * positioning/focus-trap work (keyboard nav, closing on outside click, etc.)
 * and styled to match the app's other floating surfaces (CommandSuggestions,
 * CommandResults): `bg-secondary` panel, `font-mono text-sm`, `bg-accent` on
 * hover/highlight. Root/Trigger are passed through unstyled — only the parts
 * that render visible chrome (Content/Item/Separator/SubTrigger/SubContent)
 * get project styling.
 */
export {
  Root as ContextMenu,
  Trigger as ContextMenuTrigger,
  Sub as ContextMenuSub,
} from '@radix-ui/react-context-menu';

export function ContextMenuContent({ className, ...props }: ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        className={cn(
          'z-50 min-w-40 border border-bevel-hi bg-secondary py-1 font-mono text-sm shadow-lg',
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

export function ContextMenuItem({
  className,
  variant = 'default',
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Item> & { variant?: 'default' | 'destructive' }) {
  return (
    <ContextMenuPrimitive.Item
      className={cn(
        'flex w-full cursor-pointer items-center px-3 py-1.5 text-left outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        variant === 'destructive' && 'text-tag data-[highlighted]:text-tag',
        className,
      )}
      {...props}
    />
  );
}

export function ContextMenuSubTrigger({ className, ...props }: ComponentProps<typeof ContextMenuPrimitive.SubTrigger>) {
  return (
    <ContextMenuPrimitive.SubTrigger
      className={cn(
        'flex w-full cursor-pointer items-center justify-between px-3 py-1.5 text-left outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[state=open]:bg-accent/50',
        className,
      )}
      {...props}
    />
  );
}

export function ContextMenuSubContent({ className, ...props }: ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.SubContent
        className={cn(
          'z-50 min-w-40 border border-bevel-hi bg-secondary py-1 font-mono text-sm shadow-lg',
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

export function ContextMenuSeparator({ className, ...props }: ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return <ContextMenuPrimitive.Separator className={cn('my-1 h-px bg-border', className)} {...props} />;
}
