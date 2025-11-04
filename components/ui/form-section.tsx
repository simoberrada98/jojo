'use client';

import { H3 } from './typography';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <div className="bg-card p-6 border border-border rounded-lg">
      <H3 className="mb-4 text-lg">{title}</H3>
      {children}
    </div>
  );
}
