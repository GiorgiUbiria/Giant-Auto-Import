import { ShippingCalculator } from "./shipping-calculator";

export default function Page() {
  return (
    <div className="text-primary">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <ShippingCalculator />
      </div>
    </div>
  );
}
