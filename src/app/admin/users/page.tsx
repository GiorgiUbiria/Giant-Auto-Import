import { getUsers } from "@/app/actions";

export default async function Page() {
  const users = await getUsers();

  return <h1> {JSON.stringify(users)}</h1>;
}
