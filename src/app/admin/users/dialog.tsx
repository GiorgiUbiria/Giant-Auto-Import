import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotSquareIcon } from "lucide-react";
import { removeUser } from "@/lib/actions/authActions";

export default function CloseDialog() {
  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <DotSquareIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Open</DropdownMenuItem>
          <DropdownMenuItem>Download</DropdownMenuItem>
          <DialogTrigger asChild>
            <DropdownMenuItem>
              <span>Assign a Car</span>
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>What car do you want to assign?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Are you sure you want to permanently
            delete this file from our servers?
          </DialogDescription>
        </DialogHeader>
        <DialogContent></DialogContent>
        <DialogFooter>
          <button
            onClick={async () => {
              const deleted = await removeUserAction();
              console.log(deleted);
            }}
          >
            {" "}
            Remove{" "}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
