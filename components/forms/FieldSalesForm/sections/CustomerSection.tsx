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

interface CustomerSectionProps {
  copy: FieldSalesFormCopy;
  control: Control<FieldSalesFormValues>;
}

export function CustomerSection({ copy, control }: CustomerSectionProps) {
  const fields = copy.fields;

  return (
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
                  {Object.entries(fields.customerType.options).map(([value, label]) => (
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
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={fields.gender.placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(fields.gender.options).map(([value, label]) => (
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
        <FormField
          control={control}
          name="ageGroup"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{fields.ageGroup.label}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={fields.ageGroup.placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(fields.ageGroup.options).map(([value, label]) => (
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
      </div>
    </FormSection>
  );
}
