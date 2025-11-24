import { Toaster } from "sonner@2.0.3";
import React, { useEffect, useState } from "react";
import { AuthForm } from "./components/AuthForm";
import { TripDashboard } from "./components/TripDashboard";
import { TripDetail } from "./components/TripDetail";
import { WelcomePage } from "./components/WelcomePage";

export default function App() {
	const [isAuthenticated, setIsAuthenticated] = useState(true); // Auto-authenticate for demo
	const [showAuth, setShowAuth] = useState(false);
	const [selectedTripId, setSelectedTripId] =
		(useState < string) | (null > null);
	const [loading, setLoading] = useState(false); // Skip loading for demo
	const [error, setError] = (useState < string) | (null > null);

	// Skip auth check for demo
	// useEffect(() => {
	//   checkAuth();
	// }, []);

	const handleSignOut = async () => {
		setIsAuthenticated(false);
		setSelectedTripId(null);
		setError(null);
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#f5f1ed]">
				<div className="flex flex-col items-center gap-4">
					<div className="size-12 rounded-full bg-[#14b8a6] animate-pulse" />
					<div className="text-gray-600">Loading...</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#f5f1ed]">
				<div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
					<h2 className="mb-4 text-red-600">Error</h2>
					<p className="text-gray-700 mb-4">{error}</p>
					<button
						onClick={() => {
							setError(null);
						}}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	if (!isAuthenticated && !showAuth) {
		return (
			<>
				<WelcomePage onGetStarted={() => setShowAuth(true)} />
				<Toaster position="top-center" />
			</>
		);
	}

	if (!isAuthenticated) {
		return (
			<>
				<AuthForm onSuccess={() => setIsAuthenticated(true)} />
				<Toaster position="top-center" />
			</>
		);
	}

	if (selectedTripId) {
		return (
			<>
				<TripDetail
					tripId={selectedTripId}
					onBack={() => setSelectedTripId(null)}
				/>
				<Toaster position="top-center" />
			</>
		);
	}

	return (
		<>
			<TripDashboard
				onTripSelect={(tripId) => setSelectedTripId(tripId)}
				onSignOut={handleSignOut}
			/>
			<Toaster position="top-center" />
		</>
	);
}
