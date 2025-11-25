import { toast } from "sonner@2.0.3";
import { Check, Loader2, Package, Plus, Sparkles, Users } from "lucide-react";
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
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

interface PackingTabProps {
  tripId: string;
  trip: any;
}

export function PackingTab({ tripId, trip }: PackingTabProps) {
  const [packingList, setPackingList] = useState<any[]>([]);
  const [sharedItems, setSharedItems] = useState<any[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');

  useEffect(() => {
    loadPackingList();
    loadSharedItems();
  }, [tripId]);

  const loadPackingList = async () => {
    try {
      // Load packing list from trip prop (populated via API)
      if (trip && trip.packingLists && trip.packingLists.personal) {
        // Get current user's personal items (using user-1 as default)
        const personalItems = trip.packingLists.personal['user-1'] || [];
        setPackingList(personalItems);
      }
    } catch (error) {
      console.error('Error loading packing list:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSharedItems = async () => {
    try {
      // Load shared items from trip prop (populated via API)
      if (trip && trip.packingLists && trip.packingLists.shared) {
        setSharedItems(trip.packingLists.shared);
      }
    } catch (error) {
      console.error('Error loading shared items:', error);
    }
  };

  const handleGenerateList = async () => {
    setGenerating(true);
    setGenerationProgress(0);
    setGenerationStage('Analyzing trip details...');
    
    // Simulate AI generation process
    await new Promise(resolve => setTimeout(resolve, 800));
    setGenerationProgress(25);
    setGenerationStage('Considering destination and weather...');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    setGenerationProgress(50);
    setGenerationStage('Generating personalized items...');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    setGenerationProgress(75);
    setGenerationStage('Organizing by category...');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    setGenerationProgress(100);
    setGenerationStage('Complete!');
    
    // Load the actual list
    await loadPackingList();
    
    setTimeout(() => {
      setGenerating(false);
      setGenerationProgress(0);
      setGenerationStage('');
      toast.success('Packing list generated!', {
        description: 'Your personalized packing list is ready.'
      });
    }, 500);
  };

  const handleRegenerateList = async () => {
    setGenerating(true);
    setGenerationProgress(0);
    setGenerationStage('Re-analyzing trip details...');
    
    // Clear current list with animation
    setPackingList([]);
    
    await new Promise(resolve => setTimeout(resolve, 600));
    setGenerationProgress(30);
    setGenerationStage('Updating recommendations...');
    
    await new Promise(resolve => setTimeout(resolve, 700));
    setGenerationProgress(60);
    setGenerationStage('Refreshing items...');
    
    await new Promise(resolve => setTimeout(resolve, 700));
    setGenerationProgress(90);
    setGenerationStage('Finalizing...');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setGenerationProgress(100);
    
    // Reload the list
    await loadPackingList();
    
    setTimeout(() => {
      setGenerating(false);
      setGenerationProgress(0);
      setGenerationStage('');
      toast.success('Packing list regenerated!', {
        description: 'Your list has been updated with fresh recommendations.'
      });
    }, 500);
  };

  const handleToggleItem = async (itemId: string, packed: boolean) => {
    const updatedList = packingList.map(item => 
      item.id === itemId ? { ...item, isPacked: packed } : item
    );
    setPackingList(updatedList);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedList = packingList.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setPackingList(updatedList);
  };

  const handleToggleShared = async (itemId: string, shared: boolean) => {
    // Demo mode - just update local state
    console.log('Demo version: Toggling shared status is not available yet');
  };

  const handleToggleSharedItem = async (itemId: string, packed: boolean) => {
    const updatedShared = sharedItems.map(item => 
      item.id === itemId ? { ...item, isPacked: packed } : item
    );
    setSharedItems(updatedShared);
  };

  const handleAssignSharedItem = async (itemId: string, assignedTo: string) => {
    const updatedShared = sharedItems.map(item => 
      item.id === itemId ? { ...item, assignedTo } : item
    );
    setSharedItems(updatedShared);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    // Demo mode - show message
    console.log('Demo version: Adding items is not available yet');
    setNewItemName('');
  };

  const getPackedCount = () => packingList.filter(item => item.isPacked).length;

  const groupByCategory = () => {
    const grouped: { [key: string]: any[] } = {};
    packingList.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  };

  const categoryNames: { [key: string]: string } = {
    Clothing: 'Clothing',
    Toiletries: 'Toiletries',
    Documents: 'Documents',
    Electronics: 'Electronics',
    Accessories: 'Accessories',
    Footwear: 'Footwear',
    Beach: 'Beach',
    Entertainment: 'Entertainment',
    Safety: 'Safety',
    Transportation: 'Transportation',
    misc: 'Miscellaneous'
  };

  const getAvatarColor = (index: number) => {
    const colors = ['#14b8a6', '#ff7b6b', '#7ba3d1', '#f4c542', '#8ba888'];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-0 shadow-md overflow-hidden">
        <div className="h-1.5 bg-[#7ba3d1]" />
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-[#1e3a5f]">Packing List</CardTitle>
              <CardDescription>AI-generated based on your trip details</CardDescription>
            </div>
            {packingList.length === 0 ? (
              <Button 
                onClick={handleGenerateList}
                disabled={generating}
                className="bg-[#7ba3d1] hover:bg-[#6a92c0] hover:shadow-lg rounded-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Generate List
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleRegenerateList}
                  disabled={generating}
                  variant="outline"
                  className="border-[#7ba3d1] text-[#7ba3d1] hover:bg-[#7ba3d1] hover:text-white rounded-full"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 size-4" />
                      Regenerate
                    </>
                  )}
                </Button>
                <div className="text-right bg-[#7ba3d1]/10 px-4 py-2 rounded-2xl">
                  <p className="text-sm text-gray-500">Progress</p>
                  <p className="text-2xl text-[#7ba3d1]">
                    {getPackedCount()}/{packingList.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {generating && (
        <Card className="rounded-2xl border-0 shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="py-8">
            <div className="space-y-6 max-w-md mx-auto">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <Sparkles className="size-12 text-[#7ba3d1] animate-pulse" />
                  <div className="absolute inset-0 bg-[#7ba3d1]/20 blur-xl rounded-full animate-ping" />
                </div>
              </div>
              
              <div className="space-y-2 text-center">
                <p className="text-[#1e3a5f]">{generationStage}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-[#7ba3d1] h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">{generationProgress}% complete</p>
              </div>
              
              <div className="flex justify-center gap-2">
                <div className="size-2 bg-[#7ba3d1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="size-2 bg-[#ff7b6b] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="size-2 bg-[#f4c542] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {packingList.length > 0 && !generating && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>My Packing List</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(groupByCategory()).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="mb-3">{categoryNames[category] || category}</h3>
                    <div className="space-y-2">
                      {items.map(item => (
                        <div key={item.id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50">
                          <Checkbox
                            id={item.id}
                            checked={item.isPacked}
                            onCheckedChange={(checked) => handleToggleItem(item.id, checked === true)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <label 
                                htmlFor={item.id} 
                                className={`cursor-pointer flex-1 ${item.isPacked ? 'line-through text-gray-400' : ''}`}
                              >
                                {item.name}
                              </label>
                              {item.quantity && (
                                <div className="flex items-center gap-1 bg-[#7ba3d1]/10 rounded-full px-2 py-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    className="text-[#7ba3d1] hover:bg-[#7ba3d1]/20 rounded-full size-5 flex items-center justify-center text-sm"
                                  >
                                    -
                                  </button>
                                  <span className="text-sm text-[#1e3a5f] min-w-[20px] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    className="text-[#7ba3d1] hover:bg-[#7ba3d1]/20 rounded-full size-5 flex items-center justify-center text-sm"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Checkbox
                                id={`shared-${item.id}`}
                                checked={item.shared}
                                onCheckedChange={(checked) => handleToggleShared(item.id, checked === true)}
                              />
                              <label htmlFor={`shared-${item.id}`} className="text-xs text-gray-500 cursor-pointer">
                                Shared item
                              </label>
                            </div>
                            {item.shared && (
                              <div className="mt-2">
                                <Select 
                                  value={item.assignedTo || ''} 
                                  onValueChange={(value) => handleAssignSharedItem(item.id, value)}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Assign to..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {trip.members.map((member: any) => (
                                      <SelectItem key={member.id} value={member.id}>
                                        {member.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <form onSubmit={handleAddItem} className="flex gap-2 pt-4 border-t">
                  <Input
                    placeholder="Add custom item..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                  <Button type="submit" size="sm">
                    <Plus className="size-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shared Items</CardTitle>
                <CardDescription>Group coordination to avoid duplicates</CardDescription>
              </CardHeader>
              <CardContent>
                {sharedItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="size-12 mx-auto mb-3 opacity-20" />
                    <p>No shared items yet</p>
                    <p className="text-sm mt-1">Mark items as "shared" to coordinate with your group</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sharedItems.map((sharedItem) => {
                      const assignedMember = trip.members.find((m: any) => m.id === sharedItem.assignedTo);
                      
                      return (
                        <div key={sharedItem.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id={`shared-${sharedItem.id}`}
                              checked={sharedItem.isPacked}
                              onCheckedChange={(checked) => handleToggleSharedItem(sharedItem.id, checked === true)}
                            />
                            <div className="flex-1">
                              <label 
                                htmlFor={`shared-${sharedItem.id}`}
                                className={`cursor-pointer ${sharedItem.isPacked ? 'line-through text-gray-400' : ''}`}
                              >
                                {sharedItem.item}
                              </label>
                              <div className="mt-2">
                                <Select 
                                  value={sharedItem.assignedTo || ''} 
                                  onValueChange={(value) => handleAssignSharedItem(sharedItem.id, value)}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Assign to..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {trip.members.map((member: any) => (
                                      <SelectItem key={member.id} value={member.id}>
                                        {member.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {assignedMember && (
                                <Badge variant="secondary" className="mt-2">
                                  {assignedMember.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
