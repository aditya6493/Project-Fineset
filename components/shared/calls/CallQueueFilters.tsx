import { Label } from "@/components/ui/label";
import { FilterChip } from "./FilterChip";

interface FilterOption {
  key: string;
  label: string;
}

interface CallQueueFiltersProps {
  queueLabel: string;
  segmentLabel: string;
  valueTierLabel: string;
  queues: readonly FilterOption[];
  segments: readonly FilterOption[];
  valueTiers: readonly FilterOption[];
  queue: string;
  segment: string;
  valueTier: string;
  getFilterCount: (group: "segments" | "valueTiers" | "queues", key: string) => number;
  onQueueChange: (value: string) => void;
  onSegmentChange: (value: string) => void;
  onValueTierChange: (value: string) => void;
}

export function CallQueueFilters({
  queueLabel,
  segmentLabel,
  valueTierLabel,
  queues,
  segments,
  valueTiers,
  queue,
  segment,
  valueTier,
  getFilterCount,
  onQueueChange,
  onSegmentChange,
  onValueTierChange,
}: CallQueueFiltersProps) {
  return (
    <>
      <div className="space-y-2" role="group" aria-labelledby="queue-filter-label">
        <Label id="queue-filter-label">{queueLabel}</Label>
        <div className="flex flex-wrap gap-2">
          {queues.map((option) => (
            <FilterChip
              key={option.key}
              active={queue === option.key}
              label={option.label}
              count={getFilterCount("queues", option.key)}
              onClick={() => onQueueChange(option.key)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2" role="group" aria-labelledby="segment-filter-label">
        <Label id="segment-filter-label">{segmentLabel}</Label>
        <div className="flex flex-wrap gap-2">
          {segments.map((option) => (
            <FilterChip
              key={option.key}
              active={segment === option.key}
              label={option.label}
              count={getFilterCount("segments", option.key)}
              onClick={() => onSegmentChange(option.key)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2" role="group" aria-labelledby="value-tier-filter-label">
        <Label id="value-tier-filter-label">{valueTierLabel}</Label>
        <div className="flex flex-wrap gap-2">
          {valueTiers.map((option) => (
            <FilterChip
              key={option.key}
              active={valueTier === option.key}
              label={option.label}
              count={getFilterCount("valueTiers", option.key)}
              onClick={() => onValueTierChange(option.key)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
