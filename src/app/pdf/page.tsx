import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import { validateRequest } from "@/lib/auth";

const PSPDFKitWrapper = dynamic(() => import("@/components/pdf-wrapper"), {
  loading: () => <p>Loading your invoice...</p>,
  ssr: false,
});

const Page: React.FC = async () => {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/");
  }

  console.log(user)

  const data = {
    billedTo: user.name,
    paymentDate: new Date().toDateString(),
    vin: "",
  };

  return (
    <div>
      <PSPDFKitWrapper
        documentPath="/document.pdf"
        data={data}
        token={user.pdf_token}
        id={user.id!}
      />
    </div>
  );
};

export default Page;
