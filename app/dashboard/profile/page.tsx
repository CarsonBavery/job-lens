import { createClient } from "@/lib/supabase/server";
import { listProjects, projectLimit } from "@/lib/projects/db";
import { listEducation } from "@/lib/education/db";
import { listWorkExperience } from "@/lib/workExperience/db";
import type { SubscriptionTier } from "@/lib/documents/db";
import { ProjectsSection } from "@/components/profile/ProjectsSection";
import { EducationSection } from "@/components/profile/EducationSection";
import { WorkExperienceSection } from "@/components/profile/WorkExperienceSection";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();
  const tier = (profile?.subscription_tier ?? "free") as SubscriptionTier;

  const [projects, education, experience] = await Promise.all([
    listProjects(supabase, user.id),
    listEducation(supabase, user.id),
    listWorkExperience(supabase, user.id),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold">Career Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Projects, education, and work history Gemini can draw on when tailoring your resumes and
          cover letters.
        </p>
      </div>

      <ProjectsSection projects={projects} limit={projectLimit(tier)} />
      <EducationSection education={education} />
      <WorkExperienceSection experience={experience} />
    </div>
  );
}
