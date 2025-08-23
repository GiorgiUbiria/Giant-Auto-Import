import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Client } from "./client";
import { getTranslations } from "next-intl/server";

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

export default async function Page() {
  const { user } = await getAuth();
  if (!user || user.role !== "ADMIN") {
    return redirect("/");
  }

  const t = await getTranslations("AdminCars");
  const tDataTable = await getTranslations("DataTable");
  const tPagination = await getTranslations("DataTablePagination");

  return (
    <Client translations={{
      title: t("title"),
      loading: t("loading"),
      error: t("error"),
      noCars: t("noCars"),
      columns: {
        owner: t("columns.owner"),
        purchaseDate: t("columns.purchaseDate"),
        photo: t("columns.photo"),
        vehicle: t("columns.vehicle"),
        lotVin: t("columns.lotVin"),
        receiver: t("columns.receiver"),
        fuel: t("columns.fuel"),
        title: t("columns.title"),
        keys: t("columns.keys"),
        usPort: t("columns.usPort"),
        destinationPort: t("columns.destinationPort"),
        actions: t("columns.actions")
      },
      actions: {
        edit: t("actions.edit"),
        delete: t("actions.delete"),
        deleteConfirmDescription: t("actions.deleteConfirmDescription"),
        cancel: t("actions.cancel"),
        deleteAction: t("actions.deleteAction"),
        deleting: t("actions.deleting"),
        deleteSuccess: t("actions.deleteSuccess"),
        deleteError: t("actions.deleteError")
      },
      receiver: {
        noReceiver: t("receiver.noReceiver"),
        assignSuccess: t("receiver.assignSuccess"),
        assignError: t("receiver.assignError")
      },
      owner: {
        loadError: t("owner.loadError")
      },
      totalFee: {
        totalPurchaseFee: t("totalFee.totalPurchaseFee"),
        basePurchaseFee: t("totalFee.basePurchaseFee"),
        auctionFee: t("totalFee.auctionFee"),
        gateFee: t("totalFee.gateFee"),
        titleFee: t("totalFee.titleFee"),
        environmentalFee: t("totalFee.environmentalFee"),
        virtualBidFee: t("totalFee.virtualBidFee"),
        totalPurchaseFeeResult: t("totalFee.totalPurchaseFeeResult"),
        shippingFee: t("totalFee.shippingFee"),
        groundFee: t("totalFee.groundFee"),
        oceanFee: t("totalFee.oceanFee")
      },
      buttons: {
        comingSoon: t("buttons.comingSoon")
      },
      status: {
        yes: t("status.yes"),
        no: t("status.no")
      },
      dataTable: {
        searchPlaceholder: tDataTable.raw("searchPlaceholder"),
        columns: tDataTable("columns"),
        noResults: tDataTable("noResults"),
        noData: tDataTable("noData"),
        clearFilter: tDataTable("clearFilter")
      },
      pagination: {
        showing: tPagination.raw("showing"),
        rowsPerPage: tPagination("rowsPerPage"),
        page: tPagination.raw("page"),
        goToFirst: tPagination("goToFirst"),
        goToPrevious: tPagination("goToPrevious"),
        goToNext: tPagination("goToNext"),
        goToLast: tPagination("goToLast")
      }
    }} />
  );
}
