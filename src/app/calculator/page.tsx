import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dynamicImport from "next/dynamic";
import { Provider } from 'jotai';

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

const ShippingCalculator = dynamicImport(() => import("./shipping-calculator").then(mod => ({ default: mod.ShippingCalculator })), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center py-6 px-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-4xl p-6 text-center">
        <div className="relative">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-muted animate-pulse"></div>
            <div className="absolute inset-2 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded-full w-48 mx-auto animate-pulse"></div>
          <div className="h-3 bg-muted/60 rounded-full w-32 mx-auto animate-pulse"></div>
        </div>
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
      <div
        className="min-h-screen py-6 px-4 relative"
        style={{
          backgroundImage: 'url(/calc-bg.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Background Overlay - Light mode: white overlay, Dark mode: black overlay */}
        <div className="absolute inset-0 bg-white/70 dark:bg-black/40 backdrop-blur-[2px]"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto">
          <ShippingCalculator
            style={user?.role === "CUSTOMER_DEALER" ? "c" : "a"}
            userId={user?.id}
          />
        </div>
      </div>
    </Provider>
  );
}
