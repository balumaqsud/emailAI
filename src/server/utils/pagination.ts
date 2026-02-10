import { Types } from "mongoose";

export type CursorDecoded = {
  createdAt: Date;
  id: Types.ObjectId;
};

export function encodeCursor(
  createdAt: Date,
  id: Types.ObjectId,
): string {
  const payload = JSON.stringify({
    createdAt: createdAt.toISOString(),
    id: id.toHexString(),
  });
  return Buffer.from(payload, "utf8").toString("base64url");
}

export function decodeCursor(cursor: string): CursorDecoded | null {
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as {
      createdAt: string;
      id: string;
    };
    if (!parsed.createdAt || !parsed.id) {
      return null;
    }
    const createdAt = new Date(parsed.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      return null;
    }
    const id = new Types.ObjectId(parsed.id);
    return { createdAt, id };
  } catch {
    return null;
  }
}

