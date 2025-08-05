"use client";

import { useAtom, useAtomValue } from 'jotai';
import {
    adminNotificationsAtom,
    markNotificationReadAtom,
    clearNotificationsAtom
} from '@/lib/admin-atoms';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    Bell,
    CheckCircle,
    AlertCircle,
    Info,
    XCircle,
    Trash2,
    Check
} from "lucide-react";
import { format } from 'date-fns';

const getNotificationIcon = (type: 'info' | 'warning' | 'error' | 'success') => {
    switch (type) {
        case 'success':
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'warning':
            return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        case 'error':
            return <XCircle className="h-4 w-4 text-red-500" />;
        case 'info':
        default:
            return <Info className="h-4 w-4 text-blue-500" />;
    }
};

const getNotificationColor = (type: 'info' | 'warning' | 'error' | 'success') => {
    switch (type) {
        case 'success':
            return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
        case 'warning':
            return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
        case 'error':
            return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
        case 'info':
        default:
            return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
    }
};

export function AdminNotifications() {
    const notifications = useAtomValue(adminNotificationsAtom);
    const [, markAsRead] = useAtom(markNotificationReadAtom);
    const [, clearAll] = useAtom(clearNotificationsAtom);

    const unreadCount = notifications.filter(n => !n.read).length;

    if (notifications.length === 0) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">
                        No notifications yet.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2">
                            {unreadCount}
                        </Badge>
                    )}
                </CardTitle>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                    className="text-destructive hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-64">
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-3 border rounded-lg transition-colors ${getNotificationColor(notification.type)} ${!notification.read ? 'opacity-100' : 'opacity-60'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {getNotificationIcon(notification.type)}
                                        <span className="text-sm font-medium">
                                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            {format(notification.timestamp, 'MMM dd, HH:mm')}
                                        </span>
                                        {!notification.read && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => markAsRead(notification.id)}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Check className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {notification.message}
                                </p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
} 