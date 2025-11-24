import {
	Calendar,
	CheckCircle2,
	Clock,
	Eye,
	Plus,
	Sparkles,
	Star,
	TrendingUp,
	User,
	Users,
	Vote,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";

interface AttractionsTabProps {
  tripId: string;
  currentUserId: string;
  trip: any;
}

export function AttractionsTab({ tripId, currentUserId, trip }: AttractionsTabProps) {
  const [attractions, setAttractions] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [userRankings, setUserRankings] = useState<{ [key: string]: number }>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showPersonalView, setShowPersonalView] = useState(false);
  const [optedInAttractions, setOptedInAttractions] = useState<Set<string>>(new Set());
  const [newAttraction, setNewAttraction] = useState({
    name: '',
    description: '',
    estimatedCost: '',
    category: 'activity',
    date: '',
    time: '',
    endTime: ''
  });

  useEffect(() => {
    loadAttractions();
  }, [tripId]);

  const loadAttractions = async () => {
    try {
      // Use mock data from trip prop
      if (trip && trip.attractions) {
        setAttractions(trip.attractions);
        
        // Set user rankings from mock data
        const myRankings: { [key: string]: number } = {};
        const optedIn = new Set<string>();
        
        trip.attractions.forEach((attraction: any) => {
          const myVote = attraction.votes?.find((v: any) => v.userId === currentUserId);
          if (myVote) {
            myRankings[attraction.id] = myVote.score;
          }
          
          // Check if user has opted in to this attraction
          if (attraction.optedInUsers?.includes(currentUserId)) {
            optedIn.add(attraction.id);
          }
        });
        
        setUserRankings(myRankings);
        setOptedInAttractions(optedIn);
      }
    } catch (error) {
      console.error('Error loading attractions:', error);
    }
  };

  const handleAddAttraction = async (e: React.FormEvent) => {
    e.preventDefault();
    // Demo mode - show message
    console.log('Demo version: Adding attractions is not available yet');
    setIsAddDialogOpen(false);
  };

  const handleRankingChange = (attractionId: string, value: number) => {
    setUserRankings({
      ...userRankings,
      [attractionId]: value
    });
  };

  const handleSaveRankings = async () => {
    // Demo mode - just show console message
    console.log('Demo version: Saving rankings is not available yet');
  };

  const handleToggleOptIn = (attractionId: string) => {
    const newOptedIn = new Set(optedInAttractions);
    if (newOptedIn.has(attractionId)) {
      newOptedIn.delete(attractionId);
    } else {
      newOptedIn.add(attractionId);
    }
    setOptedInAttractions(newOptedIn);
    // Demo mode - show message
    console.log('Demo version: Opt-in toggled for attraction', attractionId);
  };

  const handleTogglePersonalItinerary = async (attractionId: string, included: boolean) => {
    // Demo mode - use local toggle
    handleToggleOptIn(attractionId);
  };

  const getFilteredAttractions = () => {
    if (showPersonalView) {
      return attractions.filter(attr => optedInAttractions.has(attr.id));
    }
    return attractions;
  };

  const renderAttractionCard = (attraction: any, ranking?: any) => {
    const userRanking = userRankings[attraction.id] || 5;
    const isOptedIn = optedInAttractions.has(attraction.id);
    const submitter = trip.members.find((m: any) => m.id === attraction.addedBy);
    const optedInCount = attraction.optedInUsers?.length || 0;

    return (
      <Card key={attraction.id} className={`rounded-2xl border-0 shadow-md overflow-hidden hover:shadow-xl transition-all hover:scale-[1.01] ${isOptedIn ? 'ring-2 ring-[#14b8a6]' : ''}`}>
        <div className="h-1.5 bg-gradient-to-r from-[#14b8a6] via-[#ff7b6b] to-[#f4c542]" />
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <CardTitle className="text-xl">{attraction.name}</CardTitle>
                {attraction.isHiddenGem && (
                  <Badge className="bg-[#f4c542]/20 text-[#d4af37] border-[#f4c542]/40">
                    <Sparkles className="mr-1 size-3" />
                    Hidden Gem
                  </Badge>
                )}
                {isOptedIn && (
                  <Badge className="bg-[#14b8a6]/20 text-[#14b8a6] border-[#14b8a6]/30">
                    <CheckCircle2 className="mr-1 size-3" />
                    You're In!
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-1">
                {attraction.description}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 bg-gradient-to-br from-blue-50 to-cyan-50 px-3 py-2 rounded-lg">
                <TrendingUp className="size-4 text-blue-600" />
                <span className="text-2xl">
                  {attraction.averageScore.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {attraction.votes?.length || 0} votes
              </p>
              {optedInCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-teal-600 mt-1">
                  <CheckCircle2 className="size-3" />
                  {optedInCount} opted in
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(attraction.date || attraction.time) && (
              <div className="flex items-center gap-4 p-3 bg-[#7ba3d1]/10 rounded-xl flex-wrap">
                {attraction.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-[#7ba3d1]" />
                    <span className="text-sm text-gray-700">
                      {new Date(attraction.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                {(attraction.time || attraction.endTime) && (
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-[#7ba3d1]" />
                    <span className="text-sm text-gray-700">
                      {attraction.time && attraction.endTime 
                        ? `${attraction.time} - ${attraction.endTime}`
                        : attraction.time || attraction.endTime}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="size-6 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                  <User className="size-3.5 text-white" />
                </div>
                <span className="text-gray-600">
                  Suggested by {submitter?.name || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {attraction.estimatedCost > 0 && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200">
                    ${attraction.estimatedCost.toFixed(2)} per person
                  </Badge>
                )}
                {attraction.estimatedDuration && (
                  <Badge variant="outline" className="text-gray-600">
                    {attraction.estimatedDuration}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm">Your Rating</Label>
                <span className="flex items-center gap-1">
                  <Star className="size-4 text-yellow-500 fill-yellow-500" />
                  {userRanking}/10
                </span>
              </div>
              <Slider
                value={[userRanking]}
                onValueChange={(values) => handleRankingChange(attraction.id, values[0])}
                min={0}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg">
              <Label htmlFor={`opt-in-${attraction.id}`} className="cursor-pointer">
                {isOptedIn ? "I'm attending this activity" : "Opt in to this activity"}
              </Label>
              <Switch
                id={`opt-in-${attraction.id}`}
                checked={isOptedIn}
                onCheckedChange={() => handleToggleOptIn(attraction.id)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Attractions & Activities</CardTitle>
              <CardDescription>Submit ideas and vote on what to do</CardDescription>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="personal-view">Personal View</Label>
                <Switch
                  id="personal-view"
                  checked={showPersonalView}
                  onCheckedChange={setShowPersonalView}
                />
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#ff7b6b] hover:bg-[#ff6859] hover:shadow-lg hover:scale-105 transition-all rounded-full">
                    <Plus className="mr-2 size-4" />
                    Add Attraction
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-[#1e3a5f]">Add Attraction</DialogTitle>
                    <DialogDescription>
                      Suggest a place or activity for the group
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddAttraction} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., South Beach"
                        value={newAttraction.name}
                        onChange={(e) => setNewAttraction({ ...newAttraction, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Why should we go here?"
                        value={newAttraction.description}
                        onChange={(e) => setNewAttraction({ ...newAttraction, description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cost">Estimated Cost per Person ($)</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newAttraction.estimatedCost}
                        onChange={(e) => setNewAttraction({ ...newAttraction, estimatedCost: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newAttraction.date}
                          onChange={(e) => setNewAttraction({ ...newAttraction, date: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2 col-span-2">
                        <Label>Time</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="time" className="text-sm text-muted-foreground">Start Time</Label>
                            <Input
                              id="time"
                              type="time"
                              value={newAttraction.time}
                              onChange={(e) => setNewAttraction({ ...newAttraction, time: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="endTime" className="text-sm text-muted-foreground">End Time</Label>
                            <Input
                              id="endTime"
                              type="time"
                              value={newAttraction.endTime}
                              onChange={(e) => setNewAttraction({ ...newAttraction, endTime: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full">Add Attraction</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {attractions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No attractions yet. Be the first to suggest one!
          </CardContent>
        </Card>
      ) : getFilteredAttractions().length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <CheckCircle2 className="size-12 mx-auto mb-3 opacity-20" />
            <p>You haven't opted in to any activities yet</p>
            <p className="text-sm mt-1">Toggle the "Personal View" switch off to see all activities</p>
          </CardContent>
        </Card>
      ) : rankings.length === 0 ? (
        <>
          <div className="space-y-4">
            {getFilteredAttractions().map((attraction) => renderAttractionCard(attraction))}
          </div>
          {!showPersonalView && (
            <Button onClick={handleSaveRankings} className="w-full">
              Save Rankings
            </Button>
          )}
        </>
      ) : (
        <>
          <div className="space-y-4">
            {rankings.map((ranking) => renderAttractionCard(ranking.attraction, ranking))}
          </div>
          {!showPersonalView && (
            <Button onClick={handleSaveRankings} className="w-full">
              Save Rankings
            </Button>
          )}
        </>
      )}
    </div>
  );
}
