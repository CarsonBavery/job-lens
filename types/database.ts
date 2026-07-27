// Hand-written to match supabase/migrations/0001_init.sql.
// Once a live Supabase project exists, prefer regenerating this with:
//   npx supabase gen types typescript --project-id <id> > types/database.ts

export type SubscriptionTier = "free" | "pro";
export type ApplicationStatus =
  | "saved"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected";
export type JobSourceName = "greenhouse" | "lever" | "ashby" | "workable";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          subscription_tier: SubscriptionTier;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["profiles"]["Row"], "id">> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          job_title: string | null;
          content: Record<string, unknown>;
          file_path: string | null;
          is_base: boolean;
          base_resume_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["resumes"]["Row"]> & {
          user_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["resumes"]["Row"]>;
        Relationships: [];
      };
      cover_letters: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: Record<string, unknown>;
          file_path: string | null;
          is_base: boolean;
          base_cover_letter_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["cover_letters"]["Row"]> & {
          user_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["cover_letters"]["Row"]>;
        Relationships: [];
      };
      job_sources: {
        Row: {
          id: string;
          name: JobSourceName;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["job_sources"]["Row"]> & {
          name: JobSourceName;
        };
        Update: Partial<Database["public"]["Tables"]["job_sources"]["Row"]>;
        Relationships: [];
      };
      job_postings: {
        Row: {
          id: string;
          source_id: string;
          external_id: string;
          company: string;
          title: string;
          location: string | null;
          remote: boolean;
          description: string | null;
          url: string;
          salary_min: number | null;
          salary_max: number | null;
          posted_at: string | null;
          embedding: number[] | null;
          dedup_group_id: string | null;
          dedup_key: string | null;
          raw: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["job_postings"]["Row"]> & {
          source_id: string;
          external_id: string;
          company: string;
          title: string;
          url: string;
        };
        Update: Partial<Database["public"]["Tables"]["job_postings"]["Row"]>;
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          job_posting_id: string | null;
          resume_id: string | null;
          cover_letter_id: string | null;
          status: ApplicationStatus;
          applied_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["applications"]["Row"]> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["applications"]["Row"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string;
          stripe_subscription_id: string | null;
          price_id: string | null;
          status: string;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]> & {
          user_id: string;
          stripe_customer_id: string;
          status: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      match_job_postings: {
        Args: {
          query_embedding: number[];
          match_company: string;
          match_threshold?: number;
          match_count?: number;
          exclude_id?: string | null;
        };
        Returns: {
          id: string;
          title: string;
          company: string;
          dedup_group_id: string | null;
          similarity: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
