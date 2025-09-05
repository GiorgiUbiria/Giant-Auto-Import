export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
    return (
        <div className="container mx-auto py-10">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h1 className="text-2xl font-bold mb-2">Admin Users Test Page</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    This is a simple test route at /admin/users/profile/test to verify routing on production.
                </p>
            </div>
        </div>
    );
}


