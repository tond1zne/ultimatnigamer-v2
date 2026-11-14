import type { Metadata } from "next";
import VerifyButton from "@/components/VerifyButton";

export const metadata: Metadata = { title: "Potvrzení e-mailu", robots: { index: false } };

export default function VerifyPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token ?? "";
  return (
    <div className="panel panel-frame mx-auto my-6 flex max-w-md flex-col gap-5 p-6 sm:p-8">
      <h1 className="font-display text-4xl leading-none">Potvrzení e-mailu</h1>
      {token ? (
        <>
          <p>Klikni na tlačítko a účet bude aktivní.</p>
          <VerifyButton token={token} />
        </>
      ) : (
        <p className="font-bold">Odkaz je neúplný. Otevři ho znovu přímo z e-mailu.</p>
      )}
    </div>
  );
}
