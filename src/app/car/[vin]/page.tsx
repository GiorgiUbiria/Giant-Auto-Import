import { Client } from './client';

export default async function Page({ params }: { params: { vin: string } }) {
  return (
    <Client vin={params.vin} />
  );
}
