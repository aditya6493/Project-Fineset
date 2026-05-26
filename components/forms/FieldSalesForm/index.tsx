"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFieldSaleSchema } from "@/lib/validations/field-sale.schema";
import { useCreateFieldSale } from "@/hooks/useFieldSales";
import { toast } from "@/hooks/useToast";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "@/components/forms/VisitForm/FormSection";
import { VisitFormSuccess } from "@/components/forms/VisitForm/VisitFormSuccess";
import { FieldSalesFormSections } from "./FieldSalesFormSections";
import {
  buildFieldSalesSections,
  getDefaultFieldSaleValues,
  getSectionFieldNames,
  type FieldSalesFormProps,
  type FieldSalesFormValues,
} from "./FieldSalesForm.types";

export function FieldSalesForm({ copy, common, errors }: FieldSalesFormProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<FieldSalesFormValues>({
    resolver: zodResolver(createFieldSaleSchema),
    defaultValues: getDefaultFieldSaleValues(),
    mode: "onBlur",
  });

  const { watch, control, handleSubmit, reset, trigger } = form;
  const enrollmentOutcome = watch("enrollmentOutcome");
  const sections = useMemo(
    () => buildFieldSalesSections(copy, enrollmentOutcome),
    [copy, enrollmentOutcome],
  );

  const createFieldSaleMutation = useCreateFieldSale();

  const activeSection = sections[stepIndex]?.id;
  const isLastStep = stepIndex >= sections.length - 1;

  useEffect(() => {
    if (stepIndex >= sections.length) {
      setStepIndex(Math.max(sections.length - 1, 0));
    }
  }, [sections.length, stepIndex]);

  const progressLabel = copy.progress
    .replace("{current}", String(stepIndex + 1))
    .replace("{total}", String(sections.length));

  const resetForm = useCallback(() => {
    reset(getDefaultFieldSaleValues());
    setStepIndex(0);
    setSubmitError(null);
    setIsSuccess(false);
  }, [reset]);

  async function validateCurrentStep(): Promise<boolean> {
    if (!activeSection) return true;

    if (
      activeSection === "noEnrollment" &&
      enrollmentOutcome !== "DECLINED" &&
      enrollmentOutcome !== "CALLBACK"
    ) {
      return true;
    }

    return trigger(getSectionFieldNames(activeSection, enrollmentOutcome));
  }

  function handlePrevious() {
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  async function onSubmit(values: FieldSalesFormValues) {
    setSubmitError(null);

    try {
      await createFieldSaleMutation.mutateAsync(values);
      toast({ title: copy.actions.successTitle, description: copy.actions.successMessage });
      setIsSuccess(true);
    } catch {
      setSubmitError(errors.generic);
      toast({ title: errors.generic });
    }
  }

  async function handleMobilePrimaryAction() {
    if (createFieldSaleMutation.isPending) return;

    const valid = await validateCurrentStep();
    if (!valid) return;

    if (!isLastStep) {
      setStepIndex((current) => Math.min(current + 1, sections.length - 1));
      return;
    }

    await handleSubmit(onSubmit)();
  }

  function handleFormKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter") return;
    if (event.target instanceof HTMLTextAreaElement) return;
    if (!window.matchMedia("(max-width: 1023px)").matches) return;

    event.preventDefault();
    void handleMobilePrimaryAction();
  }

  if (isSuccess) {
    return (
      <VisitFormSuccess
        title={copy.actions.successTitle}
        message={copy.actions.successMessage}
        logAnotherLabel={copy.actions.logAnother}
        onLogAnother={resetForm}
      />
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => event.preventDefault()}
        onKeyDown={handleFormKeyDown}
        className="space-y-4 lg:space-y-6"
      >
        <ProgressIndicator
          label={progressLabel}
          current={stepIndex + 1}
          total={sections.length}
        />

        <div className="lg:hidden">
          <FieldSalesFormSections
            copy={copy}
            control={control}
            watch={watch}
            activeSection={activeSection}
            mode="wizard"
          />
        </div>

        <div className="hidden lg:block">
          <FieldSalesFormSections
            copy={copy}
            control={control}
            watch={watch}
            mode="full"
          />
        </div>

        {submitError && (
          <p className="text-sm text-status-error" role="alert">
            {submitError}
          </p>
        )}

        <div className="sticky bottom-0 z-10 -mx-page-x border-t border-border bg-surface-primary/95 px-page-x py-4 backdrop-blur lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex gap-2 lg:hidden">
              {stepIndex > 0 && (
                <Button type="button" variant="outline" onClick={handlePrevious}>
                  {common.previous}
                </Button>
              )}
              <Button
                type="button"
                className="flex-1"
                disabled={createFieldSaleMutation.isPending}
                onClick={() => void handleMobilePrimaryAction()}
              >
                {createFieldSaleMutation.isPending
                  ? copy.actions.saving
                  : !isLastStep
                    ? common.next
                    : copy.actions.submit}
              </Button>
            </div>

            <Button
              type="button"
              onClick={() => void handleSubmit(onSubmit)()}
              className="hidden w-full lg:inline-flex lg:w-auto lg:min-w-[200px]"
              disabled={createFieldSaleMutation.isPending}
            >
              {createFieldSaleMutation.isPending
                ? copy.actions.saving
                : copy.actions.submit}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
