import type { ComponentProps } from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { cn } from '../lib/utils';

/**
 * A modal confirmation — built on Radix's AlertDialog (focus-trapped, closes
 * only via an explicit action, unlike a dismissable Dialog) for destructive
 * actions like delete. Styled as a raised beveled panel over a dimmed
 * backdrop, matching the app's vintage-chrome surfaces.
 */
export { Root as AlertDialog, Trigger as AlertDialogTrigger } from '@radix-ui/react-alert-dialog';

export function AlertDialogContent({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/70" />
      <AlertDialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 border border-t-bevel-hi border-l-bevel-hi border-b-bevel-lo border-r-bevel-lo bg-secondary p-4 font-mono shadow-lg',
          className,
        )}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  );
}

export function AlertDialogTitle({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return <AlertDialogPrimitive.Title className={cn('text-sm font-semibold text-foreground', className)} {...props} />;
}

export function AlertDialogDescription({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      className={cn('mt-2 text-xs text-muted-foreground', className)}
      {...props}
    />
  );
}

export function AlertDialogAction({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(
        'h-8 border border-t-bevel-hi border-l-bevel-hi border-b-bevel-lo border-r-bevel-lo bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90',
        className,
      )}
      {...props}
    />
  );
}

export function AlertDialogCancel({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(
        'h-8 border border-t-bevel-hi border-l-bevel-hi border-b-bevel-lo border-r-bevel-lo bg-card px-3 text-xs text-foreground hover:bg-accent',
        className,
      )}
      {...props}
    />
  );
}
