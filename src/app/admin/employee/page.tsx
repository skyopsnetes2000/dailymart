
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
import { type Employee, type Team, type Holiday } from '@/lib/data';
import { Loader2, Pencil, PlusCircle, Search, Trash2, Users, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths, getDaysInMonth, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';


const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('A valid email is required'),
  phone: z.string().min(10, 'A valid phone number is required'),
  role: z.string().min(1, 'Role is required'),
  salary: z.coerce.number().min(1, 'Salary is required'),
  team: z.string().optional(),
});

const teamSchema = z.object({
    name: z.string().min(1, 'Team name is required'),
    memberIds: z.array(z.string()),
})

const staticEmployees: Employee[] = [
    { id: '1', name: 'Saurav Dhande', email: 'saurav@example.com', phone: '123-456-7890', role: 'Manager', salary: 75000, team: 'Operations', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '234-567-8901', role: 'Cashier', salary: 45000, team: 'Frontend', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', phone: '345-678-9012', role: 'Stocker', salary: 42000, team: 'Backend', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
    { id: '4', name: 'Emily Davis', email: 'emily@example.com', phone: '456-789-0123', role: 'Delivery Driver', salary: 50000, team: 'Logistics', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026707d' },
];

const staticTeams: Team[] = [
    { id: '1', name: 'Operations', memberIds: ['1'] },
    { id: '2', name: 'Frontend', memberIds: ['2'] },
    { id: '3', name: 'Backend', memberIds: ['3'] },
    { id: '4', name: 'Logistics', memberIds: ['4'] },
];

type AttendanceStatus = 'present' | 'absent' | 'holiday';
type AttendanceRecord = { [date: string]: AttendanceStatus }; // date is YYYY-MM-DD
type EmployeeAttendance = { [employeeId: string]: AttendanceRecord };

const initialHolidays: Holiday[] = [
    { date: new Date('2024-08-15'), name: 'Independence Day' },
    { date: new Date('2024-10-02'), name: 'Gandhi Jayanti' }
];

function HolidayManager() {
    const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [holidayName, setHolidayName] = useState('');
    const { toast } = useToast();

    const handleAddHoliday = () => {
        if (!selectedDate || !holidayName.trim()) {
            toast({
                title: 'Missing Information',
                description: 'Please select a date and enter a name for the holiday.',
                variant: 'destructive',
            });
            return;
        }

        if (holidays.some(h => isSameDay(h.date, selectedDate))) {
            toast({
                title: 'Date Already Marked',
                description: 'This date is already set as a holiday.',
                variant: 'destructive',
            });
            return;
        }
        
        const newHolidays = [...holidays, { date: selectedDate, name: holidayName.trim() }]
            .sort((a,b) => a.date.getTime() - b.date.getTime());

        setHolidays(newHolidays);
        setHolidayName('');
        setSelectedDate(undefined);
        toast({
            title: 'Holiday Added',
            description: `${holidayName.trim()} has been added to the calendar.`,
        });
    };

    const handleDeleteHoliday = (dateToDelete: Date) => {
        setHolidays(holidays.filter(h => !isSameDay(h.date, dateToDelete)));
        toast({
            title: 'Holiday Removed',
            description: 'The holiday has been removed.',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Holidays</CardTitle>
                <CardDescription>Add or remove company-wide public holidays.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="font-semibold">Add New Holiday</h3>
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                    />
                    <Input 
                        placeholder="Holiday Name (e.g., Diwali)"
                        value={holidayName}
                        onChange={(e) => setHolidayName(e.target.value)}
                    />
                    <Button onClick={handleAddHoliday} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Holiday
                    </Button>
                </div>
                 <div className="space-y-4">
                    <h3 className="font-semibold">Upcoming Holidays</h3>
                    <ScrollArea className="h-96">
                        <div className="space-y-2">
                        {holidays.length > 0 ? holidays.map((holiday, index) => (
                            <div key={index} className="flex items-center justify-between rounded-md border p-3">
                                <div>
                                    <p className="font-medium">{holiday.name}</p>
                                    <p className="text-sm text-muted-foreground">{format(holiday.date, 'MMMM do, yyyy')}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteHoliday(holiday.date)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        )) : (
                            <p className="text-center text-muted-foreground pt-10">No upcoming holidays scheduled.</p>
                        )}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    )
}

function AttendanceManager() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
    const [attendance, setAttendance] = useState<EmployeeAttendance>({});
    const [employees] = useState<Employee[]>(staticEmployees);
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const weekStartsOn = 1; // Monday
    const calendarStart = startOfWeek(monthStart, { weekStartsOn });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const getAttendanceStatus = (employeeId: string, day: Date): AttendanceStatus => {
        const dateKey = format(day, 'yyyy-MM-dd');
        if (holidays.some(h => isSameDay(h.date, day))) return 'holiday';
        if (getDay(day) === 0) return 'holiday'; // Sunday is a holiday
        return attendance[employeeId]?.[dateKey] || 'present';
    };

    const handleDayClick = (day: Date) => {
        const isSunday = getDay(day) === 0;
        const isHoliday = holidays.some(h => isSameDay(h.date, day));
        if (isSunday || isHoliday) return;
        
        setSelectedDay(day);
        setIsAttendanceDialogOpen(true);
    };

    const handleAttendanceChange = (employeeId: string, isPresent: boolean) => {
        if (!selectedDay) return;
        const dateKey = format(selectedDay, 'yyyy-MM-dd');
        setAttendance(prev => {
            const newAttendance = { ...prev };
            if (!newAttendance[employeeId]) newAttendance[employeeId] = {};
            newAttendance[employeeId][dateKey] = isPresent ? 'present' : 'absent';
            return newAttendance;
        });
    }
    
    const calculateSummary = (employeeId: string) => {
        const daysInMonth = eachDayOfInterval({start: monthStart, end: monthEnd});
        const workingDays = daysInMonth.filter(day => getDay(day) !== 0 && !holidays.some(h => isSameDay(h.date, day))).length;
        let absentDays = 0;

        daysInMonth.forEach(day => {
            if (getAttendanceStatus(employeeId, day) === 'absent') {
                absentDays++;
            }
        });
        const presentDays = workingDays - absentDays;

        return { workingDays, absentDays, presentDays };
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Employee Attendance</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}><ChevronLeft /></Button>
                        <span className="font-semibold text-lg">{format(currentDate, 'MMMM yyyy')}</span>
                        <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}><ChevronRight /></Button>
                    </div>
                </div>
                <CardDescription>Click on a date to mark attendance for that day. Sundays and public holidays are excluded.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 text-center font-semibold text-sm text-muted-foreground border-b pb-2 mb-2">
                    {weekdays.map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7">
                    {calendarDays.map((day) => {
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isSunday = getDay(day) === 0;
                        const isHoliday = holidays.some(h => isSameDay(h.date, day));
                        
                        return (
                            <div
                                key={day.toString()}
                                onClick={() => isCurrentMonth && handleDayClick(day)}
                                className={cn(
                                    "h-16 border-t border-l p-2 text-sm flex flex-col",
                                    !isCurrentMonth && "text-muted-foreground/50 bg-muted/20",
                                    (isSunday || isHoliday) && isCurrentMonth && "bg-muted/50 cursor-not-allowed",
                                    isCurrentMonth && !(isSunday || isHoliday) && "cursor-pointer hover:bg-accent"
                                )}
                            >
                                <span className="font-semibold">{format(day, 'd')}</span>
                                {isHoliday && isCurrentMonth && <span className="text-xs text-blue-600 truncate">{holidays.find(h=>isSameDay(h.date, day))?.name}</span>}
                            </div>
                        );
                    })}
                </div>

                 <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Attendance for {selectedDay && format(selectedDay, 'do MMMM, yyyy')}</DialogTitle>
                            <DialogDescription>Toggle the switch to mark an employee as absent.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <ScrollArea className="h-64">
                                <div className="space-y-4 pr-4">
                                {employees.map(employee => {
                                    const status = selectedDay ? getAttendanceStatus(employee.id, selectedDay) : 'present';
                                    const isPresent = status === 'present' || status === 'holiday';
                                    return (
                                        <div key={employee.id} className="flex items-center justify-between rounded-md border p-3">
                                            <Label htmlFor={`att-${employee.id}`} className="font-medium">{employee.name}</Label>
                                            <div className='flex items-center gap-2'>
                                                <span className={cn('text-sm', isPresent ? 'text-green-600' : 'text-red-600')}>
                                                    {isPresent ? 'Present' : 'Absent'}
                                                </span>
                                                <Switch
                                                    id={`att-${employee.id}`}
                                                    checked={isPresent}
                                                    onCheckedChange={(checked) => handleAttendanceChange(employee.id, checked)}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                                </div>
                            </ScrollArea>
                        </div>
                    </DialogContent>
                </Dialog>
                
                 <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className='text-lg'>Monthly Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead className='text-right'>Working Days</TableHead>
                                    <TableHead className='text-right'>Present</TableHead>
                                    <TableHead className='text-right'>Absent</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.map(employee => {
                                    const summary = calculateSummary(employee.id);
                                    return (
                                        <TableRow key={employee.id}>
                                            <TableCell className="font-medium">{employee.name}</TableCell>
                                            <TableCell className="text-right font-medium">{summary.workingDays}</TableCell>
                                            <TableCell className="text-right text-green-600 font-bold">{summary.presentDays}</TableCell>
                                            <TableCell className="text-right text-red-600 font-bold">{summary.absentDays}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                 </Card>
            </CardContent>
        </Card>
    );
}

export default function AdminEmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>(staticEmployees);
  const [teams, setTeams] = useState<Team[]>(staticTeams);
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const employeeForm = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
  });
  
  const teamForm = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema)
  })

  const handleAddNewEmployee = () => {
    setEditingEmployee(null);
    employeeForm.reset({ name: '', email: '', phone: '', role: '', salary: 0, team: '' });
    setIsEmployeeDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    employeeForm.reset({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      salary: employee.salary,
      team: employee.team
    });
    setIsEmployeeDialogOpen(true);
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    // In a real app, you would also remove the employee from any teams
    setEmployees(employees.filter((e) => e.id !== employeeId));
    toast({ title: "Success", description: "Employee removed." });
  };
  
  const handleAddNewTeam = () => {
    setEditingTeam(null);
    teamForm.reset({ name: '', memberIds: [] });
    setIsTeamDialogOpen(true);
  }

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    teamForm.reset({ name: team.name, memberIds: team.memberIds });
    setIsTeamDialogOpen(true);
  }

  const handleDeleteTeam = (teamId: string) => {
    setTeams(teams.filter(t => t.id !== teamId));
    // Also update employees who were in this team
    setEmployees(employees.map(e => e.team === teams.find(t=>t.id===teamId)?.name ? {...e, team: undefined} : e));
    toast({ title: "Success", description: "Team deleted." });
  }

  const onEmployeeSubmit = async (data: z.infer<typeof employeeSchema>) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
    
    setIsEmployeeDialogOpen(false);
    setIsSubmitting(false);
  };
  
  const onTeamSubmit = async (data: z.infer<typeof teamSchema>) => {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if(editingTeam) {
          setTeams(teams.map(t => t.id === editingTeam.id ? {...editingTeam, ...data} : t));
          toast({ title: "Success", description: "Team updated." });
      } else {
          const newTeam: Team = { id: `team_${Date.now()}`, ...data };
          setTeams([...teams, newTeam]);
          toast({ title: "Success", description: "Team created." });
      }
      
      // Update team assignment on employee records
      const updatedEmployees = employees.map(emp => {
         const team = teams.find(t => t.memberIds.includes(emp.id));
         return {...emp, team: team?.name };
      });
      setEmployees(updatedEmployees);
      
      setIsTeamDialogOpen(false);
      setIsSubmitting(false);
  }

  const filteredEmployees = useMemo(() => employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  ), [employees, searchTerm]);
  
  const getInitials = (name: string) => {
    if(!name) return '';
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
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
        </TabsList>
        <TabsContent value="employees" className="mt-6">
            <Card>
                <CardHeader>
                  <div className='flex justify-between items-center'>
                    <div>
                        <CardTitle>All Employees</CardTitle>
                        <CardDescription>View, add, edit, or remove employees.</CardDescription>
                    </div>
                     <Button onClick={handleAddNewEmployee}>
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
                                  onClick={() => handleEditEmployee(employee)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => handleDeleteEmployee(employee.id)}
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
                    <div className='flex justify-between items-center'>
                      <div>
                        <CardTitle>Teams</CardTitle>
                        <CardDescription>Create and manage employee teams.</CardDescription>
                      </div>
                      <Button onClick={handleAddNewTeam}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create Team
                      </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {teams.map(team => {
                        const members = employees.filter(e => team.memberIds.includes(e.id));
                        return (
                          <Card key={team.id}>
                            <CardHeader>
                              <div className='flex justify-between items-start'>
                                <div>
                                  <CardTitle className='text-lg'>{team.name}</CardTitle>
                                  <CardDescription>{members.length} member(s)</CardDescription>
                                </div>
                                <div className='flex gap-1'>
                                  <Button variant="ghost" size="icon" className='h-8 w-8' onClick={() => handleEditTeam(team)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className='h-8 w-8 text-destructive' onClick={() => handleDeleteTeam(team.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex -space-x-2 overflow-hidden">
                                {members.slice(0,5).map(member => (
                                  <Avatar key={member.id} className='h-8 w-8 border-2 border-background'>
                                    <AvatarImage src={member.avatarUrl} />
                                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                  </Avatar>
                                ))}
                                {members.length > 5 && (
                                    <Avatar className='h-8 w-8 border-2 border-background'>
                                        <AvatarFallback>+{members.length - 5}</AvatarFallback>
                                    </Avatar>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="attendance" className="mt-6">
            <AttendanceManager />
        </TabsContent>
        <TabsContent value="holidays" className="mt-6">
            <HolidayManager />
        </TabsContent>
      </Tabs>
      
      <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
             <DialogDescription>
              {editingEmployee ? 'Update the details for this employee.' : 'Fill out the form to add a new employee.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...employeeForm}>
            <form onSubmit={employeeForm.handleSubmit(onEmployeeSubmit)} className="space-y-4">
                <ScrollArea className='h-96 p-4'>
                    <div className='space-y-4'>
                        <FormField
                        control={employeeForm.control}
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
                        control={employeeForm.control}
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
                        control={employeeForm.control}
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
                        control={employeeForm.control}
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
                        control={employeeForm.control}
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
                        control={employeeForm.control}
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
                              {teams.map(team => <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>)}
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
      
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent>
            <DialogHeader>
                 <DialogTitle>{editingTeam ? 'Edit Team' : 'Create New Team'}</DialogTitle>
                 <DialogDescription>
                    {editingTeam ? 'Update the team name and members.' : 'Create a new team and assign members.'}
                 </DialogDescription>
            </DialogHeader>
             <Form {...teamForm}>
                <form onSubmit={teamForm.handleSubmit(onTeamSubmit)} className="space-y-6">
                    <FormField
                        control={teamForm.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Team Name</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={teamForm.control}
                        name="memberIds"
                        render={({ field }) => (
                            <FormItem>
                               <FormLabel>Members</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}>
                                                <div className='flex gap-1'>
                                                    <Users className='h-4 w-4' />
                                                    {field.value?.length ? `${field.value.length} selected` : 'Select members'}
                                                </div>
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search employees..." />
                                            <CommandList>
                                                <CommandEmpty>No employees found.</CommandEmpty>
                                                <CommandGroup>
                                                    {employees.map(employee => (
                                                        <CommandItem
                                                            key={employee.id}
                                                            onSelect={() => {
                                                                const currentIds = field.value || [];
                                                                if (currentIds.includes(employee.id)) {
                                                                    field.onChange(currentIds.filter(id => id !== employee.id));
                                                                } else {
                                                                    field.onChange([...currentIds, employee.id]);
                                                                }
                                                            }}
                                                        >
                                                            <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", field.value?.includes(employee.id) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                                              <Check className={cn("h-4 w-4")} />
                                                            </div>
                                                            {employee.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <div className='flex justify-end'>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingTeam ? 'Save Changes' : 'Create Team'}
                        </Button>
                    </div>
                </form>
             </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    