
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type ShopRequest } from '@/lib/data';
import { Loader2, CheckCircle, XCircle, FileText, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getShopRequests, updateShopRequestStatus } from '@/lib/firestore';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

const statusColors = {
    pending: 'bg-yellow-500',
    approved: 'bg-green-500',
    rejected: 'bg-red-500',
};

export default function AdminApprovalRequestsPage() {
    const [requests, setRequests] = useState<ShopRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { toast } = useToast();

    const fetchRequests = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const allRequests = await getShopRequests();
            setRequests(allRequests);
        } catch (error) {
            console.error("Failed to fetch shop requests:", error);
            toast({
                title: 'Error',
                description: 'Could not load approval requests.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);
    
    const handleStatusChange = async (requestId: string, userId: string, newStatus: 'approved' | 'rejected') => {
        try {
            await updateShopRequestStatus(requestId, userId, newStatus);
            setRequests(prev => prev.map(req => 
                req.id === requestId ? { ...req, status: newStatus } : req
            ));
            toast({
                title: `Request ${newStatus}`,
                description: `The request has been successfully ${newStatus}.`,
            });
        } catch (error) {
             console.error(`Failed to ${newStatus} request:`, error);
             toast({
                title: 'Update Failed',
                description: 'Could not update the request status.',
                variant: 'destructive',
            });
        }
    }

    const filteredRequests = requests.filter(req => 
        filterStatus === 'all' || req.status === filterStatus
    );

    if (loading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <div className='flex justify-between items-center'>
                 <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold">Approval Requests</h1>
                    <Button variant="outline" size="icon" onClick={fetchRequests} disabled={isRefreshing}>
                        <RefreshCw className={isRefreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                    </Button>
                </div>
                <Select onValueChange={(value) => setFilterStatus(value as any)} defaultValue="pending">
                    <SelectTrigger className="w-[180px] h-10">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Card>
                <CardContent className="mt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Shop Name</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Submitted On</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {filteredRequests.length > 0 ? filteredRequests.map(req => (
                            <TableRow key={req.id}>
                                <TableCell className="font-medium">{req.shopName}</TableCell>
                                <TableCell>
                                    <div>{req.contactEmail}</div>
                                    <div className="text-sm text-muted-foreground">{req.contactNumber}</div>
                                </TableCell>
                                <TableCell>{format(new Date(req.submittedAt), 'PP')}</TableCell>
                                <TableCell>
                                    <Badge className={`${statusColors[req.status]} hover:${statusColors[req.status]}`}>
                                        {req.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm"><FileText className="mr-2 h-4 w-4" />View Docs</Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl">
                                                <DialogHeader>
                                                    <DialogTitle>Documents for {req.shopName}</DialogTitle>
                                                    <DialogDescription>GSTIN: {req.gstinNumber || 'N/A'}</DialogDescription>
                                                </DialogHeader>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 max-h-[70vh] overflow-y-auto">
                                                    {Object.entries(req.documents).map(([key, url]) => (
                                                        <div key={key} className="space-y-2">
                                                            <h4 className="font-semibold text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                                                            <a href={url} target="_blank" rel="noopener noreferrer">
                                                                <Image src={url} alt={key} width={300} height={200} className="rounded-md object-cover border" />
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        {req.status === 'pending' && (
                                            <>
                                                <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" onClick={() => handleStatusChange(req.id, req.userId, 'approved')}>
                                                    <CheckCircle className="h-5 w-5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleStatusChange(req.id, req.userId, 'rejected')}>
                                                    <XCircle className="h-5 w-5" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                           )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    No requests with status &quot;{filterStatus}&quot;.
                                </TableCell>
                            </TableRow>
                           )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
