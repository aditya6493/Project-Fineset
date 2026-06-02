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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSection } from "@/components/forms/VisitForm/FormSection";
import type { FieldSalesFormCopy, FieldSalesFormValues } from "../FieldSalesForm.types";

interface NoEnrollmentSectionProps {
  copy: FieldSalesFormCopy;
  control: Control<FieldSalesFormValues>;
}

export function NoEnrollmentSection({ copy, control }: NoEnrollmentSectionProps) {
  const fields = copy.fields;

  return (
    <FormSection title={copy.sections.noEnrollment} id="section-no-enrollment">
      <FormField
        control={control}
        name="reasonNoEnrollment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fields.reasonNoEnrollment.label}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value ?? ""}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.entries(fields.reasonNoEnrollment.options).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="competitorMention"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fields.competitorMention.label}</FormLabel>
            <FormControl>
              <Input
                placeholder={fields.competitorMention.placeholder}
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
