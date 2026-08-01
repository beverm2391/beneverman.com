export type ReplayMessage = {
  role: "user" | "assistant";
  text: string;
};

type PiEntry = {
  type?: unknown;
  id?: unknown;
  parentId?: unknown;
  message?: {
    role?: unknown;
    content?: unknown;
  };
};

function parseLines(source: string): PiEntry[] {
  const lines = source.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) throw new Error("The Pi thread is empty.");

  return lines.map((line, index) => {
    try {
      const value: unknown = JSON.parse(line);
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("entry is not an object");
      }
      return value as PiEntry;
    } catch (error) {
      const detail = error instanceof Error ? error.message : "invalid JSON";
      throw new Error(`Invalid Pi JSONL on line ${index + 1}: ${detail}`);
    }
  });
}

function textFromContent(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";

  return content
    .flatMap((part) => {
      if (!part || typeof part !== "object" || Array.isArray(part)) return [];
      const candidate = part as { type?: unknown; text?: unknown };
      return candidate.type === "text" && typeof candidate.text === "string"
        ? [candidate.text]
        : [];
    })
    .join("")
    .trim();
}

// Pi sessions are append-only trees. The final entry is Pi's current leaf, so
// walking parentId links produces the selected branch without replaying
// abandoned branches. Tool results, thinking, configuration changes, and
// extension records remain part of the artifact but never enter the reader's
// transcript.
export function parsePiThread(source: string): ReplayMessage[] {
  const entries = parseLines(source);
  const header = entries[0];
  if (header?.type !== "session") {
    throw new Error("The file is not a Pi session: its first entry must be a session header.");
  }

  const treeEntries = entries.slice(1).filter(
    (entry): entry is PiEntry & { id: string } => typeof entry.id === "string"
  );
  if (treeEntries.length === 0) throw new Error("The Pi thread has no entries.");

  const byId = new Map(treeEntries.map((entry) => [entry.id, entry]));
  const branch: PiEntry[] = [];
  const visited = new Set<string>();
  let current: PiEntry | undefined = treeEntries.at(-1);

  while (current) {
    if (typeof current.id !== "string" || visited.has(current.id)) {
      throw new Error("The Pi thread contains an invalid message tree.");
    }
    visited.add(current.id);
    branch.push(current);

    if (current.parentId === null) break;
    if (typeof current.parentId !== "string") {
      throw new Error("The Pi thread contains an invalid parent reference.");
    }
    current = byId.get(current.parentId);
    if (!current) throw new Error("The Pi thread contains a missing parent entry.");
  }

  const messages: ReplayMessage[] = [];
  for (const entry of branch.reverse()) {
    if (entry.type !== "message") continue;
    const role = entry.message?.role;
    if (role !== "user" && role !== "assistant") continue;
    const text = textFromContent(entry.message?.content);
    if (!text) continue;

    const previous = messages.at(-1);
    if (previous?.role === role) {
      previous.text += `\n\n${text}`;
    } else {
      messages.push({ role, text });
    }
  }

  if (messages.length === 0) {
    throw new Error("The Pi thread has no visible user or assistant text.");
  }
  return messages;
}
