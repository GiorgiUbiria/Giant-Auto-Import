import AddForm from "./form";

export default async function AddCarForm() {
  return (
    <div className="max-w-md">
      <h1 className="text-3xl font-bold mb-4">Add New Car</h1>
      <AddForm />
    </div>
  );
}
