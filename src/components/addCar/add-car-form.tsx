import AddForm from "./form";

export default async function AddCarForm() {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
      <h1 className="text-4xl font-bold mb-4 text-primary">Add a New Car <span>🚗</span>{" "}</h1>
      <AddForm />
    </div>
  );
}
