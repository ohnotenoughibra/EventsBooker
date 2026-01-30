import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BookingForm } from "@/components/bookings/booking-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Clock, Users, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EventPageProps {
  params: { id: string };
}

export default async function EventPage({ params }: EventPageProps) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .eq("status", "published")
    .single();

  if (error || !event) {
    notFound();
  }

  // Get booking count
  const { count: bookingCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("event_id", event.id);

  // Check if user already has a booking
  const { data: existingBooking } = await supabase
    .from("bookings")
    .select("*")
    .eq("event_id", event.id)
    .eq("user_id", user.id)
    .single();

  const spotsLeft = event.max_capacity
    ? event.max_capacity - (bookingCount || 0)
    : null;
  const isSoldOut = spotsLeft !== null && spotsLeft <= 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/dashboard">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div>
              <CardTitle className="text-2xl md:text-3xl">{event.title}</CardTitle>
              {event.instructor && (
                <p className="text-muted-foreground mt-1">
                  with {event.instructor}
                </p>
              )}
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-1">
              {formatCurrency(event.price)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {event.description && (
            <p className="text-muted-foreground">{event.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Date & Time</p>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">
                  {formatDate(event.date)}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Duration</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">{event.duration_minutes} min</span>
              </div>
            </div>
            {event.max_capacity && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Capacity</p>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {bookingCount || 0} / {event.max_capacity}
                  </span>
                </div>
              </div>
            )}
            {spotsLeft !== null && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Availability</p>
                <Badge variant={isSoldOut ? "destructive" : "success"}>
                  {isSoldOut ? "Sold Out" : `${spotsLeft} spots left`}
                </Badge>
              </div>
            )}
          </div>

          <Separator />

          <BookingForm
            event={event}
            existingBooking={existingBooking}
            isSoldOut={isSoldOut}
          />
        </CardContent>
      </Card>
    </div>
  );
}
