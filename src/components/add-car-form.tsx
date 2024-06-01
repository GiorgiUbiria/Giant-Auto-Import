import { addCarToDb } from "@/lib/actions/dbActions";

export default async function AddCarForm() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-bold mb-4">Add New Car</h2>
      <form action={addCarToDb}>
        <fieldset className="border p-4 mb-4">
          <legend className="px-2 text-lg font-semibold">Specifications</legend>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="vin" className="text-right">
              VIN
            </label>
            <input id="vin" name="vin" required className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="carfax" className="text-right">
              Carfax
            </label>
            <input id="carfax" name="carfax" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="year" className="text-right">
              Year
            </label>
            <input id="year" name="year" type="number" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="make" className="text-right">
              Make
            </label>
            <input id="make" name="make" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="model" className="text-right">
              Model
            </label>
            <input id="model" name="model" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="trim" className="text-right">
              Trim
            </label>
            <input id="trim" name="trim" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="manufacturer" className="text-right">
              Manufacturer
            </label>
            <input
              id="manufacturer"
              name="manufacturer"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="bodyType" className="text-right">
              Body Type
            </label>
            <input id="bodyType" name="bodyType" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="country" className="text-right">
              Country
            </label>
            <input id="country" name="country" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="engineType" className="text-right">
              Engine Type
            </label>
            <input id="engineType" name="engineType" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="titleNumber" className="text-right">
              Title Number
            </label>
            <input id="titleNumber" name="titleNumber" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="titleState" className="text-right">
              Title State
            </label>
            <input id="titleState" name="titleState" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="color" className="text-right">
              Color
            </label>
            <input id="color" name="color" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="fuelType" className="text-right">
              Fuel Type
            </label>
            <input id="fuelType" name="fuelType" className="col-span-3" />
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
            <select id="fined" name="fined" className="col-span-3">
              <option value="">Select...</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="arrived" className="text-right">
              Arrived
            </label>
            <select id="arrived" name="arrived" className="col-span-3">
              <option value="">Select...</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="status" className="text-right">
              Status
            </label>
            <input id="status" name="status" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="parkingDateString" className="text-right">
              Parking Date String
            </label>
            <input
              id="parkingDateString"
              name="parkingDateString"
              type="date"
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
            <input id="originPort" name="originPort" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="destinationPort" className="text-right">
              Destination Port
            </label>
            <input
              id="destinationPort"
              name="destinationPort"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="departureDate" className="text-right">
              Departure Date
            </label>
            <input
              id="departureDate"
              name="departureDate"
              type="date"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="arrivalDate" className="text-right">
              Arrival Date
            </label>
            <input
              id="arrivalDate"
              name="arrivalDate"
              type="date"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="auction" className="text-right">
              Auction
            </label>
            <input id="auction" name="auction" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="createdAt" className="text-right">
              Created At
            </label>
            <input
              id="createdAt"
              name="createdAt"
              type="date"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="shipping" className="text-right">
              Shipping
            </label>
            <input id="shipping" name="shipping" className="col-span-3" />
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
