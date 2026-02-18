"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { severityEnum, statusEnum } from "@zeotap-demo/db/enums";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader, TriangleAlert } from "lucide-react";
import {
  FormSelectField,
  FormInputField,
  FormTextareaField,
} from "@/components/form-fields";
import { postIncidentSchema } from "@zeotap-demo/api/schema/incident-schema";
import { z } from "zod";
import { severityOptions, statusOptions } from "@/utils/extra";

type FormErrors = Partial<
  Record<keyof z.infer<typeof postIncidentSchema>, string>
>;

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    service: "",
    severity: "SEV4" as const,
    status: "OPEN" as const,
    owner: "",
    summary: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const createMutation = useMutation(
    orpc.incident.createIncident.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.incident.getAllWithPaginationAndFilter.key(),
        });

        router.push("/");
        toast.success("Incident created successfully!");
      },
      onError: (error) => {
        toast.error("Failed to create incident");
      },
    }),
  );

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (
    e: React.SyntheticEvent<HTMLFormElement> | SubmitEvent,
  ) => {
    e.preventDefault();
    const result = postIncidentSchema.safeParse(formData);

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
    createMutation.mutate(formData);
  };

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <Card className="shadow-lg border-muted">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <TriangleAlert className="text-red-600" /> Report Incident
          </CardTitle>
          <CardDescription>
            Provide detailed information so the incident response team can
            quickly assess and resolve the issue.
          </CardDescription>
        </CardHeader>

        <CardContent>
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

            <FormTextareaField
              id="summary"
              label="Incident Summary"
              placeholder="Describe what happened, when it started, impact, logs, etc..."
              rows={5}
              value={formData.summary}
              onChange={(value) => handleChange("summary", value)}
              error={errors.summary}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Adding
                </>
              ) : (
                "Add Incident"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
