import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardWizard } from "@/components/onboard/OnboardWizard";

export default async function OnboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <OnboardWizard />;
}
