import { assignCarToUser } from "@/app/actions";

export default function AssignCarForm({ vin, userId }: { vin: string, userId: string }) {
  const bindedAssignCar = assignCarToUser.bind(null, vin, userId);

  return (
    <form action={bindedAssignCar}>
      <button type="submit">Submit</button>
    </form>
  );
}
