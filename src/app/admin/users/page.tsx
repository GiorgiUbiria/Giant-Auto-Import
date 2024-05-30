import { getUsers } from "@/app/actions";
import { DatabaseUser } from "@/lib/db";

export default async function Page() {
  const users: DatabaseUser[] | undefined = await getUsers();

  return (
    <div>
      {users && users?.map((user) => (
        <div key={user.id}>
          {user.name}
          <br />
          {user.email}
          <br />
          {user.phone}
          <br />
          {user.role_id}
        </div>
      ))}
    </div>
  );
}
