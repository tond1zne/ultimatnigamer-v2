import Link from "next/link";

export default function NotFound() {
  return (
    <div className="panel panel-frame mx-auto my-10 flex max-w-xl flex-col items-start gap-5 p-8">
      <span className="bubble"><span className="font-num text-5xl">404</span></span>
      <h1 className="mt-3 font-display text-4xl leading-none">Tady nic není.</h1>
      <p className="text-ash">Tuhle stránku jsme nenašli. Možná byla smazaná, nebo je v odkazu překlep.</p>
      <Link href="/" className="btn btn-ink">Zpátky na úvod</Link>
    </div>
  );
}
