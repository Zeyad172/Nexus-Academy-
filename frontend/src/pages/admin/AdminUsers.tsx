import {
    Search,
    MoreVertical,
    Shield,
    Trash2,
    UserCheck,
    Activity,
    Mail,
    Loader2,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { usersApi } from "@/lib/users-api";
import { getMediaUrl } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { AppPagination } from "@/components/ui/app-pagination";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppSelect } from "@/components/ui/app-select";

const AdminUsers = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [page, setPage] = useState(1);
    const limit = 10;
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isRoleOpen, setIsRoleOpen] = useState(false);
    const [pendingRole, setPendingRole] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data: usersData, isLoading } = useQuery({
        queryKey: ["admin-users", debouncedSearch, roleFilter, page],
        queryFn: () =>
            usersApi.getUsers({
                page,
                limit,
                search: debouncedSearch || undefined,
                role: roleFilter === "all" ? undefined : roleFilter,
                filter: "Time",
                order: "DESC",
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (userId: number) => usersApi.deleteUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            toast({
                title: "Success",
                description: "User deleted successfully",
            });
            setIsDeleteOpen(false);
            setSelectedUser(null);
        },
        onError: (error: any) => {
            toast({
                title: "Error deleting user",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const roleMutation = useMutation({
        mutationFn: ({
            userId,
            newRole,
        }: {
            userId: number;
            newRole: string;
        }) => usersApi.updateUser(userId, { role: newRole as any }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            toast({
                title: "Success",
                description: "User role updated successfully",
            });
            setIsRoleOpen(false);
            setSelectedUser(null);
            setPendingRole(null);
        },
        onError: (error: any) => {
            toast({
                title: "Error updating role",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const users = usersData?.users || [];
    const total = usersData?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const roleOptions = [
        { label: "All Roles", value: "all" },
        { label: "Admin", value: "admin" },
        { label: "Instructor", value: "instructor" },
        { label: "User", value: "user" },
    ];

    const handleDeleteUser = (user: any) => {
        setSelectedUser(user);
        setIsDeleteOpen(true);
    };

    const handleRoleChange = (
        user: any,
        newRole: "admin" | "instructor" | "user",
    ) => {
        setSelectedUser(user);
        setPendingRole(newRole);
        setIsRoleOpen(true);
    };

    return (
        <DashboardLayout type="admin">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-h1 text-foreground font-black tracking-tight">
                        User Management
                    </h1>
                    <p className="text-body text-muted-foreground mt-1">
                        Manage platform users, roles, and access levels
                    </p>
                </div>
            </div>

            <div className="bg-card rounded-card card-shadow p-5 mb-6 border border-border/50">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative max-w-md w-full">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-small bg-muted/30 rounded-xl border border-border outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <AppSelect
                            options={roleOptions.map((o) => o.label)}
                            value={
                                roleOptions.find((o) => o.value === roleFilter)
                                    ?.label || "All Roles"
                            }
                            onValueChange={(val) => {
                                const option = roleOptions.find(
                                    (o) => o.label === val,
                                );
                                if (option) {
                                    setRoleFilter(option.value);
                                    setPage(1);
                                }
                            }}
                            className="flex-1 md:w-[200px]"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-card card-shadow overflow-hidden border border-border/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/20">
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                                    User Details
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                                    Role
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                                    Joined Date
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center"
                                    >
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center text-muted-foreground text-sm"
                                    >
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user.user_id}
                                        className="hover:bg-muted/10 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.avatar_url ? (
                                                    <img
                                                        src={getMediaUrl(
                                                            user.avatar_url,
                                                        )}
                                                        alt={user.first_name}
                                                        className="w-10 h-10 rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-black shadow-sm">
                                                        {user.first_name?.[0] ||
                                                            user.email?.[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-small font-bold text-foreground group-hover:text-primary transition-colors">
                                                        {user.first_name}{" "}
                                                        {user.last_name}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                        <Mail size={10} />{" "}
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 text-[10px] font-black rounded-full tracking-tighter shadow-sm capitalize ${
                                                    user.role === "admin"
                                                        ? "bg-indigo-500 text-white"
                                                        : user.role ===
                                                            "instructor"
                                                          ? "bg-primary text-white"
                                                          : "bg-slate-500 text-white"
                                                }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-500">
                                            {format(
                                                new Date(user.created_at),
                                                "MMM dd, yyyy",
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-xl hover:bg-muted group-hover:text-primary transition-colors"
                                                    >
                                                        <MoreVertical
                                                            size={18}
                                                        />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-52 rounded-xl p-2 shadow-2xl"
                                                >
                                                    {user.role !== "admin" && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleRoleChange(
                                                                    user,
                                                                    "admin",
                                                                )
                                                            }
                                                            className="gap-3 group cursor-pointer rounded-lg py-2.5 font-medium"
                                                        >
                                                            <Shield
                                                                size={16}
                                                                className="text-indigo-500 group-hover:text-white"
                                                            />{" "}
                                                            Make Admin
                                                        </DropdownMenuItem>
                                                    )}
                                                    {user.role !==
                                                        "instructor" && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleRoleChange(
                                                                    user,
                                                                    "instructor",
                                                                )
                                                            }
                                                            className="gap-3 group cursor-pointer rounded-lg py-2.5 font-medium"
                                                        >
                                                            <UserCheck
                                                                size={16}
                                                                className="text-emerald-500 group-hover:text-white"
                                                            />{" "}
                                                            Make Instructor
                                                        </DropdownMenuItem>
                                                    )}
                                                    {user.role !== "user" && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleRoleChange(
                                                                    user,
                                                                    "user",
                                                                )
                                                            }
                                                            className="gap-3 group cursor-pointer rounded-lg py-2.5 font-medium"
                                                        >
                                                            <Activity
                                                                size={16}
                                                                className="text-blue-500 group-hover:text-white"
                                                            />{" "}
                                                            Make User
                                                        </DropdownMenuItem>
                                                    )}
                                                    <div className="h-px bg-border my-1" />
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleDeleteUser(
                                                                user,
                                                            )
                                                        }
                                                        className="gap-3 cursor-pointer rounded-lg py-2.5 font-medium text-destructive focus:text-white focus:bg-destructive"
                                                    >
                                                        <Trash2 size={16} />{" "}
                                                        Delete User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                    <AppPagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </div>
            )}

            {/* Delete User Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="font-bold text-foreground">
                                {selectedUser?.first_name}{" "}
                                {selectedUser?.last_name}
                            </span>
                            ? This action cannot be undone and will remove all
                            associated data.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                deleteMutation.mutate(selectedUser?.user_id)
                            }
                            disabled={deleteMutation.isPending}
                            className="rounded-xl"
                        >
                            {deleteMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Delete User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Role Change Dialog */}
            <Dialog open={isRoleOpen} onOpenChange={setIsRoleOpen}>
                <DialogContent className="rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to change the role of{" "}
                            <span className="font-bold text-foreground">
                                {selectedUser?.first_name}{" "}
                                {selectedUser?.last_name}
                            </span>{" "}
                            to{" "}
                            <span className="font-bold text-primary capitalize">
                                {pendingRole}
                            </span>
                            ?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsRoleOpen(false)}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() =>
                                roleMutation.mutate({
                                    userId: selectedUser?.user_id,
                                    newRole: pendingRole!,
                                })
                            }
                            disabled={roleMutation.isPending}
                            className="rounded-xl"
                        >
                            {roleMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Confirm Change
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default AdminUsers;
