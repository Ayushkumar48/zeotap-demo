"use client";

import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import type { InferClientInputs, InferClientOutputs } from "@orpc/client";
import { client, orpc } from "@/utils/orpc";
import { severityEnum, statusEnum } from "@zeotap-demo/db/enums";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { PencilLine, Plus, Trash2 } from "lucide-react";

type Incident = InferClientOutputs<
  typeof client
>["incident"]["getAllWithPaginationAndFilter"][number];
type DeleteIncidentOutput = InferClientOutputs<
  typeof client
>["incident"]["deleteIncident"];
type GetAllInput = InferClientInputs<
  typeof client
>["incident"]["getAllWithPaginationAndFilter"];

const severityOptions = severityEnum.map((s: string, i: number) => ({
  value: s,
  label: `${s} - ${["Critical", "High", "Medium", "Low"][i]}`,
}));

const statusOptions = statusEnum.map((s: string) => ({
  value: s,
  label: s.charAt(0) + s.slice(1).toLowerCase(),
}));

type FilterState = {
  status: "" | (typeof statusEnum)[number];
  severity: "" | (typeof severityEnum)[number];
  service: string;
  owner: string;
  search: string;
  fromDate: string;
  toDate: string;
};

const initialFilterState: FilterState = {
  status: "",
  severity: "",
  service: "",
  owner: "",
  search: "",
  fromDate: "",
  toDate: "",
};

