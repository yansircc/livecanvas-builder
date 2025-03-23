import { LoginForm } from "@/components/login-form";
import { LogoutButton } from "@/components/logout-button";
import { auth } from "@/server/auth";

export async function AuthExample() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
      {session ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name ?? "User"}
                className="h-10 w-10 rounded-full"
              />
            )}
            <div>
              <p className="font-medium">{session.user?.name}</p>
              <p className="text-gray-500 text-sm">{session.user?.email}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}
