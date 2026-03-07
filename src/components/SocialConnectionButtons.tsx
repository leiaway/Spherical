import { Button } from "@/components/ui/button";
import { UserPlus, Clock, UserCheck, Search } from "lucide-react";

export type ConnectionState = "add" | "pending" | "mutual" | "discover";

interface SocialConnectionButtonsProps {
    state: ConnectionState;
    onClick?: () => void;
    className?: string;
    size?: "default" | "sm" | "lg" | "icon";
    fullWidth?: boolean;
}

export const SocialConnectionButtons = ({
    state,
    onClick,
    className = "",
    size = "default",
    fullWidth = false,
}: SocialConnectionButtonsProps) => {
    const baseClasses = `${fullWidth ? "w-full" : ""} transition-all duration-300 ${className}`;

    switch (state) {
        case "add":
            return (
                <Button
                    onClick={onClick}
                    size={size}
                    className={baseClasses}
                    variant="default"
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Friend
                </Button>
            );

        case "pending":
            return (
                <Button
                    onClick={onClick}
                    size={size}
                    variant="secondary"
                    className={baseClasses}
                    disabled
                >
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                    Request Pending
                </Button>
            );

        case "mutual":
            return (
                <Button
                    onClick={onClick}
                    size={size}
                    variant="outline"
                    className={`${baseClasses} border-primary/20 text-primary hover:bg-primary/5`}
                >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Friends
                </Button>
            );

        case "discover":
            return (
                <Button
                    onClick={onClick}
                    size={size}
                    variant="secondary"
                    className={`${baseClasses} bg-accent/10 text-accent hover:bg-accent/20`}
                >
                    <Search className="w-4 h-4 mr-2" />
                    Discover Connections
                </Button>
            );

        default:
            return null;
    }
};
