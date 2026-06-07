import { Label } from "@/components/ui/label";
import { FilterChip } from "./FilterChip";

interface FilterOption {
  key: string;
  label: string;
}

type FilterCountGroup =
  | "segments"
  | "valueTiers"
  | "queues"
  | "birthdays"
  | "anniversaries";

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
  getFilterCount: (group: FilterCountGroup, key: string) => number;
  onQueueChange: (value: string) => void;
  onSegmentChange: (value: string) => void;
  onValueTierChange: (value: string) => void;
  birthdayLabel?: string;
  anniversaryLabel?: string;
  birthdays?: readonly FilterOption[];
  anniversaries?: readonly FilterOption[];
  birthday?: string;
  anniversary?: string;
  onBirthdayChange?: (value: string) => void;
  onAnniversaryChange?: (value: string) => void;
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
  birthdayLabel,
  anniversaryLabel,
  birthdays,
  anniversaries,
  birthday,
  anniversary,
  onBirthdayChange,
  onAnniversaryChange,
}: CallQueueFiltersProps) {
  return (
    <>
      {queues.length > 0 && (
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
      )}

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

      {birthdays && birthdays.length > 0 && birthdayLabel && birthday && onBirthdayChange ? (
        <div className="space-y-2" role="group" aria-labelledby="birthday-filter-label">
          <Label id="birthday-filter-label">{birthdayLabel}</Label>
          <div className="flex flex-wrap gap-2">
            {birthdays.map((option) => (
              <FilterChip
                key={option.key}
                active={birthday === option.key}
                label={option.label}
                count={getFilterCount("birthdays", option.key)}
                onClick={() => onBirthdayChange(option.key)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {anniversaries && anniversaries.length > 0 && anniversaryLabel && anniversary && onAnniversaryChange ? (
        <div className="space-y-2" role="group" aria-labelledby="anniversary-filter-label">
          <Label id="anniversary-filter-label">{anniversaryLabel}</Label>
          <div className="flex flex-wrap gap-2">
            {anniversaries.map((option) => (
              <FilterChip
                key={option.key}
                active={anniversary === option.key}
                label={option.label}
                count={getFilterCount("anniversaries", option.key)}
                onClick={() => onAnniversaryChange(option.key)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
