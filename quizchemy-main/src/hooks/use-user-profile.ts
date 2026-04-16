import { useAuth } from '@/contexts/AuthContext';

export const useUserProfile = () => {
  const { profile, profileLoading, refreshProfile, setProfile } = useAuth();

  return {
    profile,
    loading: profileLoading,
    refreshProfile,
    setProfile,
  };
};