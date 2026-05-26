"use client";

import { useEffect, useRef, useState } from "react";
import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { lookupCustomerByPhone } from "@/lib/api/customers";
import type { VisitFormValues } from "@/components/forms/VisitForm/VisitForm.types";

const LOOKUP_DEBOUNCE_MS = 400;

const GENDER_VALUES = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"] as const;
const AGE_GROUP_VALUES = ["18-25", "26-35", "36-50", "50+"] as const;

type VisitGender = NonNullable<VisitFormValues["gender"]>;
type VisitAgeGroup = NonNullable<VisitFormValues["ageGroup"]>;

function isGender(value: string): value is VisitGender {
  return (GENDER_VALUES as readonly string[]).includes(value);
}

function isAgeGroup(value: string): value is VisitAgeGroup {
  return (AGE_GROUP_VALUES as readonly string[]).includes(value);
}

export type CustomerLookupStatus = "idle" | "loading" | "found" | "not_found";

interface UseCustomerLookupPrefillOptions {
  watch: UseFormWatch<VisitFormValues>;
  setValue: UseFormSetValue<VisitFormValues>;
}

export function useCustomerLookupPrefill({
  watch,
  setValue,
}: UseCustomerLookupPrefillOptions) {
  const customerPhone = watch("customerPhone");
  const [status, setStatus] = useState<CustomerLookupStatus>("idle");
  const lastLookedUpPhoneRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const normalizedPhone = customerPhone.replace(/\D/g, "");

    if (normalizedPhone.length !== 10) {
      setStatus("idle");
      if (normalizedPhone.length < 10) {
        lastLookedUpPhoneRef.current = null;
      }
      return;
    }

    if (lastLookedUpPhoneRef.current === normalizedPhone) {
      return;
    }

    setStatus("loading");
    const requestId = ++requestIdRef.current;

    const timer = setTimeout(() => {
      void lookupCustomerByPhone(normalizedPhone)
        .then((customer) => {
          if (requestId !== requestIdRef.current) return;

          lastLookedUpPhoneRef.current = normalizedPhone;

          if (!customer) {
            setStatus("not_found");
            return;
          }

          setValue("customerName", customer.name, { shouldDirty: true });
          if (customer.area) {
            setValue("area", customer.area, { shouldDirty: true });
          }
          if (customer.gender && isGender(customer.gender)) {
            setValue("gender", customer.gender, { shouldDirty: true });
          }
          if (customer.ageGroup && isAgeGroup(customer.ageGroup)) {
            setValue("ageGroup", customer.ageGroup, { shouldDirty: true });
          }
          setValue("customerType", "REPEAT", { shouldDirty: true });

          setStatus("found");
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setStatus("idle");
        });
    }, LOOKUP_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [customerPhone, setValue]);

  return { lookupStatus: status };
}
