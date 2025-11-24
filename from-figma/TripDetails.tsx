import { ArrowLeft, Calendar, MapPin, Settings, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getMockTripById } from "../utils/mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { AttractionsTab } from "./trip/AttractionsTab";
import { CostsTab } from "./trip/CostsTab";
import { DiscoverTab } from "./trip/DiscoverTab";
import { ExportDialog } from "./trip/ExportDialog";
import { PackingTab } from "./trip/PackingTab";
import { TripOverview } from "./trip/TripOverview";
import { TripSettings } from "./trip/TripSettings";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface TripDetailProps {
  tripId: string;
  onBack: () => void;
}

export function TripDetail({ tripId, onBack }: TripDetailProps) {
  const [trip, setTrip] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('user-1'); // Default to first user
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Destination images for hero header
  const destinationImages: { [key: string]: string } = {
    'Miami, FL': 'https://images.unsplash.com/photo-1653795163974-2282e54207d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNaWFtaSUyMGJlYWNoJTIwc2t5bGluZXxlbnwxfHx8fDE3NjM0MDAxNzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'New York City, NY': 'https://images.unsplash.com/photo-1454692173233-f4f34c12adad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOZXclMjBZb3JrJTIwQ2l0eSUyMHdpbnRlcnxlbnwxfHx8fDE3NjM0MDAxNzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'Aspen, CO': 'https://images.unsplash.com/photo-1665182118181-11b1111a9a23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBc3BlbiUyMENvbG9yYWRvJTIwbW91bnRhaW5zfGVufDF8fHx8MTc2MzQwMDE3MXww&ixlib=rb-4.1.0&q=80&w=1080'
  };

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    try {
      // Use mock data instead of API call
      const mockTrip = getMockTripById(tripId);
      setTrip(mockTrip);
    } catch (error) {
      console.error('Error loading trip:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f1ed] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full bg-[#14b8a6] animate-pulse" />
          <div className="text-gray-600">Loading trip...</div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-[#f5f1ed] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Trip not found</p>
          <Button onClick={onBack}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1ed]">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="mb-4 hover:bg-[#14b8a6]/10 rounded-full text-[#14b8a6] transition-all hover:scale-105"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Dashboard
        </Button>

        {/* Hero Header with Destination Photo */}
        <div className="mb-6 rounded-2xl overflow-hidden shadow-lg relative h-64">
          <ImageWithFallback
            src={destinationImages[trip.destination] || ''}
            alt={trip.destination}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
          
          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="size-8 text-white opacity-80" />
                </div>
                <h1 className="text-white mb-3">{trip.destination}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-white/90">
                    <Calendar className="size-4" />
                    <span>
                      {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <Users className="size-4" />
                    <span>{trip.members.length} travelers</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full hover:scale-105 transition-all bg-white/90 hover:bg-white">
                      <Settings className="size-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-[#1e3a5f]">Trip Settings</DialogTitle>
                    </DialogHeader>
                    <TripSettings trip={trip} onUpdate={() => { loadTrip(); setSettingsOpen(false); }} />
                  </DialogContent>
                </Dialog>
                <ExportDialog tripId={tripId} />
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-md border-0 p-1.5 rounded-2xl">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-[#14b8a6] data-[state=active]:text-white rounded-xl transition-all data-[state=active]:shadow-lg"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="discover" 
              className="data-[state=active]:bg-[#14b8a6] data-[state=active]:text-white rounded-xl transition-all data-[state=active]:shadow-lg"
            >
              Discover
            </TabsTrigger>
            <TabsTrigger 
              value="attractions" 
              className="data-[state=active]:bg-[#14b8a6] data-[state=active]:text-white rounded-xl transition-all data-[state=active]:shadow-lg"
            >
              Attractions
            </TabsTrigger>
            <TabsTrigger 
              value="costs" 
              className="data-[state=active]:bg-[#14b8a6] data-[state=active]:text-white rounded-xl transition-all data-[state=active]:shadow-lg"
            >
              Costs
            </TabsTrigger>
            <TabsTrigger 
              value="packing" 
              className="data-[state=active]:bg-[#14b8a6] data-[state=active]:text-white rounded-xl transition-all data-[state=active]:shadow-lg"
            >
              Packing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <TripOverview trip={trip} onTripUpdate={loadTrip} />
          </TabsContent>

          <TabsContent value="discover">
            <DiscoverTab tripId={tripId} trip={trip} />
          </TabsContent>

          <TabsContent value="attractions">
            <AttractionsTab tripId={tripId} currentUserId={currentUserId} trip={trip} />
          </TabsContent>

          <TabsContent value="costs">
            <CostsTab tripId={tripId} trip={trip} />
          </TabsContent>

          <TabsContent value="packing">
            <PackingTab tripId={tripId} trip={trip} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
