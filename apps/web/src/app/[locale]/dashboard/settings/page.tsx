'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  User,
  Building2,
  Bell,
  Shield,
  Globe,
  CreditCard,
  Key,
  Mail,
  Phone,
  Save,
  Camera,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertWithIcon } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth-context';
import { useUserMutations } from '@/hooks/useUser';
import { captureError } from '@/lib/error-tracking';

export default function SettingsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { updateProfile, changePassword, uploadAvatar } = useUserMutations();

  const [activeTab, setActiveTab] = React.useState('profile');

  // Profile form state
  const [profileForm, setProfileForm] = React.useState({
    fullName: '',
    fullNameAr: '',
    phone: '',
    uiLanguage: locale,
  });

  // Company form state
  const [companyForm, setCompanyForm] = React.useState({
    companyName: '',
    tradeLicense: '',
    taxNumber: '',
    companyAddress: '',
    companyEmail: '',
    companyPhone: '',
  });

  // Notification preferences
  const [notifications, setNotifications] = React.useState({
    email: true,
    sms: false,
    whatsapp: false,
  });

  // Password form state
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // UI state
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Initialize form from user data
  React.useEffect(() => {
    if (user) {
      const nameParts = user.fullName?.split(' ') || ['', ''];
      setProfileForm({
        fullName: user.fullName || '',
        fullNameAr: user.fullNameAr || '',
        phone: user.phone || '',
        uiLanguage: user.uiLanguage || locale,
      });
    }
  }, [user, locale]);

  // Clear messages after 5 seconds
  React.useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  // Handle profile save
  const handleSaveProfile = async () => {
    try {
      const updatedUser = await updateProfile.mutateAsync({
        fullName: profileForm.fullName,
        fullNameAr: profileForm.fullNameAr,
        phone: profileForm.phone,
        uiLanguage: profileForm.uiLanguage,
      });

      // Update local auth context
      updateUser(updatedUser);

      setSuccessMessage('Profile updated successfully');

      // If language changed, redirect to new locale
      if (profileForm.uiLanguage !== locale) {
        router.push(`/${profileForm.uiLanguage}/dashboard/settings`);
      }
    } catch (error) {
      captureError(error, { component: 'SettingsPage', action: 'saveProfile' });
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  // Handle avatar upload
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 2MB');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setErrorMessage('Only JPG, PNG, and GIF images are allowed');
      return;
    }

    try {
      const updatedUser = await uploadAvatar.mutateAsync(file);
      updateUser(updatedUser);
      setSuccessMessage('Avatar updated successfully');
    } catch (error) {
      captureError(error, { component: 'SettingsPage', action: 'uploadAvatar' });
      setErrorMessage('Failed to upload avatar');
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setSuccessMessage('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      captureError(error, { component: 'SettingsPage', action: 'changePassword' });
      setErrorMessage(error instanceof Error ? error.message : 'Failed to change password');
    }
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.fullName) return '??';
    return user.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t('nav.settings')}</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <AlertWithIcon
          variant="success"
          title="Success"
          description={successMessage}
        />
      )}
      {errorMessage && (
        <AlertWithIcon
          variant="destructive"
          title="Error"
          description={errorMessage}
        />
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Company</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.avatarUrl || ''} />
                  <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={uploadAvatar.isPending}
                  >
                    {uploadAvatar.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fullName">Full Name (English)</Label>
                  <Input
                    id="fullName"
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="fullNameAr">Full Name (Arabic)</Label>
                  <Input
                    id="fullNameAr"
                    dir="rtl"
                    value={profileForm.fullNameAr}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, fullNameAr: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user?.email || ''} disabled />
                  <p className="text-xs text-muted-foreground mt-1">
                    Contact support to change your email
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="+971 50 123 4567"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select
                    value={profileForm.uiLanguage}
                    onValueChange={(value) =>
                      setProfileForm((prev) => ({ ...prev, uiLanguage: value }))
                    }
                  >
                    <SelectTrigger>
                      <Globe className="h-4 w-4 me-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="ur">اردو</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending}
                  className="gap-2"
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Your company details will appear on generated documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyForm.companyName}
                    onChange={(e) =>
                      setCompanyForm((prev) => ({ ...prev, companyName: e.target.value }))
                    }
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="tradeLicense">Trade License Number</Label>
                  <Input
                    id="tradeLicense"
                    value={companyForm.tradeLicense}
                    onChange={(e) =>
                      setCompanyForm((prev) => ({ ...prev, tradeLicense: e.target.value }))
                    }
                    placeholder="Enter license number"
                  />
                </div>
                <div>
                  <Label htmlFor="taxNumber">Tax Registration Number</Label>
                  <Input
                    id="taxNumber"
                    value={companyForm.taxNumber}
                    onChange={(e) =>
                      setCompanyForm((prev) => ({ ...prev, taxNumber: e.target.value }))
                    }
                    placeholder="Enter TRN"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="companyAddress">Address</Label>
                  <Textarea
                    id="companyAddress"
                    value={companyForm.companyAddress}
                    onChange={(e) =>
                      setCompanyForm((prev) => ({ ...prev, companyAddress: e.target.value }))
                    }
                    placeholder="Enter company address"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companyForm.companyEmail}
                    onChange={(e) =>
                      setCompanyForm((prev) => ({ ...prev, companyEmail: e.target.value }))
                    }
                    placeholder="company@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    type="tel"
                    value={companyForm.companyPhone}
                    onChange={(e) =>
                      setCompanyForm((prev) => ({ ...prev, companyPhone: e.target.value }))
                    }
                    placeholder="+971 4 XXX XXXX"
                  />
                </div>
              </div>

              <AlertWithIcon
                variant="info"
                title="Coming Soon"
                description="Company profile management will be available in a future update."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about document activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  {
                    id: 'email',
                    icon: Mail,
                    title: 'Email Notifications',
                    description: 'Receive updates via email',
                    key: 'email' as const,
                  },
                  {
                    id: 'sms',
                    icon: Phone,
                    title: 'SMS Notifications',
                    description: 'Receive updates via SMS',
                    key: 'sms' as const,
                  },
                  {
                    id: 'whatsapp',
                    icon: Phone,
                    title: 'WhatsApp Notifications',
                    description: 'Receive updates via WhatsApp',
                    key: 'whatsapp' as const,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications[item.key]}
                        onChange={(e) =>
                          setNotifications((prev) => ({
                            ...prev,
                            [item.key]: e.target.checked,
                          }))
                        }
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>

              <AlertWithIcon
                variant="info"
                title="Coming Soon"
                description="Notification preferences will be available in a future update."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must be at least 8 characters
                </p>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleChangePassword}
                  disabled={
                    changePassword.isPending ||
                    !passwordForm.currentPassword ||
                    !passwordForm.newPassword ||
                    !passwordForm.confirmPassword
                  }
                  className="gap-2"
                >
                  {changePassword.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4" />
                  )}
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertWithIcon
                variant="info"
                title="2FA Not Enabled"
                description="Enable two-factor authentication for enhanced account security."
              />
              <Button variant="outline" className="mt-4" disabled>
                Enable 2FA (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Manage your subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
                <div>
                  <p className="font-semibold text-lg">Free Plan</p>
                  <p className="text-sm text-muted-foreground">
                    Limited documents, basic features
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-2xl font-bold">AED 0</p>
                  <p className="text-sm text-muted-foreground">/month</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="default">Upgrade to Pro</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage your payment information</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertWithIcon
                variant="info"
                title="No Payment Method"
                description="Add a payment method to upgrade your plan."
              />
              <Button variant="outline" className="mt-4 gap-2" disabled>
                <CreditCard className="h-4 w-4" />
                Add Payment Method (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
