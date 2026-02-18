"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { IncidentForm } from "@/components/incidents/incident-form";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const incident = useQuery(
    orpc.incident.getIncident.queryOptions({ input: { id }, enabled: !!id }),
  );

  const updateMutation = useMutation({
    ...orpc.incident.updateIncident.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.incident.getAllWithPaginationAndFilter.key(),
      });
      router.push("/");
      toast.success("Incident updated successfully");
    },
    onError: () => {
      toast.error("Failed to update incident");
    },
  });

  const initialData = useMemo(() => {
    if (!incident.data) return undefined;
    return {
      title: incident.data.title,
      service: incident.data.service,
      severity: incident.data.severity,
      status: incident.data.status,
      owner: incident.data.owner ?? "",
      summary: incident.data.summary ?? "",
      createdAt: incident.data.createdAt
        ? new Date(incident.data.createdAt).toISOString().split("T")[0]
        : "",
    };
  }, [incident.data]);

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 sm:py-10">
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
          {incident.isLoading ? (
            <Loader />
          ) : (
            <IncidentForm
              initialData={initialData}
              onSubmit={(data) => updateMutation.mutate({ id, ...data })}
              isPending={updateMutation.isPending}
              submitLabel="Update Incident"
              loadingLabel="Updating..."
              showCreatedAt={true}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
