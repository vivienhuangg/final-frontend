import { Calendar, LogOut, MapPin, Plus, Trash2, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { mockTrips } from "../utils/mockData";
import { Logo } from "./Logo";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  members: any[];
}

interface TripDashboardProps {
  onTripSelect: (tripId: string) => void;
  onSignOut: () => void;
}

export function TripDashboard({ onTripSelect, onSignOut }: TripDashboardProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTrip, setNewTrip] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: ''
  });
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      // Use mock data instead of API call
      setTrips(mockTrips as any);
    } catch (error) {
      console.error('Error loading trips:', error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('This is a demo version. Creating new trips is not available yet.');
    
    // Close dialog after showing error
    setTimeout(() => {
      setCreateError('');
    }, 3000);
  };

  const handleDeleteTrip = async (tripId: string) => {
    // Demo version - show message
    console.log('Demo version: Delete functionality not available');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleLogout = () => {
    console.log('Demo mode: Logout clicked');
    window.location.reload();
  };

  const getAvatarColor = (index: number) => {
    const colors = ['#14b8a6', '#ff7b6b', '#7ba3d1', '#f4c542', '#8ba888'];
    return colors[index % colors.length];
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

  return (
    <div className="min-h-screen bg-[#f5f1ed]">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Simplified Header */}
        <div className="flex justify-between items-center mb-8">
          <Logo size="md" />
          <Button variant="ghost" onClick={onSignOut} className="hover:bg-white/70 rounded-full">
            <LogOut className="mr-2 size-4" />
            Sign Out
          </Button>
        </div>

        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="mb-2">Your Trips</h1>
          <p className="text-muted-foreground">Plan unforgettable adventures with your squad</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Card className="border-2 border-dashed border-[#ff7b6b]/40 hover:border-[#ff7b6b] hover:bg-white/80 cursor-pointer transition-all h-[280px] hover:scale-105 hover:shadow-xl group rounded-2xl">
                <CardContent className="flex flex-col items-center justify-center h-full">
                  <div className="size-16 rounded-2xl bg-[#ff7b6b] flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform shadow-md">
                    <Plus className="size-8 text-white" strokeWidth={3} />
                  </div>
                  <p className="font-medium text-lg">Create New Trip</p>
                  <p className="text-sm text-muted-foreground mt-1">Start your next adventure</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Trip</DialogTitle>
                <DialogDescription>
                  Start planning your next adventure
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTrip} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tripName">Trip Name</Label>
                  <Input
                    id="tripName"
                    placeholder="e.g., Spring Break in Miami"
                    value={newTrip.name}
                    onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    placeholder="e.g., Miami, FL"
                    value={newTrip.destination}
                    onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newTrip.startDate}
                      onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newTrip.endDate}
                      onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {createError && <p className="text-red-500 text-sm">{createError}</p>}
                <Button type="submit" className="w-full" disabled={createLoading}>
                  {createLoading ? 'Creating...' : 'Create Trip'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {trips.map((trip) => (
            <Card 
              key={trip.id} 
              className="hover:shadow-lg transition-all overflow-hidden h-[280px] flex flex-col relative group hover:scale-[1.02] rounded-2xl border-0 shadow-md bg-white"
            >
              <div className="h-1 bg-gradient-to-r from-[#14b8a6] via-[#ff7b6b] to-[#f4c542]" />
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      className="size-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Trip</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{trip.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTrip(trip.id);
                        }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => onTripSelect(trip.id)}
              >
                <CardHeader className="flex-1">
                  <CardTitle>{trip.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 mt-2">
                    <MapPin className="size-4 text-teal-600" />
                    {trip.destination}
                  </CardDescription>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
                    <Calendar className="size-4 text-blue-600" />
                    <span>
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {trip.members.slice(0, 3).map((member, idx) => (
                        <div
                          key={idx}
                          className="size-8 rounded-full flex items-center justify-center text-white border-2 border-white"
                          style={{ backgroundColor: getAvatarColor(idx) }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {trip.members.length} {trip.members.length === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
