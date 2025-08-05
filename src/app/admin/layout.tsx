import { Provider } from 'jotai';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider>
      <section className="text-primary w-full suppressHydrationWarning">
        {children}
      </section>
    </Provider>
  );
}
