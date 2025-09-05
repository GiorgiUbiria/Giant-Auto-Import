import { redirect, notFound } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { Client } from "../[id]/client";
import { UserDataProvider } from "../[id]/user-data-provider";

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;
export const runtime = 'nodejs';

export default async function Page({ params }: { params: { slug: string[] } }) {
    const slug = params.slug || [];
    if (!Array.isArray(slug) || slug.length !== 1) {
        return notFound();
    }

    const id = slug[0];

    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
        return redirect("/");
    }

    return (
        <UserDataProvider userId={id}>
            <Client id={id} />
        </UserDataProvider>
    );
}


