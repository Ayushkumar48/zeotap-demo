import { severityEnum, statusEnum } from "@zeotap-demo/db";

export const severityOptions = severityEnum.map((s: string, i: number) => ({
  value: s,
  label: `${s} - ${["Critical", "High", "Medium", "Low"][i]}`,
}));

export const statusOptions = statusEnum.map((s: string) => ({
  value: s,
  label: s.charAt(0) + s.slice(1).toLowerCase(),
}));
