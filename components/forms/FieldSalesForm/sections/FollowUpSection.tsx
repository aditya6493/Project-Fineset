"use client";

import type { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FormSection } from "@/components/forms/VisitForm/FormSection";
import type { FieldSalesFormCopy, FieldSalesFormValues } from "../FieldSalesForm.types";
import { formatDateForInput, parseDateInput } from "../FieldSalesForm.types";

interface FollowUpSectionProps {
  copy: FieldSalesFormCopy;
  control: Control<FieldSalesFormValues>;
  followUpNeeded: boolean;
}

export function FollowUpSection({
  copy,
  control,
  followUpNeeded,
}: FollowUpSectionProps) {
  const fields = copy.fields;

  return (
    <FormSection title={copy.sections.followUp} id="section-follow-up">
      <FormField
        control={control}
        name="followUpNeeded"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-card border border-border px-4 py-3">
            <FormLabel className="!mt-0">{fields.followUpNeeded.label}</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      {followUpNeeded && (
        <FormField
          control={control}
          name="followUpDate"
          render={({ field }) => (
            <FormItem className="max-w-sm">
              <FormLabel>{fields.followUpDate.label}</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value ? formatDateForInput(field.value) : ""}
                  onChange={(event) => {
                    if (!event.target.value) return;
                    field.onChange(parseDateInput(event.target.value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="staffNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fields.staffNotes.label}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={fields.staffNotes.placeholder}
                rows={3}
                maxLength={500}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
