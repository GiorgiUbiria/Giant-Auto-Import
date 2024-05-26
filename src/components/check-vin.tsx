"use client";

import { getCarByVinFromAPI } from "@/app/actions";

const checkVin = () => {
  return (
    <form action={getCarByVinFromAPI}>
      <input type="text" id="vin" name="vin" />
      <button type="submit"> Find </button>
    </form>
  );
};

export default checkVin;
