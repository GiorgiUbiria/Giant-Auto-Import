export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="text-primary">
      {children}
    </section>
  );
}
