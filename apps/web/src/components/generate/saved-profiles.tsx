'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  User,
  Building2,
  Plus,
  Star,
  StarOff,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  UserPlus,
  Users,
  Crown,
  Briefcase,
} from 'lucide-react';

export interface SavedProfile {
  id: string;
  type: 'individual' | 'company';
  label: string;
  isDefault: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  data: {
    name: string;
    idNumber: string;
    nationality: string;
    address: string;
    phone: string;
    email: string;
    whatsapp: string;
  };
}

interface SavedProfilesProps {
  onSelect: (profile: SavedProfile) => void;
  locale?: string;
  className?: string;
}

const STORAGE_KEY = 'legaldocs-saved-profiles';

export function SavedProfiles({ onSelect, locale = 'en', className }: SavedProfilesProps) {
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<SavedProfile | null>(null);
  const [formData, setFormData] = useState<Partial<SavedProfile>>({
    type: 'individual',
    label: '',
    data: {
      name: '',
      idNumber: '',
      nationality: '',
      address: '',
      phone: '',
      email: '',
      whatsapp: '',
    },
  });

  const isArabic = locale === 'ar';

  const translations = {
    savedProfiles: isArabic ? 'الملفات المحفوظة' : 'Saved Profiles',
    quickFill: isArabic ? 'تعبئة سريعة' : 'Quick Fill',
    addProfile: isArabic ? 'إضافة ملف جديد' : 'Add New Profile',
    editProfile: isArabic ? 'تعديل الملف' : 'Edit Profile',
    individual: isArabic ? 'فرد' : 'Individual',
    company: isArabic ? 'شركة' : 'Company',
    profileLabel: isArabic ? 'اسم الملف' : 'Profile Label',
    profileLabelPlaceholder: isArabic ? 'مثال: معلوماتي الشخصية' : 'e.g., My Personal Info',
    name: isArabic ? 'الاسم' : 'Name',
    idNumber: isArabic ? 'رقم الهوية' : 'ID Number',
    nationality: isArabic ? 'الجنسية' : 'Nationality',
    address: isArabic ? 'العنوان' : 'Address',
    phone: isArabic ? 'الهاتف' : 'Phone',
    email: isArabic ? 'البريد الإلكتروني' : 'Email',
    whatsapp: isArabic ? 'واتساب' : 'WhatsApp',
    save: isArabic ? 'حفظ' : 'Save',
    cancel: isArabic ? 'إلغاء' : 'Cancel',
    delete: isArabic ? 'حذف' : 'Delete',
    setAsDefault: isArabic ? 'تعيين كافتراضي' : 'Set as Default',
    default: isArabic ? 'افتراضي' : 'Default',
    favorite: isArabic ? 'مفضل' : 'Favorite',
    noProfiles: isArabic ? 'لا توجد ملفات محفوظة' : 'No saved profiles yet',
    createFirst: isArabic ? 'أنشئ ملفك الأول لتسريع إنشاء المستندات' : 'Create your first profile to speed up document creation',
    myInfo: isArabic ? 'معلوماتي' : 'My Info',
    clients: isArabic ? 'العملاء' : 'Clients',
    partners: isArabic ? 'الشركاء' : 'Partners',
  };

  // Load profiles from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProfiles(JSON.parse(saved));
      } catch {
        console.error('Failed to parse saved profiles');
      }
    }
  }, []);

  // Save profiles to localStorage
  const saveProfiles = (newProfiles: SavedProfile[]) => {
    setProfiles(newProfiles);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfiles));
  };

  const handleSave = () => {
    if (!formData.label || !formData.data?.name) return;

    const now = new Date().toISOString();

    if (editingProfile) {
      // Update existing profile
      const updated = profiles.map((p) =>
        p.id === editingProfile.id
          ? {
              ...p,
              ...formData,
              updatedAt: now,
            } as SavedProfile
          : p
      );
      saveProfiles(updated);
    } else {
      // Create new profile
      const newProfile: SavedProfile = {
        id: `profile-${Date.now()}`,
        type: formData.type || 'individual',
        label: formData.label,
        isDefault: profiles.length === 0,
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
        data: formData.data as SavedProfile['data'],
      };
      saveProfiles([...profiles, newProfile]);
    }

    setIsDialogOpen(false);
    setEditingProfile(null);
    resetForm();
  };

  const handleEdit = (profile: SavedProfile) => {
    setEditingProfile(profile);
    setFormData({
      type: profile.type,
      label: profile.label,
      data: { ...profile.data },
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (profileId: string) => {
    const updated = profiles.filter((p) => p.id !== profileId);
    // If we deleted the default, make the first one default
    if (updated.length > 0 && !updated.some((p) => p.isDefault)) {
      updated[0].isDefault = true;
    }
    saveProfiles(updated);
  };

  const toggleDefault = (profileId: string) => {
    const updated = profiles.map((p) => ({
      ...p,
      isDefault: p.id === profileId,
    }));
    saveProfiles(updated);
  };

  const toggleFavorite = (profileId: string) => {
    const updated = profiles.map((p) =>
      p.id === profileId ? { ...p, isFavorite: !p.isFavorite } : p
    );
    saveProfiles(updated);
  };

  const resetForm = () => {
    setFormData({
      type: 'individual',
      label: '',
      data: {
        name: '',
        idNumber: '',
        nationality: '',
        address: '',
        phone: '',
        email: '',
        whatsapp: '',
      },
    });
  };

  const openNewDialog = () => {
    setEditingProfile(null);
    resetForm();
    setIsDialogOpen(true);
  };

  // Sort profiles: favorites first, then default, then by name
  const sortedProfiles = [...profiles].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
    return a.label.localeCompare(b.label);
  });

  const defaultProfile = profiles.find((p) => p.isDefault);
  const favoriteProfiles = profiles.filter((p) => p.isFavorite && !p.isDefault);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Users className="h-4 w-4" />
          {translations.quickFill}
        </h4>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8"
              onClick={openNewDialog}
            >
              <UserPlus className="h-3.5 w-3.5" />
              {translations.addProfile}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingProfile ? translations.editProfile : translations.addProfile}
              </DialogTitle>
              <DialogDescription>
                {isArabic
                  ? 'احفظ معلومات الطرف لاستخدامها لاحقاً'
                  : 'Save party information for quick access later'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Profile Type */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.type === 'individual' ? 'default' : 'outline'}
                  className="flex-1 gap-2"
                  onClick={() => setFormData({ ...formData, type: 'individual' })}
                >
                  <User className="h-4 w-4" />
                  {translations.individual}
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'company' ? 'default' : 'outline'}
                  className="flex-1 gap-2"
                  onClick={() => setFormData({ ...formData, type: 'company' })}
                >
                  <Building2 className="h-4 w-4" />
                  {translations.company}
                </Button>
              </div>

              {/* Profile Label */}
              <div className="space-y-2">
                <Label>{translations.profileLabel}</Label>
                <Input
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder={translations.profileLabelPlaceholder}
                />
              </div>

              {/* Party Details */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{translations.name} *</Label>
                  <Input
                    value={formData.data?.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        data: { ...formData.data!, name: e.target.value },
                      })
                    }
                    placeholder={formData.type === 'company' ? 'ABC LLC' : 'Ahmed Mohammed'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{translations.idNumber}</Label>
                  <Input
                    value={formData.data?.idNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        data: { ...formData.data!, idNumber: e.target.value },
                      })
                    }
                    placeholder="784-1234-1234567-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{translations.nationality}</Label>
                  <Input
                    value={formData.data?.nationality}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        data: { ...formData.data!, nationality: e.target.value },
                      })
                    }
                    placeholder={isArabic ? 'الإمارات' : 'UAE'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{translations.phone}</Label>
                  <Input
                    value={formData.data?.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        data: { ...formData.data!, phone: e.target.value },
                      })
                    }
                    placeholder="+971 50 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{translations.email}</Label>
                  <Input
                    type="email"
                    value={formData.data?.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        data: { ...formData.data!, email: e.target.value },
                      })
                    }
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{translations.whatsapp}</Label>
                  <Input
                    value={formData.data?.whatsapp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        data: { ...formData.data!, whatsapp: e.target.value },
                      })
                    }
                    placeholder="+971 50 123 4567"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>{translations.address}</Label>
                  <Input
                    value={formData.data?.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        data: { ...formData.data!, address: e.target.value },
                      })
                    }
                    placeholder={isArabic ? 'دبي، الإمارات' : 'Dubai, UAE'}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {translations.cancel}
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.label || !formData.data?.name}
              >
                {translations.save}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Profiles Grid */}
      {profiles.length === 0 ? (
        <div className="text-center py-6 px-4 border-2 border-dashed rounded-xl">
          <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-muted-foreground">
            {translations.noProfiles}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {translations.createFirst}
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {/* Default Profile (highlighted) */}
          {defaultProfile && (
            <button
              onClick={() => onSelect(defaultProfile)}
              className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border-2 border-primary/30 hover:bg-primary/20 transition-all"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                {defaultProfile.type === 'company' ? (
                  <Building2 className="h-4 w-4 text-primary" />
                ) : (
                  <User className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="text-start">
                <p className="text-sm font-medium text-primary">{defaultProfile.label}</p>
                <p className="text-[10px] text-primary/70">{defaultProfile.data.name}</p>
              </div>
              <Badge variant="secondary" className="text-[9px] bg-primary/20 text-primary">
                <Crown className="h-2.5 w-2.5 me-0.5" />
                {translations.default}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(defaultProfile)}>
                    <Edit className="h-4 w-4 me-2" />
                    {translations.editProfile}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleFavorite(defaultProfile.id)}>
                    {defaultProfile.isFavorite ? (
                      <>
                        <StarOff className="h-4 w-4 me-2" />
                        Remove Favorite
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4 me-2" />
                        Add to Favorites
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(defaultProfile.id)}
                  >
                    <Trash2 className="h-4 w-4 me-2" />
                    {translations.delete}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </button>
          )}

          {/* Other Profiles */}
          {sortedProfiles
            .filter((p) => !p.isDefault)
            .map((profile) => (
              <button
                key={profile.id}
                onClick={() => onSelect(profile)}
                className="group flex items-center gap-2 px-3 py-2 rounded-xl border hover:border-primary/50 hover:bg-muted/50 transition-all"
              >
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  {profile.type === 'company' ? (
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="text-start">
                  <p className="text-sm font-medium">{profile.label}</p>
                  <p className="text-[10px] text-muted-foreground">{profile.data.name}</p>
                </div>
                {profile.isFavorite && (
                  <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(profile)}>
                      <Edit className="h-4 w-4 me-2" />
                      {translations.editProfile}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleDefault(profile.id)}>
                      <Crown className="h-4 w-4 me-2" />
                      {translations.setAsDefault}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleFavorite(profile.id)}>
                      {profile.isFavorite ? (
                        <>
                          <StarOff className="h-4 w-4 me-2" />
                          Remove Favorite
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4 me-2" />
                          Add to Favorites
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(profile.id)}
                    >
                      <Trash2 className="h-4 w-4 me-2" />
                      {translations.delete}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </button>
            ))}

          {/* Add New Button */}
          <button
            onClick={openNewDialog}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed hover:border-primary/50 hover:bg-muted/30 transition-all"
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{translations.addProfile}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Export a hook for managing profiles
export function useSavedProfiles() {
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProfiles(JSON.parse(saved));
      } catch {
        console.error('Failed to parse saved profiles');
      }
    }
  }, []);

  const getDefaultProfile = () => profiles.find((p) => p.isDefault);
  const getFavorites = () => profiles.filter((p) => p.isFavorite);

  return { profiles, getDefaultProfile, getFavorites };
}
