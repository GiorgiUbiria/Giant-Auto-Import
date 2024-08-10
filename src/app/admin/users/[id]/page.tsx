import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getUserAction } from "@/lib/actions/userActions";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { UpdateProfileForm } from "./edit-profile-form";

export default async function Page({ params }: { params: { id: string } }) {
  const { user: admin } = await getAuth();
  if (!admin || admin.role !== "ADMIN") {
    return redirect("/");
  }

  const [data, err] = await getUserAction({ id: params.id });
  if (!data) {
    console.error(err);
    return <p> No user </p>;
  }

  const { user, cars } = data;

  return (
    <div>
      <h1 className="text-3xl my-8"> Profile of - {user.fullName} </h1>
      <UpdateProfileForm user={user} />
      <DataTable columns={columns} data={cars} />
    </div>
  );
}
