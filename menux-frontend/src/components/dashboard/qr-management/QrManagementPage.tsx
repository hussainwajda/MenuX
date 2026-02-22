"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Copy, Download, Edit, Eye, Plus, Power, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  QrManagedEntity,
  QrManagementItem,
  RestaurantApiError,
  createQrManagementItem,
  deleteQrManagementItem,
  getQrManagementItems,
  updateQrManagementItem,
} from "@/lib/restaurant-admin-qr-api";

interface QrManagementPageProps {
  entity: QrManagedEntity;
  title: string;
  addButtonLabel: string;
  numberLabel: string;
  slug?: string;
}

interface FormState {
  number: string;
}

function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse">
          <div className="h-5 w-24 bg-gray-200 rounded" />
          <div className="my-4 h-44 bg-gray-100 rounded-xl" />
          <div className="h-9 w-32 bg-gray-200 rounded-lg" />
          <div className="mt-4 h-4 w-28 bg-gray-200 rounded" />
          <div className="mt-4 flex gap-2">
            <div className="h-9 flex-1 bg-gray-200 rounded-lg" />
            <div className="h-9 flex-1 bg-gray-200 rounded-lg" />
            <div className="h-9 flex-1 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function QrManagementPage({
  entity,
  title,
  addButtonLabel,
  numberLabel,
  slug,
}: QrManagementPageProps) {
  const [items, setItems] = useState<QrManagementItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [activeItem, setActiveItem] = useState<QrManagementItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<QrManagementItem | null>(null);
  const [formState, setFormState] = useState<FormState>({ number: "" });
  const [formError, setFormError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const entityLabel = useMemo(() => (entity === "room" ? "Room" : "Table"), [entity]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const list = await getQrManagementItems(entity, slug);
        if (!mounted) return;
        setItems(list);
      } catch (error) {
        const apiError = error as RestaurantApiError;
        if (apiError.status === 403) {
          toast.error("You are not authorized to access this module.");
        } else {
          toast.error(`Failed to load ${entityLabel.toLowerCase()}s`);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [entity, entityLabel, slug]);

  const openCreateModal = () => {
    setActiveItem(null);
    setFormState({ number: "" });
    setFormError("");
    setIsFormOpen(true);
  };

  const openEditModal = (item: QrManagementItem) => {
    setActiveItem(item);
    setFormState({ number: item.number });
    setFormError("");
    setIsFormOpen(true);
  };

  const extractDuplicateError = (message: string) => {
    const lower = message.toLowerCase();
    if (lower.includes("duplicate") || lower.includes("already exists") || lower.includes("unique")) {
      return `${entityLabel} number already exists.`;
    }
    return "";
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const value = formState.number.trim();
    if (!value) {
      setFormError(`${entityLabel} number is required.`);
      return;
    }

    const existingDuplicate = items.find(
      (item) => item.number.toLowerCase() === value.toLowerCase() && item.id !== activeItem?.id
    );

    if (existingDuplicate) {
      setFormError(`${entityLabel} number already exists.`);
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      if (activeItem) {
        const previous = items;
        setItems((current) =>
          current.map((item) => (item.id === activeItem.id ? { ...item, number: value } : item))
        );

        try {
          const updated = await updateQrManagementItem(
            entity,
            activeItem.id,
            { number: value },
            slug
          );
          setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
          toast.success(`${entityLabel} updated successfully`);
          setIsFormOpen(false);
        } catch (error) {
          setItems(previous);
          throw error;
        }
      } else {
        const created = await createQrManagementItem(entity, value, slug);
        setItems((current) => [created, ...current]);
        toast.success(`${entityLabel} created successfully`);
        setIsFormOpen(false);
      }
    } catch (error) {
      const apiError = error as RestaurantApiError;
      const duplicateError = extractDuplicateError(apiError.message);

      if (duplicateError) {
        setFormError(duplicateError);
      } else if (apiError.status === 403) {
        toast.error("You are not authorized to perform this action.");
      } else {
        toast.error(activeItem ? `Failed to update ${entityLabel.toLowerCase()}` : `Failed to create ${entityLabel.toLowerCase()}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const requestDelete = (item: QrManagementItem) => {
    setDeleteItem(item);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    const previous = items;
    setItems((current) => current.filter((currentItem) => currentItem.id !== deleteItem.id));

    try {
      await deleteQrManagementItem(entity, deleteItem.id);
      toast.success(`${entityLabel} deleted successfully`);
      setIsDeleteOpen(false);
      setDeleteItem(null);
    } catch (error) {
      setItems(previous);
      const apiError = error as RestaurantApiError;
      if (apiError.status === 403) {
        toast.error("You are not authorized to delete this item.");
      } else {
        toast.error(`Failed to delete ${entityLabel.toLowerCase()}`);
      }
    }
  };

  const handleToggleStatus = async (item: QrManagementItem) => {
    const previous = items;
    setItems((current) =>
      current.map((currentItem) =>
        currentItem.id === item.id ? { ...currentItem, isActive: !currentItem.isActive } : currentItem
      )
    );

    try {
      const updated = await updateQrManagementItem(
        entity,
        item.id,
        { isActive: !item.isActive },
        slug
      );
      setItems((current) => current.map((currentItem) => (currentItem.id === updated.id ? updated : currentItem)));
      toast.success(`${entityLabel} status updated`);
    } catch (error) {
      setItems(previous);
      const apiError = error as RestaurantApiError;
      if (apiError.status === 403) {
        toast.error("You are not authorized to update status.");
      } else {
        toast.error(`Failed to update ${entityLabel.toLowerCase()} status`);
      }
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <div className="flex-1 bg-[#F8F9FA] p-8 h-full overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 mt-1">Create and manage {entityLabel.toLowerCase()} QR codes</p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          {addButtonLabel}
        </Button>
      </div>

      {loading ? (
        <SkeletonCards />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-8 py-16 text-center text-gray-500">
          No {entityLabel.toLowerCase()}s found. Use {addButtonLabel} to create your first one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">{entityLabel} #{item.number}</h2>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveItem(item);
                  setIsPreviewOpen(true);
                }}
                className="w-full rounded-xl border border-gray-200 p-3 bg-gray-50 hover:bg-gray-100 transition"
              >
                <img
                  src={item.qrImageUrl}
                  alt={`${entityLabel} ${item.number} QR`}
                  className="w-full h-44 object-contain"
                />
              </button>

              <a
                href={item.qrImageUrl}
                download={`${entity}-${item.number}.png`}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
              >
                <Download className="w-4 h-4" />
                Download QR
              </a>

              <p className="mt-3 text-sm text-gray-600">
                Status: <span className="font-medium">{item.isActive ? "Active" : "Inactive"}</span>
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(item)}
                  className="border-gray-300"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(item)}
                  className="border-gray-300"
                >
                  <Power className="w-4 h-4 mr-1" />
                  {item.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => requestDelete(item)}
                  className="border-red-300 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activeItem ? `Edit ${entityLabel}` : addButtonLabel}</DialogTitle>
            <DialogDescription>
              {activeItem
                ? `Update ${entityLabel.toLowerCase()} details.`
                : `Enter a ${entityLabel.toLowerCase()} number to generate QR.`}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="number">{numberLabel}</Label>
              <Input
                id="number"
                value={formState.number}
                onChange={(event) => {
                  setFormState({ number: event.target.value });
                  setFormError("");
                }}
                placeholder={`Enter ${entityLabel.toLowerCase()} number`}
                required
              />
              {formError ? <p className="text-sm text-red-600 mt-2">{formError}</p> : null}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={submitting}>
                {submitting ? "Saving..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview QR
            </DialogTitle>
            <DialogDescription>Scan or copy this URL.</DialogDescription>
          </DialogHeader>

          {activeItem ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <img
                  src={activeItem.qrImageUrl}
                  alt="QR preview"
                  className="mx-auto h-72 w-72 object-contain"
                />
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 break-all">
                {activeItem.qrUrl}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => copyUrl(activeItem.qrUrl)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </Button>
                <a
                  href={activeItem.qrImageUrl}
                  download={`${entity}-${activeItem.number}.png`}
                  className="inline-flex items-center justify-center rounded-md h-10 px-4 py-2 text-sm font-medium border border-gray-300 bg-white hover:bg-gray-100"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR
                </a>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) {
            setDeleteItem(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {entityLabel}</DialogTitle>
            <DialogDescription>
              {deleteItem
                ? `Delete ${entityLabel.toLowerCase()} ${deleteItem.number}? This action cannot be undone.`
                : "This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
