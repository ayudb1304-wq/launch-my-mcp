import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold text-white">Settings</h1>
      <p className="mt-1 text-sm text-gray-400">
        Manage your account and preferences.
      </p>

      <div className="mt-8 max-w-2xl space-y-6">
        {/* Account card */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-lg font-medium text-white">Account</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-gray-900/50 px-4 py-3">
              <span className="text-sm text-gray-400">Email</span>
              <span className="text-sm text-white">{user.email}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-900/50 px-4 py-3">
              <span className="text-sm text-gray-400">Auth provider</span>
              <span className="text-sm text-white">
                {user.app_metadata.provider ?? "email"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-900/50 px-4 py-3">
              <span className="text-sm text-gray-400">User ID</span>
              <code className="text-xs text-gray-500">{user.id}</code>
            </div>
          </div>
        </div>

        {/* Plan card */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-lg font-medium text-white">Plan</h2>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Free</p>
              <p className="text-xs text-gray-400">
                1 MCP server, 50 events/month
              </p>
            </div>
            <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400">
              Current plan
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