interface FilterSectionProps {
  filterInputs: FilterState;
  setFilterInputs: React.Dispatch<React.SetStateAction<FilterState>>;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const FilterSection = ({
  filterInputs,
  setFilterInputs,
  onApplyFilters,
  onResetFilters,
  pageSize,
  setPageSize,
  setPage,
}: FilterSectionProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>Filter incidents to narrow results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filterInputs.status}
              onValueChange={(v) =>
                setFilterInputs((prev) => ({
                  ...prev,
                  status: (v ?? "") as "" | (typeof statusEnum)[number],
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Severity</Label>
            <Select
              value={filterInputs.severity}
              onValueChange={(v) =>
                setFilterInputs((prev) => ({
                  ...prev,
                  severity: (v ?? "") as "" | (typeof severityEnum)[number],
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                {severityOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Service</Label>
            <Input
              placeholder="Service name (exact)"
              value={filterInputs.service}
              onChange={(e) =>
                setFilterInputs((prev) => ({
                  ...prev,
                  service: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Owner</Label>
            <Input
              placeholder="Owner (exact)"
              value={filterInputs.owner}
              onChange={(e) =>
                setFilterInputs((prev) => ({ ...prev, owner: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Search Title</Label>
            <Input
              placeholder="Search in title"
              value={filterInputs.search}
              onChange={(e) =>
                setFilterInputs((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>

          <div className="flex gap-2">
            <div className="w-full space-y-2">
              <Label>From</Label>
              <Input
                type="date"
                value={filterInputs.fromDate}
                onChange={(e) =>
                  setFilterInputs((prev) => ({
                    ...prev,
                    fromDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="w-full space-y-2">
              <Label>To</Label>
              <Input
                type="date"
                value={filterInputs.toDate}
                onChange={(e) =>
                  setFilterInputs((prev) => ({
                    ...prev,
                    toDate: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={onApplyFilters}>Apply Filters</Button>
          <Button variant="ghost" onClick={onResetFilters}>
            Reset
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <Label className="text-sm">Page size</Label>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface IncidentTableProps {
  incidentsQuery: UseQueryResult<Incident[], Error>;
  deleteMutation: UseMutationResult<
    DeleteIncidentOutput,
    Error,
    { id: string },
    { previous: Incident[] | undefined }
  >;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  canNext: boolean;
  queryInput: GetAllInput;
}

const IncidentTable = ({
  incidentsQuery,
  deleteMutation,
  page,
  setPage,
  canNext,
}: IncidentTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
        <CardDescription>Showing incidents (page {page})</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created At</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidentsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={7}>Loading...</TableCell>
                </TableRow>
              ) : incidentsQuery.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>No incidents found</TableCell>
                </TableRow>
              ) : (
                incidentsQuery.data?.map((inc) => (
                  <TableRow key={inc.id}>
                    <TableCell>{formatDate(inc.createdAt)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {inc.title}
                    </TableCell>
                    <TableCell>{inc.service}</TableCell>
                    <TableCell>{inc.severity}</TableCell>
                    <TableCell>{inc.status}</TableCell>
                    <TableCell>{inc.owner ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/report-incident/${inc.id}/edit`}>
                          <Button size="sm">
                            <PencilLine />
                            Edit
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger
                            disabled={deleteMutation.isPending}
                            className={cn(
                              buttonVariants({
                                variant: "destructive",
                                size: "sm",
                              }),
                            )}
                          >
                            <Trash2 />
                            Delete
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete this incident?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the incident titled "
                                {inc.title}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  deleteMutation.mutate({ id: inc.id })
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {deleteMutation.isPending
                                  ? "Deleting..."
                                  : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                if (canNext) setPage((p) => p + 1);
              }}
              disabled={!canNext}
              className="ml-2"
            >
              Next
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {incidentsQuery.isFetching ? "Refreshing..." : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Home() {
  const queryClient = useQueryClient();

  const [filterInputs, setFilterInputs] =
    useState<FilterState>(initialFilterState);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(initialFilterState);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const queryInput = useMemo<GetAllInput>(
    () => ({
      page,
      pageSize,
      ...(appliedFilters.status && { status: appliedFilters.status }),
      ...(appliedFilters.severity && { severity: appliedFilters.severity }),
      ...(appliedFilters.service.trim() && {
        service: appliedFilters.service.trim(),
      }),
      ...(appliedFilters.owner.trim() && {
        owner: appliedFilters.owner.trim(),
      }),
      ...(appliedFilters.search.trim() && {
        search: appliedFilters.search.trim(),
      }),
      ...(appliedFilters.fromDate && {
        from: new Date(appliedFilters.fromDate),
      }),
      ...(appliedFilters.toDate && { to: new Date(appliedFilters.toDate) }),
    }),
    [page, pageSize, appliedFilters],
  );

  const incidentsQuery = useQuery({
    ...orpc.incident.getAllWithPaginationAndFilter.queryOptions({
      input: queryInput,
    }),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    ...orpc.incident.deleteIncident.mutationOptions(),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries();

      const previous = queryClient.getQueryData(
        orpc.incident.getAllWithPaginationAndFilter.queryKey({
          input: queryInput,
        }),
      );

      queryClient.setQueryData(
        orpc.incident.getAllWithPaginationAndFilter.queryKey({
          input: queryInput,
        }),
        (old) => old?.filter((i) => i.id !== id),
      );

      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          orpc.incident.getAllWithPaginationAndFilter.queryKey({
            input: queryInput,
          }),
          context.previous,
        );
      }
    },
    onSuccess: () => {
      toast.success("Deleted incident");
    },
  });

  const onApplyFilters = () => {
    setAppliedFilters(filterInputs);
    setPage(1);
  };

  const onResetFilters = () => {
    setFilterInputs(initialFilterState);
    setAppliedFilters(initialFilterState);
    setPage(1);
  };

  const canNext =
    !!incidentsQuery.data && incidentsQuery.data.length >= pageSize;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Incidents</h1>
        <Link href="/report-incident">
          <Button>
            <Plus /> Report Incident
          </Button>
        </Link>
      </div>

      <FilterSection
        filterInputs={filterInputs}
        setFilterInputs={setFilterInputs}
        onApplyFilters={onApplyFilters}
        onResetFilters={onResetFilters}
        pageSize={pageSize}
        setPageSize={setPageSize}
        setPage={setPage}
      />

      <IncidentTable
        incidentsQuery={incidentsQuery}
        deleteMutation={deleteMutation}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        canNext={canNext}
        queryInput={queryInput}
      />
    </div>
  );
}
