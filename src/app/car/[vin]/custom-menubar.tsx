"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CustomMenuBarProps {
  onSelect: (option: string) => void;
}

const CustomMenuBar: React.FC<CustomMenuBarProps> = ({ onSelect }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Image Types</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Select Image Type</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem onCheckedChange={() => onSelect("Arrival")}>
          Arrival
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem onCheckedChange={() => onSelect("Container")}>
          Container
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomMenuBar;
