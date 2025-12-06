import http from "./http";

function getSession(): string | null {
  try {
    return localStorage.getItem("sessionId");
  } catch {
    return null;
  }
}

export type ActivitySummary = {
  _id: string;
  title: string;
  start: string;
  end: string;
  cost: number;
  location?: string;
  solo: boolean;
  proposal: boolean;
  createdBy: string;
  description?: string;
};

export type ActivityDetail = ActivitySummary & { trip: string };

export async function createActivity(
  title: string,
  startDateTime: string,
  endDateTime: string,
  cost: number,
  trip: string,
  options?: { solo?: boolean; proposal?: boolean; description?: string; location?: string }
): Promise<{ activity: string }> {
  const session = getSession();
  const { data } = await http.post("/activities/create", {
    session,
    title,
    startDateTime,
    endDateTime,
    cost,
    trip,
    // Ensure keys expected by backend 'when' clause are present
    solo: options?.solo ?? false,
    proposal: options?.proposal ?? true,
    ...(options?.description && { description: options.description }),
    ...(options?.location && { location: options.location }),
  });
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    (data as any).error
  )
    throw new Error((data as any).error);
  return data as { activity: string };
}

export async function deleteActivity(
  activity: string
): Promise<{ activity: string }> {
  const session = getSession();
  const { data } = await http.post("/activities/delete", { session, activity });
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    (data as any).error
  )
    throw new Error((data as any).error);
  return data as { activity: string };
}

export async function getActivitiesByTrip(
  trip: string
): Promise<{ results: Array<{ activity: ActivitySummary }> }> {
  const session = getSession();
  const { data } = await http.post("/activities/byTrip", { session, trip });
  if (
    data &&
    typeof data === "object" &&
    "results" in (data as any) &&
    Array.isArray((data as any).results)
  ) {
    return data as { results: Array<{ activity: ActivitySummary }> };
  }
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    (data as any).error
  )
    throw new Error((data as any).error);
  return { results: [] };
}

export async function getActivityDetails(
  activity: string
): Promise<{ activity: ActivityDetail }> {
  const session = getSession();
  const { data } = await http.post("/activities/details", {
    session,
    activity,
  });
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    (data as any).error
  )
    throw new Error((data as any).error);
  return data as { activity: ActivityDetail };
}

// Modify proposal flag
export async function modifyProposal(
  activity: string,
  proposal: boolean
): Promise<{ status: string }> {
  console.log("API: modifyProposal called with", activity, proposal);
  const session = getSession();
  const { data } = await http.post("/activities/modifyProposal", {
    session,
    activity,
    proposal,
  });
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    (data as any).error
  )
    throw new Error((data as any).error);
  return data as { status: string };
}

// Modify solo flag
export async function modifySolo(
  activity: string,
  solo: boolean
): Promise<{ status: string }> {
  const session = getSession();
  const { data } = await http.post("/activities/modifySolo", {
    session,
    activity,
    solo,
  });
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    (data as any).error
  )
    throw new Error((data as any).error);
  return data as { status: string };
}

// Modify title
export async function modifyTitle(
  activity: string,
  title: string
): Promise<{ status: string }> {
  const session = getSession();
  const { data } = await http.post("/activities/modifyTitle", {
    session,
    activity,
    title,
  });
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    (data as any).error
  )
    throw new Error((data as any).error);
  return data as { status: string };
}

// Modify duration (start and end times)
export async function modifyDuration(
  activity: string,
  startDateTime: string,
  endDateTime: string
): Promise<{ status: string }> {
  const session = getSession();
  const { data } = await http.post("/activities/modifyDuration", {
    session,
    activity,
    startDateTime,
    endDateTime,
  });
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    (data as any).error
  )
    throw new Error((data as any).error);
  return data as { status: string };
}

// Modify cost
export async function modifyCost(
  activity: string,
  newCost: number
): Promise<{ status: string }> {
  const session = getSession();
  const { data } = await http.post("/activities/modifyCost", {
    session,
    activity,
    newCost,
  });
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    (data as any).error
  )
    throw new Error((data as any).error);
  return data as { status: string };
}

// Modify description
export async function modifyDescription(
  activity: string,
  description: string
): Promise<{ status: string }> {
  const session = getSession();
  const { data } = await http.post("/activities/modifyDescription", {
    session,
    activity,
    description,
  });
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    (data as any).error
  )
    throw new Error((data as any).error);
  return data as { status: string };
}

// Modify location
export async function modifyLocation(
  activity: string,
  location: string
): Promise<{ status: string }> {
  const session = getSession();
  const { data } = await http.post("/activities/modifyLocation", {
    session,
    activity,
    location,
  });
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    (data as any).error
  )
    throw new Error((data as any).error);
  return data as { status: string };
}

// Export single activity as ICS
export async function exportActivityIcs(activity: string): Promise<string> {
  const session = getSession();
  const { data } = await http.post(
    "/activities/exportActivityIcs",
    { session, activity },
  );

  // Handle JSON response with ics field
  if (data && typeof data === "object" && "ics" in data && typeof data.ics === "string") {
    return data.ics;
  }
  // Handle raw string response
  if (typeof data === "string") {
    // Check if it's a JSON string
    if (data.startsWith("{")) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.ics) return parsed.ics;
        if (parsed.error) throw new Error(parsed.error);
      } catch {
        // Not valid JSON, return as-is
      }
    }
    return data;
  }
  if (data && typeof data === "object" && "error" in data && (data as any).error) {
    throw new Error((data as any).error);
  }
  throw new Error("Failed to export activity");
}

// Export all my activities for a trip as ICS
export async function exportAllMyActivitiesIcs(trip: string): Promise<string> {
  const session = getSession();
  const { data } = await http.post(
    "/activities/exportAllMyActivitiesIcs",
    { session, trip },
  );

  // Handle JSON response with ics field
  if (data && typeof data === "object" && "ics" in data && typeof data.ics === "string") {
    return data.ics;
  }
  // Handle raw string response
  if (typeof data === "string") {
    // Check if it's a JSON string
    if (data.startsWith("{")) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.ics) return parsed.ics;
        if (parsed.error) throw new Error(parsed.error);
      } catch {
        // Not valid JSON, return as-is
      }
    }
    return data;
  }
  if (data && typeof data === "object" && "error" in data && (data as any).error) {
    throw new Error((data as any).error);
  }
  throw new Error("Failed to export activities");
}
