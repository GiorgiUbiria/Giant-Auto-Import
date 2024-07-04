import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUser } from "@/lib/actions/dbActions";
import { TogglePassword } from "./toggle-password";

export async function UpdateUserForm({ id }: { id: string }) {
  const userToFind = await getUser(id);
  if (!userToFind) {
    return <p> No user with specified id </p>;
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-3xl">Edit User</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="hidden" name="userId" value={id} />
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                defaultValue={userToFind.user.name}
                placeholder="Maxim"
                name="name"
                pattern="^[a-zA-Z ]+$"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+995551001122"
                defaultValue={userToFind.user.phone}
                name="phone"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="test@example.com"
              defaultValue={userToFind.user.email}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="customId">Custom ID</Label>
            <Input
              id="customId"
              type="text"
              name="customId"
              placeholder="123..."
              defaultValue={userToFind.user?.customId!}
            />
          </div>
          <TogglePassword password={userToFind.user.passwordText!} />
          <Button type="submit" className="w-full">
            Update user information
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
