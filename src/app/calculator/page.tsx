import { ShippingCalculator } from "./shipping-calculator";

export default function Page() {
  return (
    <div className="text-primary w-full h-fit" id="calc-bg">
      <ShippingCalculator />
    </div>
  );
}
