import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/auth-api";
import { User } from "@/types";
import { useNavigate } from "react-router-dom";
import { useToast } from "./use-toast";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: user, isLoading, isError, error, refetch: refreshUser } = useQuery<User | null>({
    queryKey: ["auth-user"],
    queryFn: async () => {
      try {
        return await authApi.me();
      } catch (error) {
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, 
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(["auth-user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/login");
    },
    onError: (err: any) => {
      toast({
        title: "Logout failed",
        description: err.message || "Something went wrong while logging out.",
        variant: "destructive",
      });
    },
  });

  return {
    user,
    isLoading,
    isError,
    error,
    refreshUser,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
};
