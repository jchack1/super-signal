import { Button } from '@super-signal/ui/components/button';

export function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Super Signal</h1>
      <p className="text-muted-foreground">Filesystem underneath, Signal/Discord on top.</p>
      <Button>Get started</Button>
    </main>
  );
}
