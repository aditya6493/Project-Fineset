"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VisitFormSuccessProps {
  title: string;
  message: string;
  logAnotherLabel: string;
  onLogAnother: () => void;
}

export function VisitFormSuccess({
  title,
  message,
  logAnotherLabel,
  onLogAnother,
}: VisitFormSuccessProps) {
  return (
    <Card className="border-status-success/30">
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-status-success/10">
          <CheckCircle2 className="h-6 w-6 text-status-success" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={onLogAnother}>
          {logAnotherLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
