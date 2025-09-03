import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication at layout level
  const authResult = await getAuth();
  const user = authResult?.user || null;

  if (!user || user.role !== "ADMIN") {
    console.log("Admin layout: User not authenticated or not admin", {
      hasUser: !!user,
      userRole: user?.role
    });
    redirect("/");
  }

  return (
    <section className="text-primary w-full suppressHydrationWarning">
      {children}
    </section>
  );
}
