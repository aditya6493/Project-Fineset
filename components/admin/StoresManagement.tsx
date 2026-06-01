"use client";

import Link from "next/link";
import { useState } from "react";
import { EllipsisVertical } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createStoreSchema, type CreateStoreInput } from "@/lib/validations/store.schema";
import { useStoreCategories } from "@/hooks/useStoreCategories";
import { useCreateStore, useDeleteStore, useStores, useUpdateStore } from "@/hooks/useStores";
import { toast } from "@/hooks/useToast";
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
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Content } from "@/content/en";
import type { StoreCategory } from "@/types";

type AdminContent = Content["admin"];
type ErrorsContent = Content["errors"];
type StoreSummary = {
  id: string;
  name: string;
  category: StoreCategory;
  customCategory: string | null;
  city: string;
  state: string;
  pincode: string | null;
  pocName: string | null;
  pointOfContactPhone: string | null;
  email: string | null;
  isActive: boolean;
  staffCount: number;
  visits: number;
  createdAt: string;
};

type PendingAction =
  | { type: "edit"; store: StoreSummary }
  | { type: "toggleStatus"; store: StoreSummary }
  | { type: "delete"; store: StoreSummary };

interface StoresManagementProps {
  admin: AdminContent;
  emptyMessage: string;
  errors: ErrorsContent;
  initialStores?: import("@/types").PaginatedResponse<{
    id: string;
    name: string;
    category: StoreCategory;
    customCategory: string | null;
    city: string;
    state: string;
    pincode: string | null;
    pocName: string | null;
    pointOfContactPhone: string | null;
    email: string | null;
    isActive: boolean;
    staffCount: number;
    visits: number;
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
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const storesParams = { page: 1, pageSize: 50 };
  const { data, isLoading } = useStores(storesParams, {
    initialData: initialStores,
    initialParams: initialStoresParams ?? storesParams,
  });
  const createStoreMutation = useCreateStore();
  const updateStoreMutation = useUpdateStore();
  const deleteStoreMutation = useDeleteStore();
  const { data: categoryOptionsData } = useStoreCategories();
  const customCategoryOptions = categoryOptionsData?.data ?? [];

  const form = useForm<CreateStoreInput>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      name: "",
      category: "JEWELRY",
      customCategory: "",
      city: "",
      state: "",
      pincode: "",
      pocName: "",
      pointOfContactPhone: "",
      email: "",
    },
  });

  async function onSubmit(values: CreateStoreInput) {
    setSubmitError(null);
    try {
      if (editingStoreId) {
        await updateStoreMutation.mutateAsync({
          storeId: editingStoreId,
          payload: values,
        });
        toast({ title: "Store updated" });
      } else {
        await createStoreMutation.mutateAsync(values);
        toast({ title: admin.stores.addStore, description: admin.stores.modal.title });
      }
      form.reset({
        name: "",
        category: "JEWELRY",
        customCategory: "",
        city: "",
        state: "",
        pincode: "",
        pocName: "",
        pointOfContactPhone: "",
        email: "",
      });
      setEditingStoreId(null);
      setModalOpen(false);
    } catch {
      setSubmitError(errors.generic);
      toast({ title: errors.generic });
    }
  }

  function getConfirmDialogContent(action: PendingAction) {
    switch (action.type) {
      case "edit":
        return {
          title: "Edit store details?",
          description: `You are about to edit "${action.store.name}".`,
          confirmLabel: "Continue",
          destructive: false,
        };
      case "toggleStatus":
        return {
          title: action.store.isActive ? "Make store inactive?" : "Make store active?",
          description: `This will update "${action.store.name}" status.`,
          confirmLabel: action.store.isActive ? "Make Inactive" : "Make Active",
          destructive: false,
        };
      case "delete":
        return {
          title: "Delete store?",
          description: `This will permanently delete "${action.store.name}".`,
          confirmLabel: "Delete",
          destructive: true,
        };
      default:
        return {
          title: "Confirm action",
          description: "Are you sure you want to proceed?",
          confirmLabel: "Confirm",
          destructive: false,
        };
    }
  }

  async function onConfirmPendingAction() {
    if (!pendingAction) return;

    if (pendingAction.type === "edit") {
      const store = pendingAction.store;
      setEditingStoreId(store.id);
      form.reset({
        name: store.name,
        category: store.category as CreateStoreInput["category"],
        customCategory: store.customCategory ?? "",
        city: store.city,
        state: store.state,
        pincode: store.pincode ?? "",
        pocName: store.pocName ?? "",
        pointOfContactPhone: store.pointOfContactPhone ?? "",
        email: store.email ?? "",
      });
      setPendingAction(null);
      setModalOpen(true);
      return;
    }

    if (pendingAction.type === "toggleStatus") {
      const store = pendingAction.store;
      updateStoreMutation.mutate(
        {
          storeId: store.id,
          payload: { isActive: !store.isActive },
        },
        {
          onSuccess: () => {
            toast({
              title: store.isActive ? "Store made inactive" : "Store made active",
            });
            setPendingAction(null);
          },
          onError: () => {
            toast({ title: errors.generic });
            setPendingAction(null);
          },
        },
      );
      return;
    }

    deleteStoreMutation.mutate(pendingAction.store.id, {
      onSuccess: () => {
        toast({ title: "Store deleted" });
        setPendingAction(null);
      },
      onError: () => {
        toast({ title: errors.generic });
        setPendingAction(null);
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          {admin.stores.title}
        </h1>
        <Button
          type="button"
          onClick={() => {
            setEditingStoreId(null);
            form.reset({
              name: "",
              category: "JEWELRY",
              customCategory: "",
              city: "",
              state: "",
              pincode: "",
              pocName: "",
              pointOfContactPhone: "",
              email: "",
            });
            setModalOpen(true);
          }}
        >
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
        <div className="grid gap-4 md:grid-cols-2">
          {data.data.map((store) => (
            <article
              key={store.id}
              className="group overflow-hidden rounded-card border border-border bg-surface-card shadow-card transition hover:border-brand-gold/40 hover:shadow-md"
            >
              <div className="border-b border-border px-4 py-4 sm:px-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/dashboard/stores/${store.id}`}
                      className="block truncate font-display text-lg font-semibold text-text-primary group-hover:text-brand-gold"
                    >
                      {store.name}
                    </Link>
                    <p className="mt-1 text-sm text-text-muted">
                      {store.city}, {store.state}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-text-secondary">
                        {getStoreCategoryLabel(
                          store.category as StoreCategory,
                          store.customCategory,
                        )}
                      </span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-text-secondary">
                        {admin.stores.columns.pincode}: {store.pincode ?? "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        store.isActive
                          ? "rounded-full bg-status-success/10 px-2 py-0.5 text-xs font-medium text-status-success"
                          : "rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium text-text-muted"
                      }
                    >
                      {store.isActive ? admin.table.active : admin.table.inactive}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" size="icon" variant="ghost" className="h-8 w-8">
                          <EllipsisVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => setPendingAction({ type: "edit", store })}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => setPendingAction({ type: "toggleStatus", store })}
                        >
                          {store.isActive ? "Make Inactive" : "Make Active"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-status-error focus:text-status-error"
                          onSelect={() => setPendingAction({ type: "delete", store })}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-b border-border px-4 py-4 sm:grid-cols-3 sm:px-5">
                <div>
                  <p className="text-xs text-text-muted">{admin.stores.columns.staffCount}</p>
                  <p className="mt-1 font-medium text-text-primary">{store.staffCount}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Visits</p>
                  <p className="mt-1 font-medium text-text-primary">{store.visits}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Created</p>
                  <p className="mt-1 font-medium text-text-primary">
                    {new Date(store.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <dl className="grid grid-cols-1 gap-x-4 gap-y-3 px-4 py-4 text-sm sm:grid-cols-2 sm:px-5">
                <div>
                  <dt className="text-text-secondary">{admin.stores.modal.pocNameLabel}</dt>
                  <dd className="mt-0.5 font-medium text-text-primary">{store.pocName ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-text-secondary">
                    {admin.stores.modal.pointOfContactPhoneLabel}
                  </dt>
                  <dd className="mt-0.5 font-medium text-text-primary">
                    {store.pointOfContactPhone ?? "—"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-text-secondary">{admin.stores.modal.emailLabel}</dt>
                  <dd className="mt-0.5 truncate font-medium text-text-primary">
                    {store.email ?? "—"}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStoreId ? "Edit Store" : admin.stores.modal.title}</DialogTitle>
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
                    <Select
                      onValueChange={(value) => {
                        if (value.startsWith("custom:")) {
                          const customValue = value.replace("custom:", "").trim();
                          form.setValue("category", "OTHER", { shouldValidate: true });
                          form.setValue("customCategory", customValue, {
                            shouldValidate: true,
                          });
                          return;
                        }

                        form.setValue("category", value as StoreCategory, {
                          shouldValidate: true,
                        });
                        if (value !== "OTHER") {
                          form.setValue("customCategory", "", { shouldValidate: true });
                        }
                      }}
                      value={
                        field.value === "OTHER" && form.watch("customCategory")
                          ? `custom:${form.watch("customCategory")}`
                          : field.value
                      }
                    >
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
                        {customCategoryOptions.map((option) => (
                          <SelectItem key={option} value={`custom:${option}`}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("category") === "OTHER" && (
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
                      <Input {...field} inputMode="numeric" maxLength={6} />
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
                      <Input {...field} />
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
                      <Input {...field} inputMode="tel" />
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
                      <Input {...field} inputMode="email" type="email" />
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
                disabled={createStoreMutation.isPending || updateStoreMutation.isPending}
              >
                {editingStoreId ? "Save Changes" : admin.stores.addStore}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {pendingAction && (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) setPendingAction(null);
          }}
          title={getConfirmDialogContent(pendingAction).title}
          description={getConfirmDialogContent(pendingAction).description}
          confirmLabel={getConfirmDialogContent(pendingAction).confirmLabel}
          cancelLabel="Cancel"
          onConfirm={onConfirmPendingAction}
          isLoading={updateStoreMutation.isPending || deleteStoreMutation.isPending}
          destructive={getConfirmDialogContent(pendingAction).destructive}
        />
      )}
    </div>
  );
}
