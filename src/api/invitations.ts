import http from "./http";

function getSession(): string | null {
	try {
		return localStorage.getItem("sessionId");
	} catch {
		return null;
	}
}

export async function inviteUserToTrip(
	trip: string,
	inviteeId: string,
): Promise<{ invitation: string }> {
	const session = getSession();
	const { data } = await http.post("/Trip/invite", {
		session,
		trip,
		inviteeId,
	});
	if (
		data &&
		typeof data === "object" &&
		"error" in data &&
		(data as any).error
	)
		throw new Error((data as any).error);
	return data as { invitation: string };
}

export async function acceptInvitation(
	invitation: string,
): Promise<{ status: "accepted" }> {
	const session = getSession();
	const { data } = await http.post("/Invitation/accept", {
		session,
		invitation,
	});
	if (
		data &&
		typeof data === "object" &&
		"error" in data &&
		(data as any).error
	)
		throw new Error((data as any).error);
	return data as { status: "accepted" };
}

export async function rejectInvitation(
	invitation: string,
): Promise<{ status: "rejected" }> {
	const session = getSession();
	const { data } = await http.post("/Invitation/reject", {
		session,
		invitation,
	});
	if (
		data &&
		typeof data === "object" &&
		"error" in data &&
		(data as any).error
	)
		throw new Error((data as any).error);
	return data as { status: "rejected" };
}

export async function deleteInvitation(
	invitation: string,
): Promise<{ status: "deleted" }> {
	const session = getSession();
	const { data } = await http.post("/Invitation/delete", {
		session,
		invitation,
	});
	if (
		data &&
		typeof data === "object" &&
		"error" in data &&
		(data as any).error
	)
		throw new Error((data as any).error);
	return data as { status: "deleted" };
}

export async function getMyInvitations(): Promise<{
	results: string[] | any[];
}> {
	const session = getSession();
	const { data } = await http.post("/Invitation/myInvitations", { session });
	if (
		data &&
		typeof data === "object" &&
		"error" in data &&
		(data as any).error
	)
		throw new Error((data as any).error);
	return data as { results: any[] };
}

export async function getTripInvitations(
	trip: string,
): Promise<{
	results: Array<{
		invitation: string;
		invitee: string;
		accepted: "Yes" | "No" | "Maybe";
	}>;
}> {
	const session = getSession();
	const { data } = await http.post("/Trip/invitations", { session, trip });
	if (
		data &&
		typeof data === "object" &&
		"error" in data &&
		(data as any).error
	)
		throw new Error((data as any).error);
	return data as {
		results: Array<{
			invitation: string;
			invitee: string;
			accepted: "Yes" | "No" | "Maybe";
		}>;
	};
}

export async function createInvitation(
	invitee: string,
	event: string,
): Promise<{ invitation: string }> {
	const session = getSession();
	const { data } = await http.post("/Invitation/createInvitation", {
		session,
		invitee,
		event,
	});
	if (
		data &&
		typeof data === "object" &&
		"error" in data &&
		(data as any).error
	)
		throw new Error((data as any).error);
	return data as { invitation: string };
}
