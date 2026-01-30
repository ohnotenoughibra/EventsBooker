import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Users, CalendarDays } from "lucide-react";

export default async function AdminEventsPage() {
  const supabase = createClient();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: false });

  // Get booking counts for each event
  const eventsWithCounts = await Promise.all(
    (events || []).map(async (event) => {
      const { count } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event.id);
      return { ...event, booking_count: count || 0 };
    })
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-1">
            Manage your seminars and workshops
          </p>
        </div>
        <Link href="/admin/events/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Event
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          {eventsWithCounts.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No events yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first event to get started.
              </p>
              <Link href="/admin/events/new">
                <Button>Create Event</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventsWithCounts.map((event) => {
                    const isPast = new Date(event.date) < new Date();
                    return (
                      <TableRow
                        key={event.id}
                        className={isPast ? "opacity-60" : ""}
                      >
                        <TableCell>
                          <div>
                            <Link
                              href={`/admin/events/${event.id}`}
                              className="font-medium hover:underline"
                            >
                              {event.title}
                            </Link>
                            {event.instructor && (
                              <p className="text-sm text-muted-foreground">
                                {event.instructor}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              isPast ? "text-muted-foreground" : ""
                            }
                          >
                            {formatDateShort(event.date)}
                          </span>
                        </TableCell>
                        <TableCell>{formatCurrency(event.price)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {event.booking_count}
                            {event.max_capacity && ` / ${event.max_capacity}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              event.status === "published"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {event.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/events/${event.id}`}>
                              <Button variant="outline" size="sm">
                                <Users className="h-4 w-4 mr-1" />
                                Attendees
                              </Button>
                            </Link>
                            <Link href={`/admin/events/${event.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
