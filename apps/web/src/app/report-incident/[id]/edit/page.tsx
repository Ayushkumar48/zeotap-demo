"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { severityEnum, statusEnum } from "@zeotap-demo/db/enums";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { postIncidentSchema } from "@zeotap-demo/api/schema/incident-schema";
import type z from "zod";
import {
  FormInputField,
  FormSelectField,
  FormTextareaField,
} from "@/components/form-fields";
import { severityOptions, statusOptions } from "@/utils/extra";

type FormErrors = Partial<
  Record<keyof z.infer<typeof postIncidentSchema>, string>
>;
export default function Page() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const incident = useQuery(
    orpc.incident.getIncident.queryOptions({ input: { id }, enabled: !!id }),
  );

  const [formData, setFormData] = useState({
    title: "",
    service: "",
    severity: "SEV4" as (typeof severityEnum)[number],
    status: "OPEN" as (typeof statusEnum)[number],
    owner: "",
    summary: "",
    createdAt: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (incident.data) {
      setFormData({
        title: incident.data.title,
        service: incident.data.service,
        severity: incident.data.severity,
        status: incident.data.status,
        owner: incident.data.owner ?? "",
        summary: incident.data.summary ?? "",
        createdAt: incident.data.createdAt
          ? new Date(incident.data.createdAt).toISOString().split("T")[0]
          : "",
      });
    }
  }, [incident.data]);

  const updateMutation = useMutation({
    ...orpc.incident.updateIncident.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.incident.getAllWithPaginationAndFilter.key(),
      });
      router.push("/");
      toast.success("Incident updated successfully");
    },
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
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
    updateMutation.mutate({ id, ...formData });
  };

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <Card className="shadow-lg border-muted">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            🚨 Report Incident
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

            <FormInputField
              label="Created At"
              name="createdAt"
              type="date"
              value={formData.createdAt}
              onChange={(value) => handleChange("createdAt", value)}
              error={errors.createdAt}
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
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update Incident"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
