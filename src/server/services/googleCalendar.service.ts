import { dbConnect } from "@/src/server/db";
import { User } from "@/src/server/models";
import { refreshGoogleCalendarAccessToken } from "@/src/server/auth/googleCalendar.auth.service";
import type { IUser } from "@/src/server/models/user.model";
import type { Types } from "mongoose";

export type CreateMeetEventInput = {
  title: string;
  startAt: Date;
  endAt: Date;
  timezone: string;
  attendeeEmails?: string[];
};

export type CreateMeetEventResult = {
  calendarEventId: string;
  meetUrl: string;
  htmlLink: string;
};

async function getValidAccessToken(
  user: IUser,
): Promise<{ accessToken: string }> {
  if (!user.googleAccessToken || !user.googleRefreshToken) {
    throw new Error(
      "Google Calendar not connected. Please connect your Google Calendar first.",
    );
  }

  const now = new Date();
  const expiresAt = user.googleTokenExpiresAt;
  const bufferMs = 60 * 1000; // 1 minute buffer

  if (expiresAt && new Date(expiresAt.getTime() - bufferMs) <= now) {
    const refreshed = await refreshGoogleCalendarAccessToken(
      user.googleRefreshToken,
    );
    await dbConnect();
    const updated = await User.findByIdAndUpdate(
      user._id,
      {
        googleAccessToken: refreshed.accessToken,
        googleTokenExpiresAt: refreshed.expiresAt,
      },
      { new: true },
    );
    if (!updated?.googleAccessToken) {
      throw new Error("Failed to update Google Calendar token.");
    }
    return { accessToken: updated.googleAccessToken };
  }

  return { accessToken: user.googleAccessToken };
}

export async function createMeetEvent(
  userId: string | Types.ObjectId,
  input: CreateMeetEventInput,
): Promise<CreateMeetEventResult> {
  await dbConnect();

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  const { accessToken } = await getValidAccessToken(user);

  const requestId = crypto.randomUUID();
  const startIso = input.startAt.toISOString();
  const endIso = input.endAt.toISOString();

  const body = {
    summary: input.title,
    start: {
      dateTime: startIso,
      timeZone: input.timezone,
    },
    end: {
      dateTime: endIso,
      timeZone: input.timezone,
    },
    attendees: (input.attendeeEmails ?? []).map((email) => ({ email })),
    conferenceData: {
      createRequest: {
        requestId,
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
      },
    },
  };

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Calendar API error: ${text}`);
  }

  const data = (await res.json()) as {
    id?: string;
    htmlLink?: string;
    conferenceData?: {
      entryPoints?: Array<{
        entryPointType?: string;
        uri?: string;
      }>;
    };
  };

  if (!data.id) {
    throw new Error("Google Calendar API did not return event ID.");
  }

  const meetEntry = data.conferenceData?.entryPoints?.find(
    (e) => e.entryPointType === "video",
  );
  const meetUrl = meetEntry?.uri ?? "";

  if (!meetUrl) {
    throw new Error(
      "Google Meet link was not created. Ensure the calendar has Meet enabled.",
    );
  }

  return {
    calendarEventId: data.id,
    meetUrl,
    htmlLink: data.htmlLink ?? "",
  };
}
