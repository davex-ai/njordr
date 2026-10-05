import { Suspense } from "react";
import ProfileForm, { type Profile } from "@/components/ProfileForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Account" };
export const dynamic = "force-dynamic";

const EMPTY: Profile = { full_name: "", phone: "", address_line: "", city: "", state: "", country: "Nigeria" };

export default async function Account() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("profiles")
    .select("full_name, phone, address_line, city, state, country")
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Delivery address</h1>
        <p className="mt-1 text-muted">We use this to deliver your orders.</p>
      </div>
      <div className="rounded-2xl border border-line bg-surface p-6">
        <Suspense>
          <ProfileForm initial={(data as Profile | null) ?? EMPTY} email={user?.email ?? ""} />
        </Suspense>
      </div>
    </div>
  );
}
