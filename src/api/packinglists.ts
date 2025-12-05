import http from "./http";

function getSession(): string | null {
  try {
    return localStorage.getItem("sessionId");
  } catch {
    return null;
  }
}

export type PackingListItem = {
  _id: string;
  name: string;
  finished: boolean;
  assignee?: string;
  finishedBy?: string;
  quantity?: number;
};

export async function createPackingList(
  trip: string,
  isShared?: boolean,
): Promise<{ packinglist: string }> {
  const session = getSession();
  const payload: any = { session, trip };
  if (typeof isShared !== "undefined") payload.isShared = isShared;
  const { data } = await http.post("/packinglists/create", payload);
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    (data as any).error
  )
    throw new Error((data as any).error);
  return data as { packinglist: string };
}

export async function addItem(
  packinglist: string,
  name: string,
  assignee?: string,
  isShared?: boolean,
  quantity?: number,
): Promise<{ message: string }> {
  const session = getSession();
  const payload: any = { session, packinglist, name };
  payload.assignee = assignee ? assignee : null;
  if (typeof isShared !== "undefined") payload.isShared = isShared;
  if (typeof quantity !== "undefined" && quantity !== null && quantity > 0) {
    payload.quantity = quantity;
  }
  const { data } = await http.post("/packinglists/addItem", payload);
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    (data as any).error
  )
    throw new Error((data as any).error);
  return data as { message: string };
}

export async function deleteItem(
  packinglist: string,
  item: string,
  isShared?: boolean,
): Promise<{ message: string }> {
  const session = getSession();
  const payload: any = { session, packinglist, item };
  if (isShared) payload.isShared = isShared;
  const { data } = await http.post("/packinglists/deleteItem", payload);
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    (data as any).error
  )
    throw new Error((data as any).error);
  return data as { message: string };
}

export async function deletePackingList(
  packinglist: string,
  isShared?: boolean,
): Promise<{ message: string }> {
  const session = getSession();
  const payload: any = { session, packinglist };
  if (typeof isShared !== "undefined") payload.isShared = isShared;
  const { data } = await http.post("/packinglists/delete", payload);
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    (data as any).error
  )
    throw new Error((data as any).error);
  return data as { message: string };
}

export async function toggleCompletion(
  packinglist: string,
  item: string,
  finishedFlag: boolean,
  isShared?: boolean,
): Promise<{ message: string }> {
  const session = getSession();
  const payload: any = { session, packinglist, item, finishedFlag };
  if (typeof isShared !== "undefined") payload.isShared = isShared;
  const { data } = await http.post("/packinglists/toggleCompletion", payload);
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    (data as any).error
  )
    throw new Error((data as any).error);
  return data as { message: string };
}

export async function assignItem(
  packinglist: string,
  item: string,
  assignee?: string | null,
  isShared?: boolean,
): Promise<{ message: string }> {
  const session = getSession();
  const payload: any = { session, packinglist, item };
  payload.assignee = assignee ? assignee : null;
  if (typeof isShared !== "undefined") payload.isShared = isShared;
  const { data } = await http.post("/packinglists/assignItem", payload);
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    (data as any).error
  )
    throw new Error((data as any).error);
  return data as { message: string };
}

export async function requestSuggestions(
  packinglist: string,
  additionalInput: string,
  isShared?: boolean,
): Promise<{ requestId: string; message: string }> {
  const session = getSession();
  const payload: any = { session, packinglist, additionalInput };
  if (typeof isShared !== "undefined") payload.isShared = isShared;
  const { data } = await http.post("/packinglists/suggest", payload);
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    (data as any).error
  )
    throw new Error((data as any).error);
  return data as { requestId: string; message: string };
}

// New: Fetch raw JSON suggestions without creating items
export async function getRawSuggestions(
  packinglist: string,
  additionalInput: string,
): Promise<{ suggestions: Array<{ name: string; quantity?: number; shared?: boolean }> }> {
  const session = getSession();
  const payload: any = { session, packinglist, additionalInput };
  const { data } = await http.post("/packinglists/suggestRaw", payload);
  if (
    data &&
    typeof data === "object" &&
    "error" in (data as any) &&
    (data as any).error
  )
    throw new Error((data as any).error);
  // Expect `{ suggestions: [...] }` directly
  return data as { suggestions: Array<{ name: string; quantity?: number; shared?: boolean }> };
}

export async function addGeneratedItems(
  packinglist: string,
  itemNames: string[],
  assignee?: string,
  isShared?: boolean,
): Promise<{ message: string }> {
  const session = getSession();
  const payload: any = { session, packinglist, itemNames };
  if (assignee) payload.assignee = assignee;
  if (typeof isShared !== "undefined") payload.isShared = isShared;
  const { data } = await http.post("/packinglists/addGeneratedItems", payload);
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    (data as any).error
  )
    throw new Error((data as any).error);
  return data as { message: string };
}

export async function getItems(
  packinglist: string,
  isShared?: boolean,
): Promise<{ results: Array<{ item: PackingListItem }> }> {
  const session = getSession();
  const payload: any = { session, packinglist };
  if (typeof isShared !== "undefined") payload.isShared = isShared;
  const { data } = await http.post("/packinglists/items", payload);
  if (data && typeof data === "object" && "results" in (data as any))
    return data as { results: Array<{ item: PackingListItem }> };
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    (data as any).error
  )
    throw new Error((data as any).error);
  return { results: [] };
}

export async function updateQuantity(
  packinglist: string,
  item: string,
  quantity: number,
): Promise<{ message: string }> {
  const session = getSession();
  const { data } = await http.post("/packinglists/updateQuantity", {
    session,
    packinglist,
    item,
    quantity,
  });
  if (data && typeof data === "object" && "error" in (data as any)) {
    throw new Error((data as any).error);
  }
  return data as { message: string };
}

export async function unassignSharedItem(
  packinglist: string,
  item: string,
): Promise<{ message: string }> {
  const session = getSession();
  const { data } = await http.post("/PackingList/unassignSharedItem", {
    session,
    packinglist,
    item,
  });
  if (data && typeof data === "object" && "error" in (data as any)) {
    throw new Error((data as any).error);
  }
  return data as { message: string };
}
