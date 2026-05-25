"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createStaffSchema, type CreateStaffInput } from "@/lib/validations/staff.schema";
import { useCreateStaff, useStoreStaff, useUpdateStaff } from "@/hooks/useStaff";
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

type StoreContent = Content["store"];
type ErrorsContent = Content["errors"];

interface StaffManagementProps {
  store: StoreContent;
  emptyMessage: string;
  errors: ErrorsContent;
}

export function StaffManagement({ store, emptyMessage, errors }: StaffManagementProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data, isLoading } = useStoreStaff();
  const createStaffMutation = useCreateStaff();
  const updateStaffMutation = useUpdateStaff();

  const form = useForm<CreateStaffInput>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: { name: "", employeeId: "" },
  });

  async function onSubmit(values: CreateStaffInput) {
    setSubmitError(null);
    try {
      await createStaffMutation.mutateAsync(values);
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
          {store.staff.title}
        </h1>
        <Button type="button" onClick={() => setModalOpen(true)}>
          {store.staff.addStaff}
        </Button>
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-card bg-surface-secondary" />
      ) : !data || data.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface-card shadow-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-surface-secondary">
              <tr>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {store.staff.columns.name}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {store.staff.columns.employeeId}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {store.staff.columns.visits}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {store.staff.columns.revenue}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {store.staff.columns.conversionRate}
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  {store.staff.columns.status}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((member) => (
                <tr key={member.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{member.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{member.employeeId}</td>
                  <td className="px-4 py-3">{member.monthlyVisits}</td>
                  <td className="px-4 py-3">{formatCurrency(member.monthlyRevenue)}</td>
                  <td className="px-4 py-3">{formatPercent(member.conversionRate)}</td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      size="sm"
                      variant={member.isActive ? "outline" : "secondary"}
                      disabled={updateStaffMutation.isPending}
                      onClick={() =>
                        updateStaffMutation.mutate({
                          staffId: member.id,
                          payload: { isActive: !member.isActive },
                        })
                      }
                    >
                      {member.isActive ? store.staff.active : store.staff.inactive}
                    </Button>
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
            <DialogTitle>{store.staff.modal.title}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{store.staff.modal.nameLabel}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{store.staff.modal.employeeIdLabel}</FormLabel>
                    <FormControl>
                      <Input {...field} className="uppercase" />
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
              <Button type="submit" className="w-full" disabled={createStaffMutation.isPending}>
                {store.staff.addStaff}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
