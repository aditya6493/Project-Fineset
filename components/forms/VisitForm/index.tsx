"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createVisitSchema } from "@/lib/validations/visit.schema";
import { useCreateVisit } from "@/hooks/useVisits";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "./FormSection";
import { VisitFormSections } from "./VisitFormSections";
import { VisitFormSuccess } from "./VisitFormSuccess";
import { clearVisitDraft, loadVisitDraft, useVisitDraft } from "./useVisitDraft";
import {
  buildSections,
  getDefaultVisitValues,
  getSectionFieldNames,
  type VisitFormProps,
  type VisitFormValues,
} from "./VisitForm.types";

export function VisitForm({ copy, common, errors }: VisitFormProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const draft = useMemo(() => loadVisitDraft(), []);
  const form = useForm<VisitFormValues>({
    resolver: zodResolver(createVisitSchema),
    defaultValues: getDefaultVisitValues(draft),
    mode: "onBlur",
  });

  const { watch, control, handleSubmit, reset, trigger } = form;
  const purchaseStatus = watch("purchaseStatus");
  const sections = useMemo(
    () => buildSections(copy, purchaseStatus),
    [copy, purchaseStatus],
  );

  const createVisitMutation = useCreateVisit();
  useVisitDraft(watch, reset, !isSuccess);

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
    const savedDraft = loadVisitDraft();
    reset(getDefaultVisitValues(savedDraft));
    setStepIndex(0);
    setSubmitError(null);
    setIsSuccess(false);
  }, [reset]);

  async function validateCurrentStep(): Promise<boolean> {
    if (!activeSection) return true;

    if (activeSection === "noPurchase" && purchaseStatus !== "NOT_PURCHASED") {
      return true;
    }

    return trigger(getSectionFieldNames(activeSection));
  }

  async function handleNext() {
    const valid = await validateCurrentStep();
    if (!valid) return;
    setStepIndex((current) => Math.min(current + 1, sections.length - 1));
  }

  function handlePrevious() {
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  async function onSubmit(values: VisitFormValues) {
    setSubmitError(null);

    try {
      await createVisitMutation.mutateAsync(values);
      clearVisitDraft();
      setIsSuccess(true);
    } catch {
      setSubmitError(errors.generic);
    }
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:space-y-6">
        <ProgressIndicator
          label={progressLabel}
          current={stepIndex + 1}
          total={sections.length}
        />

        <div className="lg:hidden">
          <VisitFormSections
            copy={copy}
            control={control}
            watch={watch}
            activeSection={activeSection}
            mode="wizard"
          />
        </div>

        <div className="hidden lg:block">
          <VisitFormSections
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
              {!isLastStep ? (
                <Button type="button" className="flex-1" onClick={handleNext}>
                  {common.next}
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createVisitMutation.isPending}
                >
                  {createVisitMutation.isPending
                    ? copy.actions.saving
                    : copy.actions.submit}
                </Button>
              )}
            </div>

            <Button
              type="submit"
              className="hidden w-full lg:inline-flex lg:w-auto lg:min-w-[200px]"
              disabled={createVisitMutation.isPending}
            >
              {createVisitMutation.isPending
                ? copy.actions.saving
                : copy.actions.submit}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
