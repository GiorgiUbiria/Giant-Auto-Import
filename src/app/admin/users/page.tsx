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

  const t = await getTranslations("AdminUsers");
  const tDataTable = await getTranslations("DataTable");
  const tPagination = await getTranslations("DataTablePagination");

  return (
    <Client translations={{
      title: t("title"),
      loading: t("loading"),
      error: t("error"),
      noUsers: t("noUsers"),
      columns: {
        id: t("columns.id"),
        fullName: t("columns.fullName"),
        email: t("columns.email"),
        phone: t("columns.phone"),
        role: t("columns.role"),
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
