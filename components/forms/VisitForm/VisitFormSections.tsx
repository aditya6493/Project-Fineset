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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChipMultiSelect } from "@/components/shared/ChipMultiSelect";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FormSection } from "./FormSection";
import type { VisitFormCopy, VisitFormSectionId, VisitFormValues } from "./VisitForm.types";
import {
  formatDateForInput,
  formatTimeForInput,
  parseDateInput,
  parseTimeInput,
} from "./VisitForm.types";

interface VisitFormSectionsProps {
  copy: VisitFormCopy;
  control: Control<VisitFormValues>;
  watch: UseFormWatch<VisitFormValues>;
  activeSection?: VisitFormSectionId;
  mode: "wizard" | "full";
}

function shouldShowSection(
  sectionId: VisitFormSectionId,
  activeSection: VisitFormSectionId | undefined,
  mode: "wizard" | "full",
): boolean {
  if (mode === "full") return true;
  return sectionId === activeSection;
}

export function VisitFormSections({
  copy,
  control,
  watch,
  activeSection,
  mode,
}: VisitFormSectionsProps) {
  const purchaseStatus = watch("purchaseStatus");
  const followUpNeeded = watch("followUpNeeded");
  const fields = copy.fields;

  return (
    <div className="space-y-4 lg:space-y-6">
      {shouldShowSection("customer", activeSection, mode) && (
        <FormSection title={copy.sections.customer} id="section-customer">
          <div className="grid gap-4 sm:grid-cols-2">
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
              name="visitType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fields.visitType.label}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4 pt-1"
                    >
                      {Object.entries(fields.visitType.options).map(
                        ([value, label]) => (
                          <div key={value} className="flex items-center gap-2">
                            <RadioGroupItem value={value} id={`visit-type-${value}`} />
                            <Label htmlFor={`visit-type-${value}`}>{label}</Label>
                          </div>
                        ),
                      )}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={control}
              name="inTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fields.inTime.label}</FormLabel>
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
              name="sourceChannel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fields.sourceChannel.label}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(fields.sourceChannel.options).map(
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
                        <SelectValue placeholder="—" />
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
                        <SelectValue placeholder="—" />
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

      {shouldShowSection("visit", activeSection, mode) && (
        <FormSection title={copy.sections.visit} id="section-visit">
          <FormField
            control={control}
            name="productsExplored"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <ChipMultiSelect
                    label={fields.productsExplored.label}
                    options={fields.productsExplored.options}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="purchaseStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fields.purchaseStatus.label}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid gap-2 sm:grid-cols-3"
                  >
                    {Object.entries(fields.purchaseStatus.options).map(
                      ([value, label]) => (
                        <div key={value} className="flex items-center gap-2">
                          <RadioGroupItem
                            value={value}
                            id={`purchase-status-${value}`}
                          />
                          <Label htmlFor={`purchase-status-${value}`}>{label}</Label>
                        </div>
                      ),
                    )}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {purchaseStatus === "PURCHASED" && (
            <>
              <FormField
                control={control}
                name="productsPurchased"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <ChipMultiSelect
                        label={fields.productsPurchased.label}
                        options={fields.productsExplored.options}
                        value={field.value ?? []}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="transactionAmount"
                render={({ field }) => (
                  <FormItem className="max-w-xs">
                    <FormLabel>{fields.transactionAmount.label}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder={fields.transactionAmount.placeholder}
                        value={field.value ?? ""}
                        onChange={(event) => {
                          const val = event.target.value;
                          field.onChange(val ? Number(val) : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={control}
            name="intentTier"
            render={({ field }) => (
              <FormItem className="max-w-xs">
                <FormLabel>{fields.intentTier.label}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(fields.intentTier.options).map(
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
        </FormSection>
      )}

      {purchaseStatus === "NOT_PURCHASED" &&
        shouldShowSection("noPurchase", activeSection, mode) && (
          <FormSection title={copy.sections.noPurchase} id="section-no-purchase">
            <FormField
              control={control}
              name="reasonNoPurchase"
              render={({ field }) => (
                <FormItem className="max-w-md">
                  <FormLabel>{fields.reasonNoPurchase.label}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(fields.reasonNoPurchase.options).map(
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
                <FormItem className="max-w-md">
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

      {shouldShowSection("preferences", activeSection, mode) && (
        <FormSection title={copy.sections.preferences} id="section-preferences">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={control}
              name="purchaseOccasion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fields.purchaseOccasion.label}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(fields.purchaseOccasion.options).map(
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
              name="metalKtPref"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fields.metalKtPref.label}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(fields.metalKtPref.options).map(
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
              name="budgetStated"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fields.budgetStated.label}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(fields.budgetStated.options).map(
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

          <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
            <FormField
              control={control}
              name="schemeEnrolled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 rounded-input border border-border px-4 py-3 sm:w-64">
                  <FormLabel className="mt-0">{fields.schemeEnrolled.label}</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="ghsPolicy"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 rounded-input border border-border px-4 py-3 sm:w-64">
                  <FormLabel className="mt-0">{fields.ghsPolicy.label}</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </FormSection>
      )}

      {shouldShowSection("followUp", activeSection, mode) && (
        <FormSection title={copy.sections.followUp} id="section-follow-up">
          <FormField
            control={control}
            name="followUpNeeded"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4 rounded-input border border-border px-4 py-3 sm:max-w-md">
                <FormLabel className="mt-0">{fields.followUpNeeded.label}</FormLabel>
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
                <FormItem className="max-w-xs">
                  <FormLabel>{fields.followUpDate.label}</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? formatDateForInput(field.value) : ""}
                      onChange={(event) => {
                        if (event.target.value) {
                          field.onChange(parseDateInput(event.target.value));
                        } else {
                          field.onChange(undefined);
                        }
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
                    maxLength={500}
                    rows={4}
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
