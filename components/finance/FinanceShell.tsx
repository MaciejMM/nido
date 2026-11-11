import { RegisterServiceWorker } from "@/components/finance/register-sw";

export function FinanceShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RegisterServiceWorker />
      <div>{children}</div>
    </>
  );
}
