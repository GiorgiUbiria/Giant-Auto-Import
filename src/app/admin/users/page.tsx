import { getUsers } from "@/app/actions";
import AssignCarForm from "@/components/assign-car-form";
import { DatabaseUser } from "@/lib/db";
import Link from "next/link";

export default async function Page() {
  const users: DatabaseUser[] | undefined = await getUsers();

  return (
    <div>
      {users && users?.map((user) => (
        <div key={user.id} className="border border-red-500 w-1/4">
          <p>
            {user.name}
            {" "}
            <Link href={`/admin/users/${user.id}`}>
              {user.id}
            </Link>
          </p>  
          <br />
          <p>
            {user.email}
          </p>
          <br />
          <p>
            {user.phone}
          </p>
          <br />
          <p>
            {user.role_id}
          </p>
          <AssignCarForm userId={user.id} />
        </div>
      ))}
    </div>
  );
}
