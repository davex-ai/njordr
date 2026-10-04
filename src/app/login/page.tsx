import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm space-y-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
