export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="text-primary w-full">
      {children}
    </section>
  );
}
