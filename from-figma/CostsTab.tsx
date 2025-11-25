import {
	DollarSign,
	Plus,
	Trash2,
	TrendingDown,
	TrendingUp,
	Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { costTrackerApi } from "../src/services/api.ts";
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

interface CostsTabProps {
  tripId: string;
  trip: any;
}

export function CostsTab({ tripId, trip }: CostsTabProps) {
  const [costs, setCosts] = useState<any[]>([]);
  const [balances, setBalances] = useState<any>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCost, setNewCost] = useState({
    description: '',
    amount: '',
    paidBy: '',
    splitAmong: [] as string[]
  });

  useEffect(() => {
    loadCosts();
  }, [tripId]);

  const loadCosts = async () => {
    try {
      // Load expenses from API
      const [percentageExpenses, moneyExpenses] = await Promise.all([
        costTrackerApi.listPercentageExpenses(),
        costTrackerApi.listMoneyExpenses(),
      ]);
      
      // Combine and transform expenses
      const allExpenses = [
        ...percentageExpenses.listedExpenses.map(exp => ({ ...exp, type: 'percentage' })),
        ...moneyExpenses.listedExpenses.map(exp => ({ ...exp, type: 'money' })),
      ];
      
      setCosts(allExpenses);
      
      // Calculate balances from expenses
      // This is a simplified calculation - you may want to enhance this
      const balances: Record<string, number> = {};
      // TODO: Implement proper balance calculation from expense details
      setBalances(balances);
    } catch (error) {
      console.error('Error loading costs:', error);
      setCosts([]);
    }
  };

  const getAvatarColor = (index: number) => {
    const colors = ['#14b8a6', '#ff7b6b', '#7ba3d1', '#f4c542', '#8ba888'];
    return colors[index % colors.length];
  };

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault();
    // Demo mode - show message
    console.log('Demo version: Adding costs is not available yet');
    setIsAddDialogOpen(false);
  };

  const handleDeleteCost = async (costId: string) => {
    // Demo mode - show message
    console.log('Demo version: Deleting costs is not available yet');
  };

  const handleSplitToggle = (memberId: string, checked: boolean) => {
    if (checked) {
      setNewCost({
        ...newCost,
        splitAmong: [...newCost.splitAmong, memberId]
      });
    } else {
      setNewCost({
        ...newCost,
        splitAmong: newCost.splitAmong.filter(id => id !== memberId)
      });
    }
  };

  const getMemberName = (memberId: string) => {
    return trip.members.find((m: any) => m.id === memberId)?.name || 'Unknown';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-0 shadow-md overflow-hidden">
        <div className="h-1.5 bg-[#f4c542]" />
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-[#1e3a5f]">Trip Expenses</CardTitle>
              <CardDescription>Track costs and split them among the group</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-[#f4c542] hover:bg-[#e0b138] hover:shadow-lg hover:scale-105 transition-all rounded-full">
                    <Plus className="mr-2 size-4" />
                    Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-[#1e3a5f]">Add Expense</DialogTitle>
                    <DialogDescription>
                      Record a trip expense and split it among members
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCost} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="e.g., Airbnb for 3 nights"
                        value={newCost.description}
                        onChange={(e) => setNewCost({ ...newCost, description: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Total Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newCost.amount}
                        onChange={(e) => setNewCost({ ...newCost, amount: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paidBy">Paid By</Label>
                      <Select value={newCost.paidBy} onValueChange={(value) => setNewCost({ ...newCost, paidBy: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select member" />
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

                    <div className="space-y-2">
                      <Label>Split Among</Label>
                      <div className="space-y-2 border rounded-md p-3">
                        {trip.members.map((member: any) => (
                          <div key={member.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`split-${member.id}`}
                              checked={newCost.splitAmong.includes(member.id)}
                              onCheckedChange={(checked) => handleSplitToggle(member.id, checked === true)}
                            />
                            <label htmlFor={`split-${member.id}`} className="text-sm cursor-pointer">
                              {member.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button type="submit" className="w-full">Add Expense</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Member Balances</CardTitle>
            <CardDescription>Who owes and who's owed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {trip.members.map((member: any, index: number) => {
              const balance = balances[member.id] || 0;
              const isPositive = balance > 0;
              const isZero = Math.abs(balance) < 0.01;

              return (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="size-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: getAvatarColor(index) }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p>{member.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {isZero ? (
                      <Badge variant="secondary">Settled</Badge>
                    ) : (
                      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                        <span>{formatCurrency(Math.abs(balance))}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>All trip expenses</CardDescription>
          </CardHeader>
          <CardContent>
            {costs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No expenses yet</p>
            ) : (
              <div className="space-y-3">
                {costs.map((cost) => (
                  <div key={cost.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <DollarSign className="size-4 text-green-600" />
                        <p>{cost.description}</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Paid by {getMemberName(cost.paidBy)} · Split {cost.splitAmong.length} ways
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatCurrency(cost.amount / cost.splitAmong.length)} per person
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{formatCurrency(cost.amount)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteCost(cost.id)}
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
