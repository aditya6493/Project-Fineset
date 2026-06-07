"use client";

import type { Control, FieldValues, Path } from "react-hook-form";
import { useFormContext } from "react-hook-form";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChipMultiSelect } from "@/components/shared/ChipMultiSelect";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { FormSection } from "@/components/forms/VisitForm/FormSection";

export interface SchemePitchOutcomeCopy {
  schemeHint: string;
  schemesPitched: { label: string; options: Record<string, string> };
  enrollmentOutcome: { label: string; options: Record<string, string> };
  monthlyCommitment: { label: string; placeholder: string };
  intentTier: {
    label: string;
    placeholder: string;
    options: Record<string, string>;
  };
  reasonNoEnrollment?: { label: string; options: Record<string, string> };
  schemeCompetitorMention?: { label: string; placeholder: string };
}

const ENROLLED_OUTCOMES = new Set([
  "ENROLLED_GHS",
  "ENROLLED_GPP",
  "ENROLLED_BOTH",
]);

interface SchemePitchOutcomeSectionProps<T extends FieldValues> {
  title: string;
  copy: SchemePitchOutcomeCopy;
  control: Control<T>;
  schemesPitched?: string[];
  enrollmentOutcome?: string;
  showNoEnrollmentFields?: boolean;
  id?: string;
}

export function SchemePitchOutcomeSection<T extends FieldValues>({
  title,
  copy,
  control,
  schemesPitched = [],
  enrollmentOutcome,
  showNoEnrollmentFields = false,
  id = "section-scheme",
}: SchemePitchOutcomeSectionProps<T>) {
  const { setValue } = useFormContext<T>();
  const fields = copy;
  const noSchemesPitched = schemesPitched.includes("NONE");
  const showMonthlyCommitment =
    !noSchemesPitched &&
    enrollmentOutcome &&
    ENROLLED_OUTCOMES.has(enrollmentOutcome);

  function clearSchemeOutcomeFields() {
    setValue("enrollmentOutcome" as Path<T>, undefined as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("monthlyCommitment" as Path<T>, undefined as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("reasonNoEnrollment" as Path<T>, undefined as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("schemeCompetitorMention" as Path<T>, undefined as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <FormSection title={title} id={id}>
      <p className="text-sm text-text-secondary">{copy.schemeHint}</p>

      <FormField
        control={control}
        name={"schemesPitched" as Path<T>}
        render={({ field, fieldState }) => (
          <FormItem>
            <FormControl>
              <ChipMultiSelect
                label={fields.schemesPitched.label}
                options={fields.schemesPitched.options}
                value={field.value ?? []}
                exclusiveKeys={["NONE"]}
                onChange={(value) => {
                  field.onChange(value);
                  if (value.includes("NONE")) {
                    clearSchemeOutcomeFields();
                  }
                }}
                error={fieldState.error?.message}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {!noSchemesPitched && (
        <>
          <FormField
            control={control}
            name={"enrollmentOutcome" as Path<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fields.enrollmentOutcome.label}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    {Object.entries(fields.enrollmentOutcome.options).map(
                      ([value, label]) => (
                        <div key={value} className="flex items-center gap-2">
                          <RadioGroupItem value={value} id={`scheme-outcome-${value}`} />
                          <Label htmlFor={`scheme-outcome-${value}`}>{label}</Label>
                        </div>
                      ),
                    )}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {showMonthlyCommitment && (
            <FormField
              control={control}
              name={"monthlyCommitment" as Path<T>}
              render={({ field }) => (
                <FormItem className="max-w-sm">
                  <FormLabel>{fields.monthlyCommitment.label}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      placeholder={fields.monthlyCommitment.placeholder}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {showNoEnrollmentFields && fields.reasonNoEnrollment && (
            <>
              <FormField
                control={control}
                name={"reasonNoEnrollment" as Path<T>}
                render={({ field }) => (
                  <FormItem className="max-w-md">
                    <FormLabel>{fields.reasonNoEnrollment!.label}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(fields.reasonNoEnrollment!.options).map(
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
              {fields.schemeCompetitorMention && (
                <FormField
                  control={control}
                  name={"schemeCompetitorMention" as Path<T>}
                  render={({ field }) => (
                    <FormItem className="max-w-md">
                      <FormLabel>{fields.schemeCompetitorMention!.label}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={fields.schemeCompetitorMention!.placeholder}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </>
          )}
        </>
      )}

      <FormField
        control={control}
        name={"intentTier" as Path<T>}
        render={({ field }) => (
          <FormItem className="max-w-sm">
            <FormLabel>{fields.intentTier.label}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value ?? ""}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={fields.intentTier.placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.entries(fields.intentTier.options).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
