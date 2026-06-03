"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { createStoreSchema, type CreateStoreInput } from "@/lib/validations/store.schema";
import { generateSecurePassword } from "@/lib/auth/generate-password";
import { useCreateStore, useStores, useUpdateStore } from "@/hooks/useStores";
import { toast } from "@/hooks/useToast";
import { formatCurrency, formatPercent } from "@/lib/utils/formatters";
import { getStoreCategoryLabel } from "@/lib/utils/store-category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { ApiError } from "@/types";
import type { StoreCategory } from "@/types";

type AdminContent = Content["admin"];
type ErrorsContent = Content["errors"];

const defaultFormValues: CreateStoreInput = {
  name: "",
  category: "JEWELRY",
  city: "",
  state: "",
  pincode: "",
  pocName: "",
  pointOfContactPhone: "",
  email: "",
  managerPassword: "",
};

interface StoresManagementProps {
  admin: AdminContent;
  emptyMessage: string;
  errors: ErrorsContent;
  initialStores?: import("@/types").PaginatedResponse<{
    id: string;
    name: string;
    category: StoreCategory;
    city: string;
    state: string;
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
  emptyMessage,
  errors,
  initialStores,
  initialStoresParams,
}: StoresManagementProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const storesParams = { page: 1, pageSize: 50 };
  const { data, isLoading } = useStores(storesParams, {
    initialData: initialStores,
    initialParams: initialStoresParams ?? storesParams,
  });
  const createStoreMutation = useCreateStore();
  const updateStoreMutation = useUpdateStore();

  const form = useForm<CreateStoreInput>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: defaultFormValues,
  });

  const category = form.watch("category");

  function resetModalState() {
    form.reset(defaultFormValues);
    setSubmitError(null);
    setShowPassword(false);
    setCreatedCredentials(null);
  }

  function handleModalOpenChange(open: boolean) {
    setModalOpen(open);
    if (!open) {
      resetModalState();
    }
  }

  function storeCreateErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
      const message = error.body.message?.trim();
      if (message && message !== "Request failed") return message;

      if (error.status === 400 && error.body.details) {
        return "Check the form fields — one or more values are invalid.";
      }
      if (error.status === 503) {
        return "Database connection is temporarily unavailable. Fix Vercel DATABASE_URL and redeploy.";
      }
      if (error.status === 502) {
        return message || "Could not create store login. Check SUPABASE_SERVICE_ROLE_KEY on Vercel.";
      }
      if (error.status === 409) {
        return message || "This manager email is already registered.";
      }
    }
    if (error instanceof Error && /failed to fetch|network/i.test(error.message)) {
      return "Cannot reach the server. Check your connection and try again.";
    }
    return errors.generic;
  }

  async function onSubmit(values: CreateStoreInput) {
    setSubmitError(null);
    try {
      const result = await createStoreMutation.mutateAsync(values);
      setCreatedCredentials({
        email: result.manager.email,
        password: values.managerPassword,
      });
      toast({
        title: admin.stores.modal.createSuccessTitle,
        description: admin.stores.modal.createSuccessDescription,
      });
    } catch (error) {
      const message = storeCreateErrorMessage(error);
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
        <div aria-live="polite" aria-busy="true" className="space-y-3">
          <Skeleton className="h-48 rounded-card" />
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface-card shadow-card">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-border bg-surface-secondary">
              <tr>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {admin.stores.columns.name}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {admin.stores.columns.category}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {admin.stores.columns.city}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {admin.stores.columns.staffCount}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {admin.stores.columns.revenue}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {admin.stores.columns.status}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((store) => (
                <tr key={store.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/dashboard/stores/${store.id}`}
                      prefetch={false}
                      className="font-medium text-text-primary hover:text-brand-gold"
                    >
                      {store.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {getStoreCategoryLabel(store.category as StoreCategory)}
                  </td>
                  <td className="px-4 py-3">{store.city}</td>
                  <td className="px-4 py-3">{store.staffCount}</td>
                  <td className="px-4 py-3">{formatCurrency(store.revenue)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-text-secondary">
                        {formatPercent(store.conversionRate)}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant={store.isActive ? "outline" : "secondary"}
                        disabled={updateStoreMutation.isPending}
                        onClick={() =>
                          updateStoreMutation.mutate(
                            {
                              storeId: store.id,
                              payload: { isActive: !store.isActive },
                            },
                            {
                              onSuccess: () => {
                                toast({
                                  title: store.isActive
                                    ? admin.table.inactive
                                    : admin.table.active,
                                });
                              },
                              onError: () => toast({ title: errors.generic }),
                            },
                          )
                        }
                      >
                        {store.isActive ? admin.table.active : admin.table.inactive}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={handleModalOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{admin.stores.modal.title}</DialogTitle>
            {createdCredentials ? (
              <DialogDescription asChild>
                <div className="space-y-3 pt-2 text-left text-sm text-text-secondary">
                  <p>{admin.stores.modal.createSuccessDescription}</p>
                  <div className="rounded-md border border-border bg-surface-secondary p-3 space-y-2">
                    <p>
                      <span className="font-medium text-text-primary">Email: </span>
                      {createdCredentials.email}
                    </p>
                    <p>
                      <span className="font-medium text-text-primary">Password: </span>
                      <span className="font-mono">{createdCredentials.password}</span>
                    </p>
                  </div>
                  <p className="text-xs">{admin.stores.modal.managerPasswordHint}</p>
                </div>
              </DialogDescription>
            ) : null}
          </DialogHeader>

          {createdCredentials ? (
            <Button
              type="button"
              className="w-full"
              onClick={() => handleModalOpenChange(false)}
            >
              Done
            </Button>
          ) : (
            <Form {...form}>
              <form
                onSubmit={(event) => {
                  setSubmitError(null);
                  void form.handleSubmit(onSubmit)(event);
                }}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{admin.stores.modal.nameLabel}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter store name" />
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
                {category === "OTHER" && (
                  <FormField
                    control={form.control}
                    name="customCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{admin.stores.modal.customCategoryLabel}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={admin.stores.modal.customCategoryPlaceholder}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{admin.stores.modal.cityLabel}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter city" />
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
                        <Input {...field} placeholder="Enter state" />
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
                        <Input {...field} inputMode="numeric" placeholder="6-digit pincode" />
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
                        <Input {...field} placeholder="Point of contact name" />
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
                          inputMode="numeric"
                          placeholder="10-digit mobile number"
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
                          autoComplete="off"
                          placeholder="manager@store.example"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="managerPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{admin.stores.modal.managerPasswordLabel}</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="Generate secure password"
                          onClick={() =>
                            form.setValue("managerPassword", generateSecurePassword(), {
                              shouldValidate: true,
                            })
                          }
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-text-secondary">
                        {admin.stores.modal.managerPasswordHint}
                      </p>
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
