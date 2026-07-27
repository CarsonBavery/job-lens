"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { markNotificationRead } from "./db";

export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await markNotificationRead(supabase, id);
  revalidatePath("/dashboard", "layout");
}
