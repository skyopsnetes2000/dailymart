

'use client';

import PageHeader from "@/components/shared/page-header";
import { type Order, type ReturnRequestItem } from "@/lib/data";
import { notFound, useParams } from "next/navigation";
import OrderTracker from "@/components/order-tracker";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format, differenceInHours } from "date-fns";
import { useEffect, useState } from "react";
import { Loader2, MessageSquareWarning, Minus, Plus } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { submitReturnRequest } from "@/lib/firestore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


function ReturnRequestDialog({ order, onReturnSuccess, disabled, disabledReason }: { order: Order, onReturnSuccess: () => void, disabled: boolean, disabledReason: string }) {
    const [selectedItems, setSelectedItems] = useState<ReturnRequestItem[]>([]);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Initialize selectedItems with quantity 0 for all order items
        setSelectedItems(order.items.map(item => ({ productName: item.productName, quantity: 0 })));
    }, [order.items]);
    

    const handleQuantityChange = (productName: string, change: number) => {
        setSelectedItems(prev => {
            const itemToUpdate = prev.find(item => item.productName === productName);
            const originalItem = order.items.find(item => item.productName === productName);
            if (!itemToUpdate || !originalItem) return prev;
            
            const newQuantity = itemToUpdate.quantity + change;
            if (newQuantity >= 0 && newQuantity <= originalItem.quantity) {
                return prev.map(item =>
                    item.productName === productName
                        ? { ...item, quantity: newQuantity }
                        : item
                );
            }
            return prev;
        });
    };
    
    const handleSubmit = async () => {
      const itemsToReturn = selectedItems.filter(item => item.quantity > 0);

      if (itemsToReturn.length === 0) {
        toast({ title: "No items selected", description: "Please select a quantity for at least one item to return.", variant: "destructive" });
        return;
      }
      if (!reason.trim()) {
        toast({ title: "Reason required", description: "Please provide a reason for your request.", variant: "destructive" });
        return;
      }
      setIsSubmitting(true);
      try {
        const returnRequest = {
            items: itemsToReturn,
            reason,
            date: new Date().toISOString()
        }
        await submitReturnRequest(order.id, returnRequest);
        toast({ title: "Request Submitted", description: "Your return request has been submitted successfully." });
        onReturnSuccess();
      } catch (error) {
        console.error("Failed to submit return request:", error);
        toast({ title: "Submission Failed", description: "Could not submit your request. Please try again.", variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    };

    const dialogTriggerButton = (
        <Button variant="outline" disabled={disabled}>
            <MessageSquareWarning className="mr-2 h-4 w-4" />
            Report an Issue
        </Button>
    );

    return (
        <Dialog>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {/* The Tooltip requires a single child, so if the button is disabled, we need to wrap it. */}
                        {disabled ? <div>{dialogTriggerButton}</div> : dialogTriggerButton}
                    </TooltipTrigger>
                    {disabled && <TooltipContent><p>{disabledReason}</p></TooltipContent>}
                </Tooltip>
            </TooltipProvider>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Report an Issue</DialogTitle>
                    <DialogDescription>
                        Select the item(s) you have an issue with and describe the problem.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Which items are you having issues with?</Label>
                        {order.items.map(item => {
                             const selectedItem = selectedItems.find(si => si.productName === item.productName);
                            return (
                                <div key={item.productName} className="flex items-center justify-between space-x-2 rounded-md border p-3">
                                    <label htmlFor={item.productName} className="text-sm font-medium leading-none">
                                        {item.productName} <span className="text-xs text-muted-foreground">(Ordered: {item.quantity})</span>
                                    </label>
                                     <div className="flex items-center gap-2">
                                        <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => handleQuantityChange(item.productName, -1)} disabled={selectedItem?.quantity === 0}>
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-4 text-center">{selectedItem?.quantity || 0}</span>
                                        <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => handleQuantityChange(item.productName, 1)} disabled={selectedItem?.quantity === item.quantity}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reason">Please describe the issue</Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., The item was damaged, wrong item received, etc."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}

export default function OrderDetailsPage() {
    const params = useParams();
    const { id } = params;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || typeof id !== 'string') {
          setLoading(false);
          return;
        }

        const orderRef = doc(db, "orders", id);
        const unsubscribe = onSnapshot(orderRef, (docSnap) => {
            if (docSnap.exists()) {
                setOrder({ ...docSnap.data(), id: docSnap.id } as Order);
            } else {
                setOrder(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching order details:", error);
            setOrder(null);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [id]);

    if (loading) {
        return (
             <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
             </div>
        )
    }

    if (!order) {
        notFound();
    }

    const canReportIssue = () => {
        if (order.status !== 'Delivered') return { can: false, reason: 'You can only report an issue for delivered orders.' };

        const deliveryEvent = order.trackingHistory.find(h => h.status === 'Delivered');
        if (!deliveryEvent) return { can: false, reason: 'Delivery time could not be determined.' };

        const deliveryDate = new Date(deliveryEvent.date);
        const hoursSinceDelivery = differenceInHours(new Date(), deliveryDate);
        
        if (hoursSinceDelivery > 12) {
            return { can: false, reason: 'The 12-hour window to report an issue has passed.' };
        }
        
        return { can: true, reason: '' };
    }
    
    const issueReportStatus = canReportIssue();

    return (
        <div>
            <PageHeader title="Order Details" />
            <div className="p-4 sm:p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Order #{order.id}</CardTitle>
                        <CardDescription>Placed on {format(new Date(order.date), 'MM/dd/yyyy')} &bull; Total: ${order.total.toFixed(2)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h4 className="font-semibold mb-2">Items</h4>
                        <ul className="space-y-1 text-muted-foreground">
                            {order.items.map((item, index) => (
                                <li key={index} className="flex justify-between">
                                    <span>{item.productName} (x{item.quantity})</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                     {order.status === 'Delivered' && (
                        <CardFooter>
                           <ReturnRequestDialog 
                                order={order} 
                                onReturnSuccess={() => {}} 
                                disabled={!issueReportStatus.can}
                                disabledReason={issueReportStatus.reason}
                            />
                        </CardFooter>
                    )}
                </Card>

                {order.returnRequest && (
                     <Card className="border-amber-400">
                        <CardHeader>
                            <CardTitle className="text-amber-600">Return Request Details</CardTitle>
                            <CardDescription>Submitted on {format(new Date(order.returnRequest.date), 'MM/dd/yyyy')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold">Items Requested:</p>
                             <ul className="list-disc list-inside text-muted-foreground">
                                {order.returnRequest.items.map(item => <li key={item.productName}>{item.productName} (x{item.quantity})</li>)}
                            </ul>
                            <p className="font-semibold mt-2">Reason:</p>
                            <p className="text-muted-foreground">{order.returnRequest.reason}</p>
                        </CardContent>
                    </Card>
                )}


                <Card>
                    <CardHeader>
                        <CardTitle>Order Tracking</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <OrderTracker order={order} />
                    </CardContent>
                </Card>

                {order.shippingAddress && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Address</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold">{order.customerName}</p>
                            <p className="text-muted-foreground">{order.shippingAddress.line1}</p>
                            {order.shippingAddress.landmark && <p className="text-muted-foreground">{order.shippingAddress.landmark}</p>}
                            <p className="text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                            <p className="text-muted-foreground">Mobile: {order.shippingAddress.mobile}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
