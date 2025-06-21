import { Client } from './client';
import { ServerClient } from './server-client';

export default async function Page({ params }: { params: { vin: string } }) {
  // Try server-side rendering first, fallback to client-side if needed
  try {
    return <ServerClient vin={params.vin} />;
  } catch (error) {
    console.error("Page: Server component failed, falling back to client component", error);
    return <Client vin={params.vin} />;
  }
}
