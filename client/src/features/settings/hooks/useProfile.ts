import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/api";

export const useProfile = () => {
  const queryClient = useQueryClient();

  // Fetch Profile
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get("/profile"), 
  });

  // Update Profile
  const updateProfile = useMutation({
    mutationFn: (data: any) => api.patch("/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  // Soft Delete Profile
  const deleteProfile = useMutation({
    mutationFn: () => api.delete("/profile"),
  });

  return {
    profile: profileQuery.data?.data,
    isLoading: profileQuery.isLoading,
    updateProfile,
    deleteProfile
  };
};