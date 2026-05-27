"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createStoreSchema, type CreateStoreInput } from "@/lib/validations/store.schema";
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

  const storesParams = { page: 1, pageSize: 50 };
  const { data, isLoading } = useStores(storesParams, {
    initialData: initialStores,
    initialParams: initialStoresParams ?? storesParams,
  });
  const createStoreMutation = useCreateStore();
  const updateStoreMutation = useUpdateStore();

  const form = useForm<CreateStoreInput>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      name: "",
      category: "JEWELRY",
      city: "",
      state: "",
    },
  });

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
      });
      setModalOpen(false);
    } catch {
      setSubmitError(errors.generic);
      toast({ title: errors.generic });
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
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
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
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
