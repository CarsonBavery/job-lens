"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogClose,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// Confirms before submitting a delete Server Action. The submit button lives
// inside the dialog's portaled content (outside the target <form> in the DOM
// tree), so it targets the form via the `form` attribute rather than
// nesting -- the caller must give that <form> a matching `id`.
export function DeleteConfirmButton({
  formId,
  itemLabel,
  triggerLabel = "Delete",
  size,
  className,
}: {
  formId: string;
  itemLabel: string;
  triggerLabel?: string;
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button type="button" variant="ghost" size={size} className={className}>
            {triggerLabel}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this {itemLabel}?</AlertDialogTitle>
          <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button type="button" variant="outline">Cancel</Button>} />
          <AlertDialogClose
            render={
              <Button type="submit" form={formId} variant="destructive">
                Delete
              </Button>
            }
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
