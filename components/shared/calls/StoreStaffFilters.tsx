import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StoreOption {
  id: string;
  name: string;
}

interface StaffOption {
  id: string;
  name: string;
}

interface StoreStaffFiltersProps {
  showStoreFilter?: boolean;
  storeFilter: string;
  staffFilter: string;
  storeFilterLabel: string;
  staffFilterLabel: string;
  allStoresLabel: string;
  allStaffLabel: string;
  filterPlaceholder: string;
  stores?: StoreOption[];
  staffOptions: StaffOption[];
  storeSelectId?: string;
  staffSelectId?: string;
  onStoreChange: (storeId: string) => void;
  onStaffChange: (staffId: string) => void;
}

export function StoreStaffFilters({
  showStoreFilter = false,
  storeFilter,
  staffFilter,
  storeFilterLabel,
  staffFilterLabel,
  allStoresLabel,
  allStaffLabel,
  filterPlaceholder,
  stores = [],
  staffOptions,
  storeSelectId = "calls-store-filter",
  staffSelectId = "calls-staff-filter",
  onStoreChange,
  onStaffChange,
}: StoreStaffFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      {showStoreFilter && (
        <div className="space-y-1">
          <Label htmlFor={storeSelectId}>{storeFilterLabel}</Label>
          <Select value={storeFilter} onValueChange={onStoreChange}>
            <SelectTrigger id={storeSelectId} className="w-full sm:w-56">
              <SelectValue placeholder={filterPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{allStoresLabel}</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-1">
        <Label htmlFor={staffSelectId}>{staffFilterLabel}</Label>
        <Select value={staffFilter} onValueChange={onStaffChange}>
          <SelectTrigger id={staffSelectId} className="w-full sm:w-56">
            <SelectValue placeholder={filterPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{allStaffLabel}</SelectItem>
            {staffOptions.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
