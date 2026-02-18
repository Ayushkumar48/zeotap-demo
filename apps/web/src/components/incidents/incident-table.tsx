"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
    PencilLine,
    Trash2,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Loader2,
    Info,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";
import Loader from "@/components/loader";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import type {
    FilterState,
    GetAllInput,
    PaginatedResponse,
    DeleteIncidentOutput,
} from "./types";

interface IncidentTableProps {
    incidentsQuery: UseQueryResult<PaginatedResponse, Error>;
    deleteMutation: UseMutationResult<
        DeleteIncidentOutput,
        Error,
        { id: string },
        { previous: PaginatedResponse | undefined }
    >;
    page: number;
    setPage: (page: number) => void;
    pageSize: number;
    setPageSize: (size: number) => void;
    canNext: boolean;
    totalPages: number;
    queryInput: GetAllInput;
    appliedFilters: FilterState;
    handleSort: (field: NonNullable<FilterState["sort"]>) => void;
}

export const IncidentTable = ({
    incidentsQuery,
    deleteMutation,
    page,
    setPage,
    canNext,
    totalPages,
    appliedFilters,
    handleSort,
}: IncidentTableProps) => {
    const SortIcon = ({ field }: { field: NonNullable<FilterState["sort"]> }) => {
        if (appliedFilters.sort !== field)
            return <ArrowUpDown className="ml-2 h-4 w-4" />;
        if (appliedFilters.order === "asc")
            return <ArrowUp className="ml-2 h-4 w-4" />;
        return <ArrowDown className="ml-2 h-4 w-4" />;
    };

    return (
        <TooltipProvider>
            <Card>
                <CardHeader>
                    <CardTitle>Results</CardTitle>
                    <CardDescription>Showing incidents (page {page})</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto hidden md:block border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead
                                        className="cursor-pointer whitespace-nowrap"
                                        onClick={() => handleSort("createdAt")}
                                    >
                                        <div className="flex items-center">
                                            Created At <SortIcon field="createdAt" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer whitespace-nowrap hidden lg:table-cell"
                                        onClick={() => handleSort("updatedAt")}
                                    >
                                        <div className="flex items-center">
                                            Updated At <SortIcon field="updatedAt" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer"
                                        onClick={() => handleSort("title")}
                                    >
                                        <div className="flex items-center">
                                            Title <SortIcon field="title" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hidden xl:table-cell"
                                        onClick={() => handleSort("service")}
                                    >
                                        <div className="flex items-center">
                                            Service <SortIcon field="service" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer"
                                        onClick={() => handleSort("severity")}
                                    >
                                        <div className="flex items-center">
                                            Severity <SortIcon field="severity" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer"
                                        onClick={() => handleSort("status")}
                                    >
                                        <div className="flex items-center">
                                            Status <SortIcon field="status" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hidden lg:table-cell"
                                        onClick={() => handleSort("owner")}
                                    >
                                        <div className="flex items-center">
                                            Owner <SortIcon field="owner" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hidden lg:table-cell"
                                        onClick={() => handleSort("summary")}
                                    >
                                        <div className="flex items-center">
                                            Summary <SortIcon field="summary" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {incidentsQuery.isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-64">
                                            <Loader />
                                        </TableCell>
                                    </TableRow>
                                ) : incidentsQuery.data?.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                                            No incidents found matching your filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    incidentsQuery.data?.data.map((inc) => (
                                        <TableRow key={inc.id} className="group">
                                            <TableCell className="whitespace-nowrap font-medium">
                                                {formatDate(inc.createdAt)}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-muted-foreground hidden lg:table-cell">
                                                {formatDate(inc.updatedAt)}
                                            </TableCell>
                                            <TableCell className="font-semibold">{inc.title}</TableCell>
                                            <TableCell className="hidden xl:table-cell">{inc.service}</TableCell>
                                            <TableCell>
                                                <span className={cn(
                                                    "px-2 py-1 rounded-full text-xs font-semibold",
                                                    inc.severity === "SEV1" && "bg-red-100 text-red-700",
                                                    inc.severity === "SEV2" && "bg-orange-100 text-orange-700",
                                                    inc.severity === "SEV3" && "bg-yellow-100 text-yellow-700",
                                                    inc.severity === "SEV4" && "bg-blue-100 text-blue-700",
                                                )}>
                                                    {inc.severity}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={cn(
                                                    "px-2 py-1 rounded-md text-xs font-medium border",
                                                    inc.status === "OPEN" && "border-red-200 bg-red-50 text-red-700",
                                                    inc.status === "RESOLVED" && "border-green-200 bg-green-50 text-green-700",
                                                    inc.status === "MITIGATED" && "border-gray-200 bg-gray-50 text-gray-700",
                                                )}>
                                                    {inc.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">{inc.owner ?? "-"}</TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                {inc.summary ? (
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <div className="max-w-[150px] truncate flex items-center gap-1 group-hover:text-primary transition-colors">
                                                                <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                                <span className="truncate">
                                                                    {inc.summary.split(" ").slice(0, 3).join(" ")}
                                                                    {inc.summary.split(" ").length > 3 ? "..." : ""}
                                                                </span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs break-words shadow-lg border-muted p-3">
                                                            <div className="space-y-1">
                                                                <p className="font-semibold text-xs border-b pb-1 mb-1">Full Summary</p>
                                                                <p>{inc.summary}</p>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/report-incident/${inc.id}/edit`}>
                                                        <Button size="sm" variant="outline" className="h-8">
                                                            <PencilLine className="h-3.5 w-3.5 mr-1" />
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger
                                                            disabled={deleteMutation.isPending}
                                                        >
                                                            <Button size="sm" variant="destructive" className="h-8">
                                                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                                Delete
                                                            </Button>
                                                        </AlertDialogTrigger>

                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete incident?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Will permanently delete "<strong>{inc.title}</strong>".
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => deleteMutation.mutate({ id: inc.id })}
                                                                    className="bg-destructive hover:bg-destructive/90"
                                                                >
                                                                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
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

                    {/* Mobile View */}
                    <div className="md:hidden space-y-4">
                        {incidentsQuery.isLoading ? (
                            <div className="flex justify-center py-12"><Loader /></div>
                        ) : incidentsQuery.data?.data.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                                No incidents found.
                            </div>
                        ) : (
                            incidentsQuery.data?.data.map((inc) => (
                                <div key={inc.id} className="p-4 border rounded-lg shadow-sm space-y-3 bg-card hover:border-primary/50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-lg leading-tight">{inc.title}</h3>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                {formatDate(inc.createdAt)} • {inc.service || "System"}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                                                inc.status === "OPEN" && "border-red-200 bg-red-50 text-red-700",
                                                inc.status === "RESOLVED" && "border-green-200 bg-green-50 text-green-700",
                                                inc.status === "MITIGATED" && "border-gray-200 bg-gray-50 text-gray-700",
                                            )}>
                                                {inc.status}
                                            </span>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                                inc.severity === "SEV1" && "bg-red-600 text-white",
                                                inc.severity === "SEV2" && "bg-orange-500 text-white",
                                                inc.severity === "SEV3" && "bg-yellow-500 text-black",
                                                inc.severity === "SEV4" && "bg-blue-500 text-white",
                                            )}>
                                                {inc.severity}
                                            </span>
                                        </div>
                                    </div>

                                    {inc.summary && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 italic border-l-2 pl-3 border-muted py-0.5">
                                            "{inc.summary}"
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-2 border-t border-muted/50">
                                        <span className="text-xs text-muted-foreground">
                                            Owner: <span className="text-foreground font-medium">{inc.owner || "Unassigned"}</span>
                                        </span>
                                        <div className="flex gap-2">
                                            <Link href={`/report-incident/${inc.id}/edit`}>
                                                <Button size="sm" variant="outline" className="h-7 text-xs px-2.5">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <AlertDialog>
                                                <AlertDialogTrigger>
                                                    <Button size="sm" variant="destructive" className="h-7 text-xs px-2.5">
                                                        Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="w-[90vw] max-w-sm rounded-lg">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Incident?</AlertDialogTitle>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
                                                        <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => deleteMutation.mutate({ id: inc.id })}
                                                            className="bg-destructive hover:bg-destructive/90"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-muted">
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="h-9 px-4"
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-medium px-4">
                                {page} / {totalPages || "1"}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (canNext) setPage(page + 1);
                                }}
                                disabled={!canNext}
                                className="h-9 px-4"
                            >
                                Next
                            </Button>
                        </div>

                        <div className="text-xs text-muted-foreground italic flex items-center gap-2 shrink-0">
                            {incidentsQuery.isFetching && (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Synchronizing...
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
};
