import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, CalendarDays, Clock, Users, User } from "lucide-react";
import { AttendeeTable } from "@/components/admin/attendee-table";

interface EventDetailPageProps {
  params: { id: string };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const supabase = createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !event) {
    notFound();
  }

  // Get bookings with user profiles
  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      `
      *,
      profiles (*)
    `
    )
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });

  const paidCount = bookings?.filter((b) => b.paid).length || 0;
  const attendedCount = bookings?.filter((b) => b.attended).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/events">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
        </Link>
        <Link href={`/admin/events/${event.id}/edit`}>
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Event
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              {event.instructor && (
                <p className="text-muted-foreground mt-1">
                  with {event.instructor}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Badge
                variant={event.status === "published" ? "success" : "secondary"}
              >
                {event.status}
              </Badge>
              <Badge variant="outline">{formatCurrency(event.price)}</Badge>
            </div>
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
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Bookings</p>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {bookings?.length || 0}
                  {event.max_capacity && ` / ${event.max_capacity}`}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex gap-2">
                <Badge variant="success">{paidCount} paid</Badge>
                <Badge variant="secondary">{attendedCount} attended</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendees ({bookings?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendeeTable bookings={bookings || []} eventId={event.id} />
        </CardContent>
      </Card>
    </div>
  );
}
