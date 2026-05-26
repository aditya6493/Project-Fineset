import type { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSection } from "../FormSection";
import type { VisitFormCopy, VisitFormValues } from "../VisitForm.types";

interface PreferencesSectionProps {
  copy: VisitFormCopy;
  control: Control<VisitFormValues>;
}

export function PreferencesSection({ copy, control }: PreferencesSectionProps) {
  const fields = copy.fields;

  return (
    <FormSection title={copy.sections.preferences} id="section-preferences">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FormField
          control={control}
          name="purchaseOccasion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{fields.purchaseOccasion.label}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
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
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
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
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
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
    </FormSection>
  );
}
