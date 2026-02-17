"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
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
import { Button } from "@/components/ui/button";
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
import { formatDate } from "@/lib/utils";
import { useDebounce } from "use-debounce";

export default function Home() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"" | (typeof statusEnum)[number]>("");
  const [severity, setSeverity] = useState<"" | (typeof severityEnum)[number]>(
    "",
  );
  const [service, setService] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [debouncedSearch] = useDebounce(search, 400);
  const [debouncedService] = useDebounce(service, 400);
  const [debouncedOwner] = useDebounce(owner, 400);

  const queryInput = {
    page,
    pageSize,
    ...(status !== "" && { status }),
    ...(severity !== "" && { severity }),
    ...(debouncedService.trim() && { service: debouncedService.trim() }),
    ...(debouncedOwner.trim() && { owner: debouncedOwner.trim() }),
    ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
    ...(fromDate && { from: new Date(fromDate) }),
    ...(toDate && { to: new Date(toDate) }),
  };
  const incidentsQuery = useQuery({
    ...orpc.incident.getAllWithPaginationAndFilter.queryOptions({
      input: queryInput,
    }),
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation(
    orpc.incident.deleteIncident.mutationOptions({
      onSuccess: () => {
        toast.success("Deleted incident");
        queryClient.invalidateQueries({
          queryKey: orpc.incident.getAllWithPaginationAndFilter.queryKey({
            input: queryInput,
          }),
        });
      },
      onError: (err) => {
        toast.error(`Delete failed: ${err?.message ?? err}`);
      },
    }),
  );

  const severityOptions = severityEnum.map((s: string, i: number) => ({
    value: s,
    label: `${s} - ${["Critical", "High", "Medium", "Low"][i]}`,
  }));
  const statusOptions = statusEnum.map((s: string) => ({
    value: s,
    label: s.charAt(0) + s.slice(1).toLowerCase(),
  }));

  const onApplyFilters = () => {
    setPage(1);
  };

  const onResetFilters = () => {
    setStatus("");
    setSeverity("");
    setService("");
    setOwner("");
    setSearch("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const onDelete = (id: string) => {
    if (!confirm("Delete this incident?")) return;
    deleteMutation.mutate({ id });
  };

  const canNext =
    !!incidentsQuery.data && incidentsQuery.data.length >= pageSize;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Incidents</h1>
        <div className="flex gap-2">
          <Link href="/report-incident">
            <Button>Report Incident</Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter incidents to narrow results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v ?? "")}>
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
                value={severity}
                onValueChange={(v) => setSeverity(v ?? "")}
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
                value={service}
                onChange={(e) => {
                  setService(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Owner</Label>
              <Input
                placeholder="Owner (exact)"
                value={owner}
                onChange={(e) => {
                  setOwner(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Search Title</Label>
              <Input
                placeholder="Search in title"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="flex gap-2">
              <div className="w-full space-y-2">
                <Label>From</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="w-full space-y-2">
                <Label>To</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
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
                            <Button size="sm" variant="ghost">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDelete(inc.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Delete
                          </Button>
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
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                }}
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
    </div>
  );
}
