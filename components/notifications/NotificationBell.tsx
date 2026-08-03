import { createClient } from "@/lib/supabase/server";
import { listUnreadNotifications } from "@/lib/notifications/db";
import { markNotificationReadAction } from "@/lib/notifications/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export async function NotificationBell() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const notifications = await listUnreadNotifications(supabase, user.id);

  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
        Notifications
        {notifications.length > 0 && (
          <Badge className="h-4 min-w-4 px-1 text-[10px]">{notifications.length}</Badge>
        )}
      </summary>
      <div className="absolute right-0 z-10 mt-2 w-72 rounded-lg bg-popover p-2 text-popover-foreground shadow-md ring-1 ring-foreground/10">
        {notifications.length === 0 ? (
          <p className="p-2 text-sm text-muted-foreground">No new notifications.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className="flex items-start justify-between gap-2 rounded-md p-2 text-sm hover:bg-accent"
              >
                <span>{notification.message}</span>
                <form action={markNotificationReadAction}>
                  <input type="hidden" name="id" value={notification.id} />
                  <Button type="submit" variant="ghost" size="xs" className="shrink-0">
                    Dismiss
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
