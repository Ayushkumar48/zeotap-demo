"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  FormInputField,
  FormSelectField,
  FormTextareaField,
} from "@/components/form-fields";
import { severityOptions, statusOptions } from "@/utils/extra";
import { postIncidentSchema } from "@zeotap-demo/api/schema/incident-schema";
import { severityEnum, statusEnum } from "@zeotap-demo/db/enums";
import type { z } from "zod";

type FormData = {
  title: string;
  service: string;
  severity: (typeof severityEnum)[number];
  status: (typeof statusEnum)[number];
  owner: string;
  summary: string;
  createdAt?: string;
};

type FormErrors = Partial<
  Record<keyof z.infer<typeof postIncidentSchema>, string>
>;

interface IncidentFormProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: any) => void;
  isPending: boolean;
  submitLabel: string;
  loadingLabel: string;
  showCreatedAt?: boolean;
}

export const IncidentForm = ({
  initialData,
  onSubmit,
  isPending,
  submitLabel,
  loadingLabel,
  showCreatedAt = false,
}: IncidentFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    service: "",
    severity: "SEV4",
    status: "OPEN",
    owner: "",
    summary: "",
    createdAt: "",
    ...initialData,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submissionData = {
      title: formData.title.trim(),
      service: formData.service.trim(),
      severity: formData.severity,
      status: formData.status,
      owner: (formData.owner || "").trim() || null,
      summary: (formData.summary || "").trim() || null,
      createdAt: formData.createdAt ? new Date(formData.createdAt) : undefined,
    };

    const result = postIncidentSchema.safeParse(submissionData);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormInputField
        label="Incident Title"
        name="title"
        value={formData.title}
        placeholder="Database outage in production"
        onChange={(value) => handleChange("title", value)}
        error={errors.title}
      />
      <FormInputField
        label="Affected Service"
        name="service"
        value={formData.service}
        placeholder="Auth Service / Payment API / Frontend"
        onChange={(value) => handleChange("service", value)}
        error={errors.service}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelectField
          label="Severity"
          placeholder="Select severity"
          value={formData.severity}
          onChange={(value) => handleChange("severity", value)}
          options={severityOptions}
          error={errors.severity}
        />

        <FormSelectField
          label="Status"
          placeholder="Select status"
          value={formData.status}
          onChange={(value) => handleChange("status", value)}
          options={statusOptions}
          error={errors.status}
        />
      </div>

      <FormInputField
        label="Owner (Optional)"
        name="owner"
        placeholder="john.doe@company.com"
        value={formData.owner}
        onChange={(value) => handleChange("owner", value)}
        required={false}
        error={errors.owner}
      />

      {showCreatedAt && (
        <FormInputField
          label="Created At"
          name="createdAt"
          type="date"
          value={formData.createdAt || ""}
          onChange={(value) => handleChange("createdAt", value)}
          error={errors.createdAt}
        />
      )}

      <FormTextareaField
        id="summary"
        label="Incident Summary"
        placeholder="Describe what happened, when it started, impact, logs, etc..."
        rows={5}
        value={formData.summary}
        onChange={(value) => handleChange("summary", value)}
        error={errors.summary}
      />

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingLabel}
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
};
