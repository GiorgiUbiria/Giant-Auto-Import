import { validateRequest } from '@/lib/auth';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';

const PSPDFKitWrapper = dynamic(() => import("@/components/pdf-wrapper"), {
  loading: () => <p>Loading your invoice...</p>,
  ssr: false,
});

const Page: React.FC = async () => {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/");
  }

  const data = {
    billedTo: "Giorgi Ubiria",
    paymentDate: new Date().toDateString(),
  }

  return (
    <div>
      <PSPDFKitWrapper documentPath="/document.pdf" data={data} token={user.pdf_token} />
    </div>
  );
};

export default Page;

