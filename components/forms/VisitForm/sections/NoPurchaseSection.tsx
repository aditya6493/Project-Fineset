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
import { FormSection } from "../FormSection";
import type { VisitFormCopy, VisitFormValues } from "../VisitForm.types";

interface NoPurchaseSectionProps {
  copy: VisitFormCopy;
  control: Control<VisitFormValues>;
}

export function NoPurchaseSection({ copy, control }: NoPurchaseSectionProps) {
  const fields = copy.fields;

  return (
    <FormSection title={copy.sections.noPurchase} id="section-no-purchase">
      <FormField
        control={control}
        name="reasonNoPurchase"
        render={({ field }) => (
          <FormItem className="max-w-md">
            <FormLabel>{fields.reasonNoPurchase.label}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value ?? ""}>
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
  );
}
