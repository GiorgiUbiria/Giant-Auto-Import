import { updateCarInDb } from "@/lib/actions/dbActions";

import { CarData } from "@/lib/interfaces";

export default async function EditCarForm({ car }: { car: CarData }) {
  const updateCar = updateCarInDb.bind(null, car.car.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-bold mb-4">Edit Car with VIN {car.car.vin}</h2>
      <form action={updateCar}>
        <fieldset className="border p-4 mb-4">
          <legend className="px-2 text-lg font-semibold">Specifications</legend>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="vin" className="text-right">
              VIN
            </label>
            <input
              id="vin"
              name="vin"
              defaultValue={car.car.vin!}
              required
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="carfax" className="text-right">
              Carfax
            </label>
            <input
              id="carfax"
              name="carfax"
              defaultValue={car.specifications?.carfax || ""}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="year" className="text-right">
              Year
            </label>
            <input
              id="year"
              name="year"
              type="number"
              defaultValue={car.specifications?.year?.toString() || ""}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="make" className="text-right">
              Make
            </label>
            <input
              id="make"
              name="make"
              defaultValue={car.specifications?.make || ""}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="model" className="text-right">
              Model
            </label>
            <input
              id="model"
              name="model"
              defaultValue={car.specifications?.model || ""}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="trim" className="text-right">
              Trim
            </label>
            <input
              id="trim"
              name="trim"
              defaultValue={car.specifications?.trim || ""}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="manufacturer" className="text-right">
              Manufacturer
            </label>
            <input
              id="manufacturer"
              name="manufacturer"
              defaultValue={car.specifications?.manufacturer || ""}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="country" className="text-right">
              Country
            </label>
            <input
              id="country"
              name="country"
              defaultValue={car.specifications?.country || ""}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="engineType" className="text-right">
              Engine Type
            </label>
            <input
              id="engineType"
              name="engineType"
              defaultValue={car.specifications?.engineType || ""}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="titleNumber" className="text-right">
              Title Number
            </label>
            <input
              id="titleNumber"
              name="titleNumber"
              defaultValue={car.specifications?.titleNumber || ""}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="fuelType" className="text-right">
              Fuel Type
            </label>
            <input
              id="fuelType"
              name="fuelType"
              defaultValue={car.specifications?.fuelType || ""}
              className="col-span-3"
            />
          </div>
        </fieldset>

        <fieldset className="border p-4 mb-4">
          <legend className="px-2 text-lg font-semibold">
            Parking Details
          </legend>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="fined" className="text-right">
              Fined
            </label>
            <select
              id="fined"
              name="fined"
              defaultValue={car.parking_details?.fined ? "true" : "false"}
              className="col-span-3"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="arrived" className="text-right">
              Arrived
            </label>
            <select
              id="arrived"
              name="arrived"
              defaultValue={car.parking_details?.arrived ? "true" : "false"}
              className="col-span-3"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="status" className="text-right">
              Status
            </label>
            <input
              id="status"
              name="status"
              defaultValue={car.parking_details?.status || ""}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="parkingDateString" className="text-right">
              Parking Date String
            </label>
            <input
              id="parkingDateString"
              name="parkingDateString"
              type="date"
              defaultValue={car.parking_details?.parkingDateString || ""}
              className="col-span-3"
            />
          </div>
        </fieldset>

        <fieldset className="border p-4 mb-4">
          <legend className="px-2 text-lg font-semibold">Car Details</legend>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="originPort" className="text-right">
              Origin Port
            </label>
            <input
              id="originPort"
              name="originPort"
              defaultValue={car.car?.originPort || ""}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="destinationPort" className="text-right">
              Destination Port
            </label>
            <input
              id="destinationPort"
              name="destinationPort"
              defaultValue={car.car?.destinationPort || ""}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="shipping" className="text-right">
              Shipping
            </label>
            <input
              id="shipping"
              name="shipping"
              defaultValue={car.car?.shipping || ""}
              className="col-span-3"
            />
          </div>
        </fieldset>

        <button
          type="submit"
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
