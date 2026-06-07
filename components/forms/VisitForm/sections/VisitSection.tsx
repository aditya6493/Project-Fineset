import type { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChipMultiSelect } from "@/components/shared/ChipMultiSelect";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { FormSection } from "../FormSection";
import type { VisitFormCopy, VisitFormValues } from "../VisitForm.types";

interface VisitSectionProps {
  copy: VisitFormCopy;
  control: Control<VisitFormValues>;
  purchaseStatus: VisitFormValues["purchaseStatus"];
}

export function VisitSection({ copy, control, purchaseStatus }: VisitSectionProps) {
  const fields = copy.fields;

  return (
    <FormSection title={copy.sections.visit} id="section-visit">
      <FormField
        control={control}
        name="purchaseStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fields.purchaseStatus.label}</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value ?? ""}
                className="grid gap-2 sm:grid-cols-2"
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

      {purchaseStatus === "NOT_PURCHASED" && (
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
      )}

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
                  <CurrencyInput
                    placeholder={fields.transactionAmount.placeholder}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </FormSection>
  );
}
