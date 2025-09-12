
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Loader2, Monitor, Moon, Sun, Download } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

function ThemeSelector() {
    const { toast } = useToast();
    const [theme, setThemeState] = useState<string>('system');
    
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || 'system';
        setThemeState(storedTheme);
        applyTheme(storedTheme);
    }, []);

    const applyTheme = (selectedTheme: string) => {
        if (selectedTheme === 'dark' || (selectedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        } else {
        document.documentElement.classList.remove('dark');
        }
    };

    const setTheme = (selectedTheme: string) => {
        localStorage.setItem('theme', selectedTheme);
        setThemeState(selectedTheme);
        applyTheme(selectedTheme);
        toast({
        title: 'Theme Changed',
        description: `Theme set to ${selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}.`,
        });
    }

    return (
         <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                    Customize the look and feel of the app.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-1">
                        <Button variant={theme === 'light' ? 'default' : 'ghost'} size="sm" onClick={() => setTheme('light')}>
                            <Sun className="mr-2 h-4 w-4" /> Light
                        </Button>
                        <Button variant={theme === 'dark' ? 'default' : 'ghost'} size="sm" onClick={() => setTheme('dark')}>
                            <Moon className="mr-2 h-4 w-4" /> Dark
                        </Button>
                        <Button variant={theme === 'system' ? 'default' : 'ghost'} size="sm" onClick={() => setTheme('system')}>
                            <Monitor className="mr-2 h-4 w-4" /> System
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function PwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast({ title: 'Success', description: 'DailyMart has been installed!' });
    } else {
      toast({ title: 'Install Cancelled', description: 'You can install the app later from settings.' });
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) {
    return null; // Don't show anything if it's not installable (e.g., already installed or on desktop)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get the App</CardTitle>
        <CardDescription>Install the DailyMart app on your device for a better experience.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleInstallClick} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Install App
        </Button>
      </CardContent>
    </Card>
  );
}


export default function AccountSettings({ isAdmin }: { isAdmin: boolean }) {
  const { toast } = useToast();
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  });

  async function onPasswordSubmit(data: PasswordFormValues) {
    setIsPasswordLoading(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No user is currently signed in.');
      }

      const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, data.newPassword);

      toast({
        title: 'Success',
        description: 'Your password has been updated.',
      });
      form.reset();
    } catch (error: any) {
      console.error("Password Update Error:", error);
      toast({
        title: 'Update Failed',
        description: error.code === 'auth/wrong-password' ? 'The current password you entered is incorrect.' : (error.message || 'An unexpected error occurred.'),
        variant: 'destructive',
      });
    } finally {
      setIsPasswordLoading(false);
    }
  }

  const handleNotificationsChange = async (checked: boolean) => {
    setIsNotificationsLoading(true);
    // In a real app, you would save this preference to your database
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    setIsNotificationsLoading(false);
    toast({
      title: 'Preferences Saved',
      description: `Email notifications have been turned ${checked ? 'on' : 'off'}.`
    });
  }

  return (
    <div className="space-y-6">
      {!isAdmin && <PwaInstall />}
      <ThemeSelector />
      
       <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            For your security, you must provide your current password to change it.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onPasswordSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPasswordLoading}>
                {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage your email notification preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex items-center space-x-4 rounded-md border p-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Email Notifications
                </p>
                <p className="text-sm text-muted-foreground">
                  Receive emails about your orders and promotions.
                </p>
              </div>
              <Switch 
                disabled={isNotificationsLoading}
                onCheckedChange={handleNotificationsChange} 
              />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
