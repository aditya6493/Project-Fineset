import { content } from "@/content/en";
import { VisitForm } from "@/components/forms/VisitForm";

export default function StaffDashboardPage() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          {content.visitForm.title}
        </h1>
        <p className="text-text-secondary">{content.visitForm.subtitle}</p>
      </div>

      <VisitForm
        copy={content.visitForm}
        common={content.common}
        errors={content.errors}
      />
    </div>
  );
}
