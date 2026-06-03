"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { generateSecurePassword } from "@/lib/auth/generate-password";
import { createStoreSchema, type CreateStoreInput } from "@/lib/validations/store.schema";
import { useCreateStore, useStores } from "@/hooks/useStores";
import { StoreListCard } from "@/components/admin/StoreListCard";
import { toast } from "@/hooks/useToast";
import { ApiError } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
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
import { EmptyState } from "@/components/shared/EmptyState";
import type { Content } from "@/content/en";
import type { StoreCategory } from "@/types";

type AdminContent = Content["admin"];
type ErrorsContent = Content["errors"];

interface StoresManagementProps {
  admin: AdminContent;
  common: Content["common"];
  emptyMessage: string;
  errors: ErrorsContent;
  initialStores?: import("@/types").PaginatedResponse<{
    id: string;
    name: string;
    category: StoreCategory;
    customCategory?: string | null;
    city: string;
    state: string;
    pincode?: string | null;
    pocName?: string | null;
    pointOfContactPhone?: string | null;
    email?: string | null;
    isActive: boolean;
    staffCount: number;
    visits: number;
    revenue: number;
    conversionRate: number;
    createdAt: string;
  }>;
  initialStoresParams?: { page?: number; pageSize?: number; search?: string };
}

export function StoresManagement({
  admin,
  common,
  emptyMessage,
  errors,
  initialStores,
  initialStoresParams,
}: StoresManagementProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const storesParams = { page: 1, pageSize: 50 };
  const { data, isLoading } = useStores(storesParams, {
    initialData: initialStores,
    initialParams: initialStoresParams ?? storesParams,
  });
  const createStoreMutation = useCreateStore();

  const form = useForm<CreateStoreInput>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      name: "",
      category: "JEWELRY",
      city: "",
      state: "",
      pincode: "",
      pocName: "",
      pointOfContactPhone: "",
      email: "",
      password: "",
    },
  });

  function handleSuggestPassword() {
    form.setValue("password", generateSecurePassword(), { shouldValidate: true });
  }

  async function onSubmit(values: CreateStoreInput) {
    setSubmitError(null);
    try {
      await createStoreMutation.mutateAsync(values);
      toast({ title: admin.stores.addStore, description: admin.stores.modal.title });
      form.reset({
        name: "",
        category: "JEWELRY",
        city: "",
        state: "",
        pincode: "",
        pocName: "",
        pointOfContactPhone: "",
        email: "",
        password: "",
      });
      setShowPassword(false);
      setModalOpen(false);
    } catch (error) {
      const message =
        error instanceof ApiError ? (error.body.message ?? errors.generic) : errors.generic;
      setSubmitError(message);
      toast({ title: message });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          {admin.stores.title}
        </h1>
        <Button type="button" onClick={() => setModalOpen(true)}>
          {admin.stores.addStore}
        </Button>
      </div>

      {isLoading ? (
        <div
          aria-live="polite"
          aria-busy="true"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-56 rounded-card" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <ul className="grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.data.map((store) => (
            <li key={store.id}>
              <StoreListCard
                store={{
                  id: store.id,
                  name: store.name,
                  category: store.category as StoreCategory,
                  customCategory: store.customCategory,
                  city: store.city,
                  state: store.state,
                  pincode: store.pincode,
                  pocName: store.pocName,
                  pointOfContactPhone: store.pointOfContactPhone,
                  email: store.email,
                  isActive: store.isActive,
                  staffCount: store.staffCount,
                }}
                storesCopy={admin.stores}
                categories={admin.categories}
                common={common}
                errors={errors}
                statusActiveLabel={admin.table.active}
                statusInactiveLabel={admin.table.inactive}
              />
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setShowPassword(false);
            setSubmitError(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{admin.stores.modal.title}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{admin.stores.modal.nameLabel}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={admin.stores.modal.namePlaceholder}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{admin.stores.modal.categoryLabel}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(admin.categories).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
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
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{admin.stores.modal.cityLabel}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={admin.stores.modal.cityPlaceholder}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{admin.stores.modal.stateLabel}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={admin.stores.modal.statePlaceholder}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{admin.stores.modal.pincodeLabel}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        inputMode="numeric"
                        maxLength={6}
                        placeholder={admin.stores.modal.pincodePlaceholder}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pocName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{admin.stores.modal.pocNameLabel}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={admin.stores.modal.pocNamePlaceholder}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pointOfContactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{admin.stores.modal.pointOfContactPhoneLabel}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder={admin.stores.modal.pointOfContactPhonePlaceholder}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{admin.stores.modal.emailLabel}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        autoComplete="email"
                        placeholder={admin.stores.modal.emailPlaceholder}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-2">
                      <FormLabel>{admin.stores.modal.passwordLabel}</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto px-2 py-1 text-xs text-brand-gold"
                        onClick={handleSuggestPassword}
                      >
                        <Sparkles className="mr-1 size-3.5" aria-hidden="true" />
                        {admin.stores.modal.suggestPassword}
                      </Button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder={admin.stores.modal.passwordPlaceholder}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword((value) => !value)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="size-4 text-text-muted" aria-hidden="true" />
                          ) : (
                            <Eye className="size-4 text-text-muted" aria-hidden="true" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <p className="text-xs text-text-muted">{admin.stores.modal.passwordHint}</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitError && (
                <p className="text-sm text-status-error" role="alert">
                  {submitError}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={createStoreMutation.isPending}
              >
                {admin.stores.addStore}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
