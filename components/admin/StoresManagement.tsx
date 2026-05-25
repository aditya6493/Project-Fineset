"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createStoreSchema, type CreateStoreInput } from "@/lib/validations/store.schema";
import { useCreateStore, useStores, useUpdateStore } from "@/hooks/useStores";
import { formatCurrency, formatPercent } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { EmptyState } from "@/components/shared/EmptyState";
import type { Content } from "@/content/en";

type AdminContent = Content["admin"];
type ErrorsContent = Content["errors"];

interface StoresManagementProps {
  admin: AdminContent;
  emptyMessage: string;
  errors: ErrorsContent;
}

export function StoresManagement({
  admin,
  emptyMessage,
  errors,
}: StoresManagementProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data, isLoading } = useStores({ page: 1, pageSize: 50 });
  const createStoreMutation = useCreateStore();
  const updateStoreMutation = useUpdateStore();

  const form = useForm<CreateStoreInput>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: { name: "", city: "", state: "", pincode: "" },
  });

  async function onSubmit(values: CreateStoreInput) {
    setSubmitError(null);
    try {
      await createStoreMutation.mutateAsync(values);
      form.reset();
      setModalOpen(false);
    } catch {
      setSubmitError(errors.generic);
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
        <div className="h-48 animate-pulse rounded-card bg-surface-secondary" />
      ) : !data || data.data.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface-card shadow-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-surface-secondary">
              <tr>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {admin.stores.columns.name}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {admin.stores.columns.city}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {admin.stores.columns.pincode}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {admin.stores.columns.staffCount}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {admin.stores.columns.revenueMtd}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {admin.stores.columns.status}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((store) => (
                <tr key={store.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{store.name}</td>
                  <td className="px-4 py-3">{store.city}</td>
                  <td className="px-4 py-3">{store.pincode}</td>
                  <td className="px-4 py-3">{store.staffCount}</td>
                  <td className="px-4 py-3">{formatCurrency(store.revenueMtd)}</td>
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
                          updateStoreMutation.mutate({
                            storeId: store.id,
                            payload: { isActive: !store.isActive },
                          })
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
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{admin.stores.modal.pincodeLabel}</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={6} />
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
