"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { IncidentForm } from "@/components/incidents/incident-form";

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    ...orpc.incident.createIncident.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.incident.getAllWithPaginationAndFilter.key(),
      });

      router.push("/");
      toast.success("Incident created successfully!");
    },
    onError: () => {
      toast.error("Failed to create incident");
    },
  });

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 sm:py-10">
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

        <div className="p-6 pt-0">
          <IncidentForm
            onSubmit={(data) => createMutation.mutate(data)}
            isPending={createMutation.isPending}
            submitLabel="Add Incident"
            loadingLabel="Adding"
          />
        </div>
      </Card>
    </div>
  );
}
