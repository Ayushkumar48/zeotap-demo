"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FilterSection } from "@/components/incidents/filter-section";
import { IncidentTable } from "@/components/incidents/incident-table";
import { initialFilterState, type FilterState, type GetAllInput } from "@/components/incidents/types";

export default function Home() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;

  const appliedFilters = useMemo<FilterState>(
    () => ({
      status: (searchParams.get("status") as FilterState["status"]) || "",
      severity: (searchParams.get("severity") as FilterState["severity"]) || "",
      service: searchParams.get("service") || "",
      owner: searchParams.get("owner") || "",
      search: searchParams.get("search") || "",
      fromDate: searchParams.get("from") || "",
      toDate: searchParams.get("to") || "",
      sort: (searchParams.get("sort") as FilterState["sort"]) || "createdAt",
      order: (searchParams.get("order") as FilterState["order"]) || "desc",
    }),
    [searchParams],
  );

  const [filterInputs, setFilterInputs] = useState<FilterState>(appliedFilters);

  const updateParams = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      router.push(`${pathname}?${params.toString()}` as Route);
    },
    [searchParams, router, pathname],
  );

  const queryInput = useMemo<GetAllInput>(
    () => ({
      page,
      pageSize,
      ...(appliedFilters.status && { status: appliedFilters.status }),
      ...(appliedFilters.severity && { severity: appliedFilters.severity }),
      ...(appliedFilters.service && {
        service: appliedFilters.service,
      }),
      ...(appliedFilters.owner && {
        owner: appliedFilters.owner,
      }),
      ...(appliedFilters.search && {
        search: appliedFilters.search,
      }),
      ...(appliedFilters.fromDate && {
        from: new Date(appliedFilters.fromDate),
      }),
      ...(appliedFilters.toDate && { to: new Date(appliedFilters.toDate) }),
      sort: appliedFilters.sort,
      order: appliedFilters.order,
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
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((i) => i.id !== id),
          };
        },
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
      queryClient.invalidateQueries({
        queryKey: orpc.incident.getAllWithPaginationAndFilter.key(),
      });
    },
  });

  const onApplyFilters = () => {
    updateParams({
      page: 1,
      status: filterInputs.status,
      severity: filterInputs.severity,
      service: filterInputs.service.trim(),
      owner: filterInputs.owner.trim(),
      search: filterInputs.search.trim(),
      from: filterInputs.fromDate,
      to: filterInputs.toDate,
    });
  };

  const onResetFilters = () => {
    setFilterInputs(initialFilterState);
    router.push(pathname as Route);
  };

  const handleSort = (field: NonNullable<FilterState["sort"]>) => {
    updateParams({
      sort: field,
      order:
        appliedFilters.sort === field && appliedFilters.order === "asc"
          ? "desc"
          : "asc",
    });
  };

  const totalPages = incidentsQuery.data
    ? Math.ceil(incidentsQuery.data.total / pageSize)
    : 0;

  const canNext = page < totalPages;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 md:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor and manage system outages and service disruptions.
          </p>
        </div>
        <Link href="/report-incident" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Report Incident
          </Button>
        </Link>
      </div>

      <FilterSection
        filterInputs={filterInputs}
        setFilterInputs={setFilterInputs}
        onApplyFilters={onApplyFilters}
        onResetFilters={onResetFilters}
        pageSize={pageSize}
        setPageSize={(size) => updateParams({ pageSize: size, page: 1 })}
        setPage={(p) => updateParams({ page: p })}
      />

      <IncidentTable
        incidentsQuery={incidentsQuery}
        deleteMutation={deleteMutation}
        page={page}
        setPage={(p) => updateParams({ page: p })}
        pageSize={pageSize}
        setPageSize={(size) => updateParams({ pageSize: size, page: 1 })}
        canNext={canNext}
        totalPages={totalPages}
        queryInput={queryInput}
        handleSort={handleSort}
        appliedFilters={appliedFilters}
      />
    </div>
  );
}
