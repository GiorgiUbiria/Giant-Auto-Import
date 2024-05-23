import dynamic from 'next/dynamic';

const PSPDFKitWrapper = dynamic(() => import("@/components/pdf-wrapper"), {
  loading: () => <p>Loading your invoice...</p>,
  ssr: false,
});

const Page: React.FC = async () => {
  const data = {
    billedTo: "Giorgi Ubiria",
    paymentDate: new Date().toDateString(),
  }

  return (
    <div>
      <PSPDFKitWrapper documentPath="/document.pdf" data={data} />
    </div>
  );
};

export default Page;

