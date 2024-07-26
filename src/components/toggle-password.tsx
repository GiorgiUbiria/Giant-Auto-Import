"use client";

import * as React from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";

export function TogglePassword({ password }: { password?: string }) {
  const [togglePassword, setTogglePassword] = React.useState(false);

  const handleToggleChange = (checked: boolean | 'indeterminate') => {
    setTogglePassword(checked === true);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="password">Password</Label>
      <Input
        id="password"
        type={togglePassword ? "text" : "password"}
        name="password"
        defaultValue={password ? password : ""}
        placeholder="********"
        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$%*?&])[A-Za-z\d@$%*?&]{8,}$"
      />
      <div className="flex items-center gap-2">
        <Checkbox id="toggle-password" checked={togglePassword}
          onCheckedChange={handleToggleChange}
        />
        <label
          htmlFor="toggle-password"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Toggle Password Visibility
        </label>
      </div>
    </div>
  );
}
