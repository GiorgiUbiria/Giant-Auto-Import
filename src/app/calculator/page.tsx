import { getAuth } from "@/lib/auth";
import { ShippingCalculator } from "./shipping-calculator";

export default async function Page() {
  const { user } = await getAuth();

  return (
    <div className="flex items-center justify-center" id="calc-bg">
      <ShippingCalculator style={user?.role === "CUSTOMER_DEALER" ? "c" : "a"} />
    </div>
  );
}