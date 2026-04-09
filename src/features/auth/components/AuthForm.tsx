import React from "react";

interface AuthFormProps {
  title?: string;
  children?: React.ReactNode;
}

export default function AuthForm({ title, children }: AuthFormProps) {
  return (
    <div className="max-w-md mx-auto w-full bg-surface-container p-6 rounded-xl shadow-md">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      <div>{children}</div>
    </div>
  );
}

export { AuthForm };
