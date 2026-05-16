import {
  Save,
  Camera,
  Shield,
  CheckCircle2,
  XCircle,
  User as UserIcon,
  Briefcase,
  Loader2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/auth-api";
import { useToast } from "@/hooks/use-toast";
import { getMediaUrl } from "@/lib/utils";

const Settings = () => {
  const { user, isLoading: isAuthLoading, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    title: "",
    bio: "",
  });

  const [passwords, setPasswords] = useState({
    old: "",
    new: "",
    confirm: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        title: user.title || "",
        bio: user.bio || "",
      });
      if (user.avatar_url) {
        setAvatarPreview(getMediaUrl(user.avatar_url));
      }
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: FormData) => authApi.updateProfile(user?.id, data),
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      toast({
        title: "Profile updated",
        description: "Your profile information has been successfully updated.",
      });
    },
    onError: (error: any) => {
      const message = error.message || "Something went wrong while updating your profile.";
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      setPasswords({ old: "", new: "", confirm: "" });
      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      });
    },
    onError: (error: any) => {
      const message = error.message || "Something went wrong while changing your password.";
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const passwordCriteria = {
    length: passwords.new.length >= 6,
    hasUpper: /[A-Z]/.test(passwords.new),
    hasLower: /[a-z]/.test(passwords.new),
    hasNumber: /[0-9]/.test(passwords.new),
    hasSymbol: /[@%*]/.test(passwords.new),
    match: passwords.new === passwords.confirm && passwords.new !== "",
  };

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
  const canSavePassword = passwords.new === "" ? true : isPasswordValid;

  const handleSave = async () => {
    const profileFormData = new FormData();
    profileFormData.append("first_name", formData.firstName);
    profileFormData.append("last_name", formData.lastName);
    if(formData.bio !== undefined && formData.bio !== "") {
      profileFormData.append("bio", formData.bio);
    }
    if(formData.title !== undefined && formData.title !== "") {
      profileFormData.append("title", formData.title);
    }
    if (avatarFile) {
      profileFormData.append("avatar", avatarFile);
    }

    updateProfileMutation.mutate(profileFormData);

    if (passwords.old && passwords.new) {
      changePasswordMutation.mutate({
        old_password: passwords.old,
        new_password: passwords.new,
        confirm_password: passwords.confirm,
      });
    }
  };

  if (isAuthLoading || !user) {
    const layoutType = user?.role === "user" ? "student" : (user?.role || "student") as "student" | "instructor" | "admin";
    return (
      <DashboardLayout type={layoutType}>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      </DashboardLayout>
    );
  }

  const layoutType = user.role === "user" ? "student" : user.role as "student" | "instructor" | "admin";
  const titleLabel = user.role === "admin" ? "Administrative Title" : user.role === "instructor" ? "Professional Title" : "Professional Title";

  return (
    <DashboardLayout type={layoutType}>
      <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-h1 text-foreground">Settings</h1>
        <p className="text-body text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-card card-shadow p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
            <h2 className="text-h3 text-card-foreground mb-8 flex items-center gap-2">
              Personal Information
              <UserIcon size={20} className="text-muted-foreground" />
            </h2>

            <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-sm flex items-center justify-center bg-gradient-to-br from-[#2D7A85] to-[#5BA4AD] transition-transform duration-500 group-hover:scale-105">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-4xl font-bold tracking-tighter">
                      {formData.firstName?.[0]}
                      {formData.lastName?.[0]}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleImageClick}
                  className="absolute bottom-1 right-1 p-2 bg-white text-slate-500 rounded-full border border-slate-200 hover:bg-slate-50 transition-all shadow-sm hover:scale-110 active:scale-90"
                >
                  <Camera size={18} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="flex-1 w-full space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-small font-medium text-foreground block mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-small border border-border rounded-button outline-none focus:ring-2 focus:ring-primary/20 bg-background transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-small font-medium text-foreground block mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-small border border-border rounded-button outline-none focus:ring-2 focus:ring-primary/20 bg-background transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 w-full">
                  <div className="w-full">
                    <label className="text-small font-medium text-foreground block mb-1.5 flex items-center gap-2">
                      <Briefcase size={14} className="text-primary" />{" "}
                      {titleLabel}
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-small border border-border rounded-button outline-none focus:ring-2 focus:ring-primary/20 bg-background transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-border/50">
              <div>
                <label className="text-small font-medium text-foreground block mb-1.5">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="w-full px-4 py-2.5 text-small border border-border rounded-button outline-none focus:ring-2 focus:ring-primary/20 bg-background h-28 resize-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-card card-shadow p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
            <div className="flex items-center gap-2 mb-6">
              <Shield size={20} className="text-primary" />
              <h2 className="text-h3 text-card-foreground">
                Security & Password
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-small font-medium text-foreground block mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwords.old}
                  onChange={(e) =>
                    setPasswords({ ...passwords, old: e.target.value })
                  }
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 text-small border border-border rounded-button outline-none focus:ring-2 focus:ring-primary/20 bg-background transition-all"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-small font-medium text-foreground block mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.new}
                    onChange={(e) =>
                      setPasswords({ ...passwords, new: e.target.value })
                    }
                    placeholder="Enter new password"
                    className="w-full px-4 py-2.5 text-small border border-border rounded-button outline-none focus:ring-2 focus:ring-primary/20 bg-background transition-all"
                  />
                </div>
                <div>
                  <label className="text-small font-medium text-foreground block mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2.5 text-small border border-border rounded-button outline-none focus:ring-2 focus:ring-primary/20 bg-background transition-all"
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/20 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "6+ Characters", met: passwordCriteria.length },
                  { label: "Capital Letter", met: passwordCriteria.hasUpper },
                  { label: "Small Letter", met: passwordCriteria.hasLower },
                  { label: "Number", met: passwordCriteria.hasNumber },
                  {
                    label: "Symbol (@, %, *)",
                    met: passwordCriteria.hasSymbol,
                  },
                  { label: "Match Passwords", met: passwordCriteria.match },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-[11px] transition-all duration-300"
                  >
                    {item.met ? (
                      <CheckCircle2 size={14} className="text-emerald-500 animate-in zoom-in duration-300" />
                    ) : (
                      <XCircle size={14} className="text-muted-foreground/30" />
                    )}
                    <span
                      className={
                        item.met
                          ? "text-emerald-600 font-bold"
                          : "text-muted-foreground"
                      }
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 sticky top-6 self-start animate-in fade-in slide-in-from-right-4 duration-500 delay-300 fill-mode-both">
          <div className="bg-card rounded-card card-shadow p-6 text-center border-b-4 border-primary overflow-hidden relative group hover:shadow-lg transition-all duration-300">
            <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-md flex items-center justify-center bg-gradient-to-br from-[#2D7A85] to-[#5BA4AD] transition-transform duration-500 group-hover:scale-110">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-3xl font-bold tracking-tighter">
                  {formData.firstName?.[0]}
                  {formData.lastName?.[0]}
                </span>
              )}
            </div>

            <h3 className="text-h3 font-black text-foreground truncate group-hover:text-primary transition-colors">
              {formData.firstName} {formData.lastName}
            </h3>
            <p className="text-xs font-medium text-muted-foreground mb-4 px-2 line-clamp-1">
              {formData.title}
            </p>

            <div className="py-2.5 px-4 bg-muted/40 rounded-xl flex items-center justify-center gap-2 text-[11px] text-muted-foreground border border-border shadow-sm transition-all group-hover:bg-muted/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span className="font-medium truncate">
                {formData.email}
              </span>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={
              updateProfileMutation.isPending || 
              changePasswordMutation.isPending ||
              (passwords.new !== "" && !canSavePassword)
            }
            className="w-full gradient-primary border-0 text-primary-foreground font-black rounded-button shadow-xl py-6 hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(updateProfileMutation.isPending || changePasswordMutation.isPending) ? (
              <Loader2 className="animate-spin mr-2" size={20} />
            ) : (
              <Save size={20} className="mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
