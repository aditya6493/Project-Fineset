"use client";

import type { Control, UseFormWatch } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { calculateDurationMins, formatDurationMins } from "@/lib/utils/formatters";
import {
  FormSection,
} from "@/components/forms/VisitForm/FormSection";
import type {
  FieldSalesFormCopy,
  FieldSalesFormSectionId,
  FieldSalesFormValues,
} from "./FieldSalesForm.types";
import {
  formatDateForInput,
  formatTimeForInput,
  getSchemePitchCopy,
  parseDateInput,
  parseTimeInput,
} from "./FieldSalesForm.types";
import { SchemePitchOutcomeSection } from "@/components/forms/shared/SchemePitchOutcomeSection";

interface FieldSalesFormSectionsProps {
  copy: FieldSalesFormCopy;
  control: Control<FieldSalesFormValues>;
  watch: UseFormWatch<FieldSalesFormValues>;
  activeSection?: FieldSalesFormSectionId;
  mode: "wizard" | "full";
}

function shouldShowSection(
  sectionId: FieldSalesFormSectionId,
  activeSection: FieldSalesFormSectionId | undefined,
  mode: "wizard" | "full",
): boolean {
  if (mode === "full") return true;
  return sectionId === activeSection;
}

export function FieldSalesFormSections({
  copy,
  control,
  watch,
  activeSection,
  mode,
}: FieldSalesFormSectionsProps) {
  const enrollmentOutcome = watch("enrollmentOutcome");
  const followUpNeeded = watch("followUpNeeded");
  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const fields = copy.fields;

  const totalDurationLabel =
    startTime && endTime && endTime > startTime
      ? formatDurationMins(calculateDurationMins(startTime, endTime))
      : null;

  return (
    <div className="space-y-4 lg:space-y-6">
      {shouldShowSection("customer", activeSection, mode) && (
        <FormSection title={copy.sections.customer} id="section-customer">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fields.phone.label}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={fields.phone.placeholder}
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fields.customerName.label}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={fields.customerName.placeholder}
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={control}
              name="customerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fields.customerType.label}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(fields.customerType.options).map(
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
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fields.profession.label}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={fields.profession.placeholder}
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fields.area.label}</FormLabel>
                  <FormControl>
                    <Input placeholder={fields.area.placeholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fields.gender.label}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={fields.gender.placeholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(fields.gender.options).map(
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
              name="ageGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fields.ageGroup.label}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={fields.ageGroup.placeholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(fields.ageGroup.options).map(
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
          </div>
        </FormSection>
      )}

      {shouldShowSection("activity", activeSection, mode) && (
        <FormSection title={copy.sections.activity} id="section-activity">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={control}
              name="activityType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fields.activityType.label}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(fields.activityType.options).map(
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
              name="locationLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fields.locationLabel.label}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={fields.locationLabel.placeholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={control}
              name="activityDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fields.activityDate.label}</FormLabel>
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
            <FormField
              control={control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fields.startTime.label}</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      value={field.value ? formatTimeForInput(field.value) : ""}
                      onChange={(event) => {
                        field.onChange(parseTimeInput(event.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fields.endTime.label}</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      value={field.value ? formatTimeForInput(field.value) : ""}
                      onChange={(event) => {
                        if (!event.target.value) {
                          field.onChange(undefined);
                          return;
                        }
                        field.onChange(parseTimeInput(event.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {totalDurationLabel && (
            <p className="text-sm text-text-secondary">
              {fields.totalDuration.label}:{" "}
              <span className="font-medium text-text-primary">
                {totalDurationLabel}
              </span>
            </p>
          )}
        </FormSection>
      )}

      {shouldShowSection("scheme", activeSection, mode) && (
        <SchemePitchOutcomeSection
          title={copy.sections.scheme}
          copy={getSchemePitchCopy(copy)}
          control={control}
          enrollmentOutcome={enrollmentOutcome}
          id="section-scheme"
        />
      )}

      {shouldShowSection("noEnrollment", activeSection, mode) &&
        (enrollmentOutcome === "DECLINED" || enrollmentOutcome === "CALLBACK") && (
          <FormSection
            title={copy.sections.noEnrollment}
            id="section-no-enrollment"
          >
            <FormField
              control={control}
              name="reasonNoEnrollment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fields.reasonNoEnrollment.label}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>
        )}

      {shouldShowSection("followUp", activeSection, mode) && (
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>
      )}
    </div>
  );
}
