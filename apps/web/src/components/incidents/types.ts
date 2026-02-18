import type { InferClientInputs, InferClientOutputs } from "@orpc/client";
import { client } from "@/utils/orpc";
import { severityEnum, statusEnum } from "@zeotap-demo/db/enums";

export type Incident = InferClientOutputs<
    typeof client
>["incident"]["getAllWithPaginationAndFilter"]["data"][number];

export type PaginatedResponse = InferClientOutputs<
    typeof client
>["incident"]["getAllWithPaginationAndFilter"];

export type DeleteIncidentOutput = InferClientOutputs<
    typeof client
>["incident"]["deleteIncident"];

export type GetAllInput = InferClientInputs<
    typeof client
>["incident"]["getAllWithPaginationAndFilter"];

export type FilterState = {
    status: "" | (typeof statusEnum)[number];
    severity: "" | (typeof severityEnum)[number];
    service: string;
    owner: string;
    search: string;
    fromDate: string;
    toDate: string;
    sort?:
    | "id"
    | "title"
    | "service"
    | "severity"
    | "status"
    | "owner"
    | "summary"
    | "createdAt"
    | "updatedAt";
    order?: "asc" | "desc";
};

export const initialFilterState: FilterState = {
    status: "",
    severity: "",
    service: "",
    owner: "",
    search: "",
    fromDate: "",
    toDate: "",
    sort: "createdAt",
    order: "desc",
};
