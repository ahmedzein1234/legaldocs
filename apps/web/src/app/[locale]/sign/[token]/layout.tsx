// For static export - we'll generate a placeholder and handle actual tokens client-side
export function generateStaticParams() {
  return [
    { token: 'placeholder' },
  ];
}

export default function SigningLayout({ children }: { children: React.ReactNode }) {
  return children;
}
