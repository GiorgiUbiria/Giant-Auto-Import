import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TogglePassword } from "./toggle-password";
import { 
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent
} from "./ui/select";

export function RegisterForm() {
  return (
    <Card className="mx-auto max-w-lg dark:bg-gray-700">
      <CardHeader>
        <CardTitle className="text-3xl">Sign Up</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Maxim" name="name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+995551001122"
                name="phone"
                required
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
              required
            />
          </div>
          <TogglePassword />
          <div className="grid gap-2">
            <Label htmlFor="customId">Custom ID</Label>
            <Input
              id="customId"
              type="text"
              name="customId"
              placeholder="..."
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select name="role" required>
              <SelectTrigger>
                <SelectValue placeholder="USER" />
              </SelectTrigger> 
              <SelectContent>
                <SelectItem value="1">USER</SelectItem>
                <SelectItem value="4">MODERATOR</SelectItem>
                <SelectItem value="3">ACCOUNTANT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Create an account
          </Button>
          </div>
        </CardContent>
    </Card>
  );
}
