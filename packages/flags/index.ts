import fs from "fs";
import path from "path";
import yaml from "yaml";

type Flag = {
  id: string;
  owner: string;
  default: boolean;
  expires_by: string;
  description: string;
};

type FlagMap = Record<string, Flag>;

let flags: FlagMap = {};

const flagsPath = path.resolve(__dirname, "../../../flags/flags.yaml");

export function loadFlags(): void {
  const raw = fs.readFileSync(flagsPath, "utf8");
  const parsed = yaml.parse(raw) as Flag[];
  flags = Object.fromEntries(parsed.map(f => [f.id, f]));
}

export function getFlag(id: string): boolean {
  return flags[id]?.default ?? false;
}
