

'use client';

import React, { useState, useMemo } from 'react';
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
  DialogDescription
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type Employee } from '@/lib/data';
import { Loader2, Pencil, PlusCircle, Search, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';


const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('A valid email is required'),
  phone: z.string().min(10, 'A valid phone number is required'),
  role: z.string().min(1, 'Role is required'),
  salary: z.coerce.number().min(1, 'Salary is required'),
  team: z.string().optional(),
});

const staticEmployees: Employee[] = [
    { id: '1', name: 'Saurav Dhande', email: 'saurav@example.com', phone: '123-456-7890', role: 'Manager', salary: 75000, team: 'Operations', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '234-567-8901', role: 'Cashier', salary: 45000, team: 'Frontend', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', phone: '345-678-9012', role: 'Stocker', salary: 42000, team: 'Backend', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
    { id: '4', name: 'Emily Davis', email: 'emily@example.com', phone: '456-789-0123', role: 'Delivery Driver', salary: 50000, team: 'Logistics', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026707d' },
];

export default function AdminEmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>(staticEmployees);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
  });

  const handleAddNew = () => {
    setEditingEmployee(null);
    form.reset({ name: '', email: '', phone: '', role: '', salary: 0, team: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    form.reset({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      salary: employee.salary,
      team: employee.team
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (employeeId: string) => {
    // In a real app, you would call your Firestore delete function here
    setEmployees(employees.filter((e) => e.id !== employeeId));
    toast({ title: "Success", description: "Employee removed." });
  };

  const onSubmit = async (data: z.infer<typeof employeeSchema>) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (editingEmployee) {
      setEmployees(employees.map(e => e.id === editingEmployee.id ? { ...editingEmployee, ...data } : e));
      toast({ title: "Success", description: "Employee details updated." });
    } else {
      const newEmployee: Employee = {
        id: `emp_${Date.now()}`,
        ...data,
        avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`
      }
      setEmployees([...employees, newEmployee]);
      toast({ title: "Success", description: "New employee added." });
    }
    
    setIsDialogOpen(false);
    setIsSubmitting(false);
  };

  const filteredEmployees = useMemo(() => employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  ), [employees, searchTerm]);
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Employees</h1>

       <Tabs defaultValue="employees">
        <TabsList>
          <TabsTrigger value="employees">All Employees</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="leave">Leave Requests</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>
        <TabsContent value="employees" className="mt-6">
            <Card>
                <CardHeader>
                  <div className='flex justify-between items-center'>
                    <div>
                        <CardTitle>All Employees</CardTitle>
                        <CardDescription>View, add, edit, or remove employees.</CardDescription>
                    </div>
                     <Button onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Employee
                    </Button>
                  </div>
                   <div className="relative pt-4">
                      <Search className="absolute left-3 top-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, or role..."
                        className="pl-10 h-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                                        <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{employee.name}</p>
                                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{employee.role}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{employee.team || 'N/A'}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge>Active</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleEdit(employee)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => handleDelete(employee.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="teams" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Teams</CardTitle>
                    <CardDescription>Manage employee teams. Coming soon!</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This section will allow you to create and manage teams.</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="leave" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Leave Requests</CardTitle>
                    <CardDescription>Manage employee holidays and leave. Coming soon!</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This section will allow you to approve or reject leave requests.</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="payroll" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Payroll</CardTitle>
                    <CardDescription>Manage employee payments. Coming soon!</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This section will allow you to manage employee salaries and payments.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
             <DialogDescription>
              {editingEmployee ? 'Update the details for this employee.' : 'Fill out the form to add a new employee.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <ScrollArea className='h-96 p-4'>
                    <div className='space-y-4'>
                        <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input type="email" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl><Input type="tel" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl><Input placeholder="e.g. Cashier" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="salary"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Salary (Annual)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="team"
                        render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Assign to a team" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Frontend">Frontend</SelectItem>
                              <SelectItem value="Backend">Backend</SelectItem>
                              <SelectItem value="Logistics">Logistics</SelectItem>
                              <SelectItem value="Operations">Operations</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    </div>
                </ScrollArea>
                <div className='flex justify-end p-4'>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingEmployee ? 'Save Changes' : 'Add Employee'}
                    </Button>
                </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
