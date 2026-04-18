import type { DemoTags } from "./types";
import raw from "./demo-tags.csv?raw";

const EMPTY: DemoTags = { playback: [], target: [], type: [], related: [] };

function splitList(s: string | undefined) {
  if (!s) return [];
  return String(s)
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseCsvSimple(text: string) {
  // 轻量 CSV：本项目字段里不包含逗号/引号（若未来需要复杂 CSV，可替换为 PapaParse）
  const lines = text
    .split(/\r?\n/g)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  if (lines.length <= 1) return [];
  const header = lines[0].split(",").map((x) => x.trim());
  const idx = (k: string) => header.indexOf(k);
  const iId = idx("id");
  const iPlayback = idx("playback");
  const iTarget = idx("target");
  const iType = idx("type");
  const iRelated = idx("related");

  const rows: { id: string; tags: DemoTags }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(","); // 约定：单元格不包含逗号
    const id = (cols[iId] ?? "").trim();
    if (!id) continue;
    rows.push({
      id,
      tags: {
        playback: splitList(cols[iPlayback]),
        target: splitList(cols[iTarget]),
        type: splitList(cols[iType]),
        related: splitList(cols[iRelated])
      }
    });
  }
  return rows;
}

const tagMap = new Map<string, DemoTags>();
for (const row of parseCsvSimple(raw)) tagMap.set(row.id, row.tags);

export function getDemoTags(id: string): DemoTags {
  return tagMap.get(id) ?? EMPTY;
}

export function getAllTags() {
  return tagMap;
}

