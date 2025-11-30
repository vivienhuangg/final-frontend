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
  solo: boolean;
  proposal: boolean;
  createdBy: string;
};

export type ActivityDetail = ActivitySummary & { trip: string };

export async function createActivity(
  title: string,
  startDateTime: string,
  endDateTime: string,
  cost: number,
  trip: string,
  options?: { solo?: boolean; proposal?: boolean }
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
