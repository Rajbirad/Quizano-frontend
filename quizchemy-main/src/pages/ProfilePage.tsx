import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarSelector } from '@/components/profile/AvatarSelector';
import { useUserProfile } from '@/hooks/use-user-profile';
import { toast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Loader2,
  Save,
  Upload,
  Check
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  auth_provider: string | null;
  subscription_tier: string | null;
  flashcard_count: number | null;
  quiz_count: number | null;
  google_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { profile: globalProfile, refreshProfile, setProfile: updateGlobalProfile } = useUserProfile();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // First, try to fetch existing profile
      let { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // If no profile exists or there's an error
      if (!data || error) {
        console.log('No profile found, creating new one...');
        
        // Create new profile
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([{
            id: user.id,
            email: user.email || '',
            full_name: null,
            username: null,
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          toast.error('Failed to create profile');
          return;
        }

        data = newProfile;
      }

      // Set profile data
      setProfile(data);
      setFullName(data.full_name || '');
      setUsername(data.username || '');
    } catch (error) {
      console.error('Profile error:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Profile creation is now handled in fetchProfile

  const updateProfile = async () => {
    if (!user || !profile) return;

    setProfileSaveSuccess(false);
    setSavingProfile(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          full_name: fullName.trim() || null,
          username: username.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
        return;
      }

      setProfile(data);
      updateGlobalProfile(data);
      refreshProfile(); // Ensure all components get the latest profile data
      setProfileSaveSuccess(true);
      window.setTimeout(() => setProfileSaveSuccess(false), 1800);
      
      toast({
        title: "Profile Updated",
        description: "Your account details have been updated successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) {
      console.log('No file selected or user not authenticated');
      return;
    }

    console.log('File selected:', file.name, file.type, file.size);

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('Generated avatar URL:', urlData.publicUrl);

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          avatar_url: urlData.publicUrl + '?t=' + Date.now(), // Cache busting
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      await refreshProfile(); // Refresh global profile state
       toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      console.log('Avatar updated successfully:', data.avatar_url);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
  };

  const saveSelectedAvatar = async () => {
    if (!selectedAvatar || !user) return;

    setSavingAvatar(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          avatar_url: selectedAvatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      updateGlobalProfile(data);  // Update global profile state
      await refreshProfile();     // Force refresh to update all components
      setSelectedAvatar(null);
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar');
    } finally {
      setSavingAvatar(false);
    }
  };

  const updatePassword = async () => {
    if (!newPassword || !currentPassword) {
      toast.error('Please fill in both password fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      setCurrentPassword('');
      setNewPassword('');
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Failed to load profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <Card>
        <CardContent className="pt-6 space-y-8">
          {/* Profile Picture Section */}
          <div className="space-y-4">
            <div className="flex items-start gap-6">
              <Avatar className="h-32 w-32 rounded-full">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile.full_name || profile.email)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="text-base font-semibold mb-1">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="bg-primary hover:bg-primary/90 rounded-md px-4 py-2 font-medium"
                  >
                    {uploadingAvatar && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    Upload New Picture
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={async () => {
                      if (!user) return;
                      try {
                        const { error } = await supabase
                          .from('user_profiles')
                          .update({ avatar_url: null, updated_at: new Date().toISOString() })
                          .eq('id', user.id);
                        
                        if (!error) {
                          setProfile({ ...profile, avatar_url: null });
                          await refreshProfile();
                          toast({ title: "Avatar deleted successfully" });
                        }
                      } catch (err) {
                        toast({ title: "Failed to delete avatar", variant: "destructive" });
                      }
                    }}
                    className="rounded-md px-4 py-2"
                  >
                    Delete
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
            
            <AvatarSelector
              selectedAvatar={selectedAvatar}
              onAvatarSelect={handleAvatarSelect}
              onSave={saveSelectedAvatar}
              saving={savingAvatar}
            />
          </div>

          {/* Account Details Section */}
          <div className="space-y-4 border-t pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={fullName.split(' ')[0] || ''}
                  onChange={(e) => {
                    const lastName = fullName.split(' ').slice(1).join(' ');
                    setFullName(e.target.value + (lastName ? ' ' + lastName : ''));
                  }}
                  placeholder="First Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={fullName.split(' ').slice(1).join(' ') || ''}
                  onChange={(e) => {
                    const firstName = fullName.split(' ')[0] || '';
                    setFullName(firstName + (e.target.value ? ' ' + e.target.value : ''));
                  }}
                  placeholder="Last Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">UserName</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
            </div>

            <Button 
              onClick={updateProfile} 
              disabled={savingProfile} 
              className="bg-primary hover:bg-primary/90 rounded-md px-6 py-2 font-medium text-white min-w-[140px]"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : profileSaveSuccess ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>

          {/* Password Section */}
          <div className="space-y-4 border-t pt-6">
            <div>
              <h3 className="text-base font-semibold mb-1">Password</h3>
              <p className="text-sm text-muted-foreground">Modify your current password</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                />
              </div>
            </div>

            <Button 
              onClick={updatePassword} 
              disabled={savingPassword || !currentPassword || !newPassword} 
              className="bg-primary hover:bg-primary/90 rounded-md px-6 py-2 font-medium text-white"
            >
              {savingPassword && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;