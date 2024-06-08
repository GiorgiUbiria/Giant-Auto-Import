"use client";

import { UserCarsTable } from "@/components/user-cars-table";
import getColumns from "./columns";
import { CarData } from "@/lib/interfaces";

export default function TableWithColumns({data, pdfToken, userId}: {data: CarData[], pdfToken: string, userId: string}){
  const columns = getColumns(pdfToken, userId);

  return (
      <UserCarsTable columns={columns} data={data} />
  )
}
