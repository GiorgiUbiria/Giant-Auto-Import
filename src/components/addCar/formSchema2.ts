import { z } from "zod";

export const formSchema2 = z.object({
  vin: z.string().length(5, {
    message:
      "VIN code must be exactly 17 characters long and of correct format.",
  }),
  fined: z.boolean(),
  departureDate: z.date(),
  price: z.string().refine(
    (val) => {
      const numberValue = parseFloat(val);
      return (
        !Number.isNaN(numberValue) && numberValue >= 0 && numberValue <= 150000
      );
    },
    {
      message: "Price must be a number between 0 and 150000.",
    },
  ),
  priceCurrency: z.enum(["GEL", "USD", "EUR"], {
    message: "Price Currency must be between 1 and 3.",
  }),
});
