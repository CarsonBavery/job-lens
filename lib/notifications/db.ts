import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface NotificationRecord {
  id: string;
  message: string;
  application_id: string | null;
  read: boolean;
  created_at: string;
}

export async function listUnreadNotifications(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<NotificationRecord[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, message, application_id, read, created_at")
    .eq("user_id", userId)
    .eq("read", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
  if (error) throw error;
}

export async function createNotification(
  supabase: SupabaseClient<Database>,
  params: { userId: string; message: string; applicationId: string | null },
): Promise<void> {
  const { error } = await supabase.from("notifications").insert({
    user_id: params.userId,
    message: params.message,
    application_id: params.applicationId,
  });
  if (error) throw error;
}
