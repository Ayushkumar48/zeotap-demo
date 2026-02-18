"use client";

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
import { severityEnum, statusEnum } from "@zeotap-demo/db/enums";
import { severityOptions, statusOptions } from "@/utils/extra";
import type { FilterState } from "./types";

interface FilterSectionProps {
    filterInputs: FilterState;
    setFilterInputs: React.Dispatch<React.SetStateAction<FilterState>>;
    onApplyFilters: () => void;
    onResetFilters: () => void;
    pageSize: number;
    setPageSize: (size: number) => void;
    setPage: (page: number) => void;
}

export const FilterSection = ({
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

                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="w-full space-y-2">
                            <Label>From</Label>
                            <Input
                                type="date"
                                className="w-full"
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
                                className="w-full"
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

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-6">
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button className="flex-1 sm:flex-none" onClick={onApplyFilters}>Apply Filters</Button>
                        <Button className="flex-1 sm:flex-none" variant="ghost" onClick={onResetFilters}>
                            Reset
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 sm:ml-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-muted">
                        <Label className="text-sm text-muted-foreground whitespace-nowrap">Page size</Label>
                        <Select
                            value={String(pageSize)}
                            onValueChange={(v) => {
                                setPageSize(Number(v));
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[80px]">
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
