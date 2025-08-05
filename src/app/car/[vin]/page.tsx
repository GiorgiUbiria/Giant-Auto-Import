import { Client } from './client';
import { ServerClient } from './server-client';
import { CarProvider } from './car-provider';

export default async function Page({ params }: { params: { vin: string } }) {
  // Try server-side rendering first, fallback to client-side if needed
  try {
    return (
      <CarProvider>
        <ServerClient vin={params.vin} />
      </CarProvider>
    );
  } catch (error) {
    console.error("Page: Server component failed, falling back to client component", error);
    return (
      <CarProvider>
        <Client vin={params.vin} />
      </CarProvider>
    );
  }
}
