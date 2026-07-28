import { createClient } from "@/lib/supabase/server";
import { listUnreadNotifications } from "@/lib/notifications/db";
import { markNotificationReadAction } from "@/lib/notifications/actions";

export async function NotificationBell() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const notifications = await listUnreadNotifications(supabase, user.id);

  return (
    <details className="relative">
      <summary className="cursor-pointer list-none text-sm text-gray-500 hover:text-foreground">
        Notifications{notifications.length > 0 ? ` (${notifications.length})` : ""}
      </summary>
      <div className="absolute right-0 z-10 mt-2 w-72 rounded-md border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-800 dark:bg-gray-950">
        {notifications.length === 0 ? (
          <p className="p-2 text-sm text-gray-500">No new notifications.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className="flex items-start justify-between gap-2 rounded-md p-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <span>{notification.message}</span>
                <form action={markNotificationReadAction}>
                  <input type="hidden" name="id" value={notification.id} />
                  <button type="submit" className="shrink-0 text-xs text-gray-500 hover:underline">
                    Dismiss
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
