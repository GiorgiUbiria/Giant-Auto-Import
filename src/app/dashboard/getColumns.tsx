"use client";

import { UserCarsTable } from "@/components/user-cars-table";
import getColumns from "./columns";
import { CarData } from "@/lib/interfaces";

export default function TableWithColumns({data, pdfToken}: {data: CarData[], pdfToken: string}){
  const columns = getColumns(pdfToken);

  return (
      <UserCarsTable columns={columns} data={data} />
  )
}
