"use client";

import Link from "next/link";
import { Event, Booking } from "@/types/database";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, User, CreditCard } from "lucide-react";

interface BookingCardProps {
  booking: Booking;
  event: Event;
  isPast?: boolean;
}

export function BookingCard({ booking, event, isPast = false }: BookingCardProps) {
  const getStatusBadge = () => {
    if (booking.attended) {
      return <Badge variant="success">Attended</Badge>;
    }
    if (booking.paid) {
      return <Badge variant="success">Paid</Badge>;
    }
    return <Badge variant="warning">Pending Payment</Badge>;
  };

  return (
    <Card className={isPast ? "opacity-75" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-1">{event.title}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{event.duration_minutes} minutes</span>
          </div>
          {event.instructor && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{event.instructor}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span>{formatCurrency(event.price)}</span>
          </div>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">Booking Reference</p>
          <p className="font-mono font-medium">{booking.reference}</p>
        </div>

        {!isPast && !booking.paid && (
          <Link href={`/events/${event.id}`}>
            <Button variant="outline" className="w-full">
              View Payment Details
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
