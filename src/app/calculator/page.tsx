import { getAuth } from "@/lib/auth";
import { ShippingCalculator } from "./shipping-calculator";

export default async function Page() {
  const { user } = await getAuth();

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 bg-gradient-to-b from-background to-muted/20">
      <ShippingCalculator style={user?.role === "CUSTOMER_DEALER" ? "c" : "a"} />
    </div>
  );
}
