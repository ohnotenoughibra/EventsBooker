import Link from "next/link";
import { EventWithBookingCount } from "@/types/database";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Users, User } from "lucide-react";

interface EventCardProps {
  event: EventWithBookingCount;
}

export function EventCard({ event }: EventCardProps) {
  const spotsLeft = event.max_capacity
    ? event.max_capacity - event.booking_count
    : null;
  const isSoldOut = spotsLeft !== null && spotsLeft <= 0;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="line-clamp-2">{event.title}</CardTitle>
          <Badge variant={isSoldOut ? "destructive" : "default"}>
            {formatCurrency(event.price)}
          </Badge>
        </div>
        {event.description && (
          <CardDescription className="line-clamp-2">
            {event.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1">
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
          {event.max_capacity && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {isSoldOut ? (
                  <span className="text-destructive font-medium">Sold out</span>
                ) : (
                  `${spotsLeft} spots left`
                )}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/events/${event.id}`} className="w-full">
          <Button className="w-full" disabled={isSoldOut}>
            {isSoldOut ? "Sold Out" : "Book Now"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
