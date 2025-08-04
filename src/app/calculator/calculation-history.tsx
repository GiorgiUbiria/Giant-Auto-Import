"use client";

import { useAtom, useAtomValue } from 'jotai';
import { calculationHistoryAtom, loadCalculationAtom, clearHistoryAtom } from '@/lib/calculator-atoms';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Clock, DollarSign } from "lucide-react";
import { format } from 'date-fns';

export function CalculationHistory() {
    const history = useAtomValue(calculationHistoryAtom);
    const [, loadCalculation] = useAtom(loadCalculationAtom);
    const [, clearHistory] = useAtom(clearHistoryAtom);

    if (history.length === 0) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Calculation History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">
                        No calculations yet. Start calculating to see your history here.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Calculations
                </CardTitle>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={clearHistory}
                    className="text-destructive hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-64">
                    <div className="space-y-3">
                        {history.map((calculation) => (
                            <div
                                key={calculation.id}
                                className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => loadCalculation(calculation.id)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-primary" />
                                        <span className="font-semibold">
                                            ${calculation.estimatedFee.toFixed(2)}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {format(calculation.timestamp, 'MMM dd, HH:mm')}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <div>Bid: ${calculation.purchaseFee.toFixed(2)}</div>
                                    <div>{calculation.auction} - {calculation.auctionLocation}</div>
                                    <div>Port: {calculation.port}</div>
                                    {calculation.additionalFees.length > 0 && (
                                        <div>Fees: {calculation.additionalFees.join(', ')}</div>
                                    )}
                                    {calculation.insurance && (
                                        <div className="text-primary">Insurance included</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
} 