import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dynamicImport from "next/dynamic";
import { Provider } from 'jotai';

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

const ShippingCalculator = dynamicImport(() => import("./shipping-calculator").then(mod => ({ default: mod.ShippingCalculator })), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-4xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading calculator...</p>
      </div>
    </div>
  )
});

export default async function Page() {
  const { user } = await getAuth();
  
  if (!user) {
    return redirect("/login");
  }

  return (
    <Provider>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <ShippingCalculator
            style={user?.role === "CUSTOMER_DEALER" ? "c" : "a"}
            userId={user?.id}
          />
        </div>
      </div>
    </Provider>
  );
}
