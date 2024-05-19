import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCars } from "./actions";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/login");
  }

  const cars = await getCars();

  return (
    <>
      <h1>Hi, {user.email}!</h1>
      <p>Your user ID is {user.id}.</p>
      <p> Your role is {user.role_id}</p>
      <div className="space-y-4">
        {cars && cars.data.map((car) => (
          <div
            key={car.id}
            className="border border-gray-300 p-4 rounded-md shadow-md"
          >
            <h2 className="text-xl font-semibold mb-2">
              {car.specifications.year} {car.specifications.make}{" "}
              {car.specifications.model}
            </h2>
            <p>
              <strong>Location:</strong> {car.location}
            </p>
            <p>
              <strong>Status:</strong> {car.parkingDetails.status}
            </p>
            <p>
              <strong>Parking Date:</strong>{" "}
              {car.parkingDetails.parkingDateString}
            </p>
            <p>
              <strong>Notes:</strong> {car.notes.mtlNotes}
            </p>
            <p>
              <strong>Shipping Company:</strong> {car.shipping.name}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
