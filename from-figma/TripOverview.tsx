import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Users, MapPin, Calendar, UserPlus, Clock } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { getSupabaseClient, projectId } from '../../utils/supabase/client';

interface TripOverviewProps {
  trip: any;
  onTripUpdate: () => void;
}

export function TripOverview({ trip, onTripUpdate }: TripOverviewProps) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [locationImageUrl, setLocationImageUrl] = useState<string>('');

  useEffect(() => {
    loadLocationImage();
  }, [trip.destination]);

  const loadLocationImage = async () => {
    try {
      // Extract city name from destination for better image results
      const cityName = trip.destination.split(',')[0].trim();
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(cityName + ' travel')}&client_id=1Maa5Z28s4LQNWMEnCo8V89Bc6uTO3bepJL_Kl69Vj0&per_page=1`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setLocationImageUrl(data.results[0].urls.regular);
      }
    } catch (error) {
      console.error('Error loading location image:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getTripDuration = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('This is a demo version. Inviting members is not available yet.');
    
    // Close dialog after showing error
    setTimeout(() => {
      setInviteError('');
    }, 3000);
  };

  const getAvatarColor = (index: number) => {
    const colors = ['#14b8a6', '#ff7b6b', '#7ba3d1', '#f4c542', '#8ba888'];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Trip Members Section */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1.5 bg-[#ff7b6b]" />
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5 text-[#ff7b6b]" />
                Trip Members
              </CardTitle>
              <CardDescription>People going on this trip</CardDescription>
            </div>
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#14b8a6] hover:bg-[#0d9488] text-white">
                  <UserPlus className="mr-2 size-4" />
                  Invite
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Member</DialogTitle>
                  <DialogDescription>
                    Enter the email address of the person you want to invite
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInviteMember} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteEmail">Email Address</Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      placeholder="friend@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>

                  {inviteError && (
                    <div className="text-red-500 text-sm">{inviteError}</div>
                  )}

                  <Button type="submit" className="w-full" disabled={inviteLoading}>
                    {inviteLoading ? 'Inviting...' : 'Send Invite'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trip.members.map((member: any, index: number) => (
              <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                <div 
                  className="size-10 rounded-full flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: getAvatarColor(index) }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p>{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
                {member.role === 'owner' && (
                  <span className="text-xs bg-[#14b8a6]/10 text-[#14b8a6] px-3 py-1 rounded-full border border-[#14b8a6]/20">Owner</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}