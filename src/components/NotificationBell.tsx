import { Bell, BellDot, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

/** Requirement: F1.10 (talent scout notifications). */

export const NotificationBell = () => {
    const { user } = useAuth();
    const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    if (!user) return null;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    {unreadCount > 0 ? (
                        <>
                            <BellDot className="w-5 h-5" />
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        </>
                    ) : (
                        <Bell className="w-5 h-5" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto py-1 gap-1"
                            onClick={() => void markAllAsRead()}
                        >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all read
                        </Button>
                    )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No notifications yet
                        </p>
                    ) : (
                        notifications.map((n) => (
                            <button
                                key={n.id}
                                className={`w-full text-left px-4 py-3 border-b border-border/30 hover:bg-accent/10 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                                onClick={() => { if (!n.read) void markAsRead(n.id); }}
                            >
                                <div className="flex items-start gap-2">
                                    {!n.read && (
                                        <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium leading-tight">{n.title}</p>
                                        {n.body && (
                                            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{n.body}</p>
                                        )}
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};
