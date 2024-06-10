"use client";

import * as React from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function TogglePassword() {
  const [togglePassword, setTogglePassword] = React.useState(false);

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTogglePassword(event.target.checked);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="password">Password</Label>
      <Input
        id="password"
        type={togglePassword? "text" : "password"}
        name="password"
        placeholder="********"
        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$%*?&])[A-Za-z\d@$%*?&]{8,}$"
      />
      <Input
        type="checkbox"
        id="toggle-password"
        name="toggle-password"
        checked={togglePassword}
        onChange={handleToggleChange}
        className="h-4 w-4"
      />
    </div>
  );
}

