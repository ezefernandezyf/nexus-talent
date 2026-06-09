import { Card } from "../../../components/ui/Card";

interface AuthStatusScreenProps {
  message: string;
  title: string;
}

export function AuthStatusScreen({ message, title }: AuthStatusScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-container-lowest px-5 py-8 text-on-surface">
      <Card className="flex w-full max-w-xl flex-col gap-4 p-6 sm:p-8">
        <span className="label-chip">Acceso seguro</span>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">{title}</h1>
          <p className="text-sm leading-7 text-on-surface-variant">{message}</p>
        </div>
      </Card>
    </main>
  );
}
