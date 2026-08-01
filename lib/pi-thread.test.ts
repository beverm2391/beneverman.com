import { describe, expect, it } from "vitest";
import { parsePiThread } from "./pi-thread";

const header = JSON.stringify({
  type: "session",
  version: 3,
  id: "session-1",
  timestamp: "2026-07-31T20:00:00.000Z",
  cwd: "/evaluation"
});

function entry(value: Record<string, unknown>) {
  return JSON.stringify(value);
}

describe("parsePiThread", () => {
  it("extracts visible text from the current Pi branch", () => {
    const source = [
      header,
      entry({
        type: "message",
        id: "user-1",
        parentId: null,
        timestamp: "2026-07-31T20:00:01.000Z",
        message: { role: "user", content: "Why is the sky blue?" }
      }),
      entry({
        type: "message",
        id: "abandoned",
        parentId: "user-1",
        timestamp: "2026-07-31T20:00:02.000Z",
        message: { role: "assistant", content: [{ type: "text", text: "Abandoned branch" }] }
      }),
      entry({
        type: "message",
        id: "assistant-1",
        parentId: "user-1",
        timestamp: "2026-07-31T20:00:03.000Z",
        message: {
          role: "assistant",
          content: [
            { type: "thinking", thinking: "hidden" },
            { type: "text", text: "Because shorter blue wavelengths scatter more." },
            { type: "toolCall", id: "tool-1", name: "search", arguments: {} }
          ]
        }
      }),
      entry({
        type: "message",
        id: "tool-1",
        parentId: "assistant-1",
        timestamp: "2026-07-31T20:00:04.000Z",
        message: { role: "toolResult", content: [{ type: "text", text: "hidden output" }] }
      }),
      entry({
        type: "message",
        id: "assistant-2",
        parentId: "tool-1",
        timestamp: "2026-07-31T20:00:05.000Z",
        message: { role: "assistant", content: [{ type: "text", text: "This is Rayleigh scattering." }] }
      })
    ].join("\n");

    expect(parsePiThread(source)).toEqual([
      { role: "user", text: "Why is the sky blue?" },
      {
        role: "assistant",
        text: "Because shorter blue wavelengths scatter more.\n\nThis is Rayleigh scattering."
      }
    ]);
  });

  it("rejects a file that is not a Pi session", () => {
    expect(() => parsePiThread(entry({ type: "message" }))).toThrow(
      "first entry must be a session header"
    );
  });
});
