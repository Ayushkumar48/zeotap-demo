"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { severityEnum, statusEnum } from "@zeotap-demo/db/enums";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

type TextareaFieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  rows?: number;
  value: string;
  onChange: (value: string) => void;
};

function FormTextareaField({
  id,
  label,
  placeholder,
  rows = 4,
  value,
  onChange,
}: TextareaFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
};
function FormSelectField({
  label,
  placeholder,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(value) => value && onChange(value)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const severityOptions = severityEnum.map((s: string, i: number) => ({
    value: s,
    label: `${s} - ${["Critical", "High", "Medium", "Low"][i]}`,
  }));
  const statusOptions = statusEnum.map((s: string) => ({
    value: s,
    label: s.charAt(0) + s.slice(1).toLowerCase(),
  }));

  const [formData, setFormData] = useState({
    title: "",
    service: "",
    severity: "SEV4" as const,
    status: "OPEN" as const,
    owner: "",
    summary: "",
  });

  const createMutation = useMutation(
    orpc.incident.createIncident.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.incident.getAllWithPaginationAndFilter.queryKey({
            input: { page: 1, pageSize: 10 },
          }),
          exact: false,
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
  };

  const handleSubmit = (
    e: React.SyntheticEvent<HTMLFormElement> | SubmitEvent,
  ) => {
    e.preventDefault();
    createMutation.mutate(formData);
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
            <div className="space-y-2">
              <Label htmlFor="title">Incident Title</Label>
              <Input
                id="title"
                placeholder="Database outage in production"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Affected Service</Label>
              <Input
                id="service"
                placeholder="Auth Service / Payment API / Frontend"
                value={formData.service}
                onChange={(e) => handleChange("service", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormSelectField
                label="Severity"
                placeholder="Select severity"
                value={formData.severity}
                onChange={(value) => handleChange("severity", value)}
                options={severityOptions}
              />

              <FormSelectField
                label="Status"
                placeholder="Select status"
                value={formData.status}
                onChange={(value) => handleChange("status", value)}
                options={statusOptions}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Owner (Optional)</Label>
              <Input
                id="owner"
                placeholder="john.doe@company.com"
                value={formData.owner}
                onChange={(e) => handleChange("owner", e.target.value)}
              />
            </div>

            <FormTextareaField
              id="summary"
              label="Incident Summary"
              placeholder="Describe what happened, when it started, impact, logs, etc..."
              rows={5}
              value={formData.summary}
              onChange={(value) => handleChange("summary", value)}
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
