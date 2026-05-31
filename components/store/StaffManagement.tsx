"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { createStaffSchema, type CreateStaffInput } from "@/lib/validations/staff.schema";
import { generateSecurePassword } from "@/lib/auth/generate-password";
import { useCreateStaff, useStoreStaff, useUpdateStaff } from "@/hooks/useStaff";
import { toast } from "@/hooks/useToast";
import { formatCurrency, formatPercent } from "@/lib/utils/formatters";
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
import { EmptyState } from "@/components/shared/EmptyState";
import type { Content } from "@/content/en";

type StoreContent = Content["store"];
type ErrorsContent = Content["errors"];

interface StaffManagementProps {
  store: StoreContent;
  emptyMessage: string;
  errors: ErrorsContent;
  initialStaff?: Awaited<ReturnType<typeof import("@/lib/api/staff").getStaff>>;
}

export function StaffManagement({
  store,
  emptyMessage,
  errors,
  initialStaff,
}: StaffManagementProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { data, isLoading } = useStoreStaff({ initialData: initialStaff });
  const createStaffMutation = useCreateStaff();
  const updateStaffMutation = useUpdateStaff();

  const form = useForm<CreateStaffInput>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: { name: "", email: "", employeeId: "", password: "" },
  });

  function handleSuggestPassword() {
    const password = generateSecurePassword();
    form.setValue("password", password, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setShowPassword(true);
  }

  function handleModalChange(open: boolean) {
    setModalOpen(open);
    if (!open) {
      form.reset();
      setSubmitError(null);
      setShowPassword(false);
    }
  }

  async function onSubmit(values: CreateStaffInput) {
    setSubmitError(null);
    try {
      await createStaffMutation.mutateAsync(values);
      toast({
        title: store.staff.addStaff,
        description: store.staff.accountCreated,
      });
      form.reset();
      setShowPassword(false);
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
          {store.staff.title}
        </h1>
        <Button type="button" onClick={() => setModalOpen(true)}>
          {store.staff.addStaff}
        </Button>
      </div>

      {isLoading ? (
        <div aria-live="polite" aria-busy="true">
          <Skeleton className="h-48 rounded-card" />
        </div>
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
                        updateStaffMutation.mutate(
                          {
                            staffId: member.id,
                            payload: { isActive: !member.isActive },
                          },
                          {
                            onSuccess: () => {
                              toast({
                                title: member.isActive
                                  ? store.staff.inactive
                                  : store.staff.active,
                              });
                            },
                            onError: () => toast({ title: errors.generic }),
                          },
                        )
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

      <Dialog open={modalOpen} onOpenChange={handleModalChange}>
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{store.staff.modal.emailLabel}</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" autoComplete="email" />
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-2">
                      <FormLabel>{store.staff.modal.passwordLabel}</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto px-2 py-1 text-xs text-brand-gold"
                        onClick={handleSuggestPassword}
                      >
                        <Sparkles className="mr-1 size-3.5" aria-hidden="true" />
                        {store.staff.modal.suggestPassword}
                      </Button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder={store.staff.modal.passwordPlaceholder}
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
                    <p className="text-xs text-text-muted">{store.staff.modal.passwordHint}</p>
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
