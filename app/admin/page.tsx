import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Users,
  CreditCard,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";

export default async function AdminDashboard() {
  const supabase = createClient();

  // Get all events with booking counts
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });

  // Get all bookings
  const { data: bookings } = await supabase.from("bookings").select("*, events(price)");

  // Calculate statistics
  const totalEvents = events?.length || 0;
  const publishedEvents =
    events?.filter((e) => e.status === "published").length || 0;
  const upcomingEvents =
    events?.filter(
      (e) => e.status === "published" && new Date(e.date) >= new Date()
    ) || [];
  const totalBookings = bookings?.length || 0;
  const paidBookings = bookings?.filter((b) => b.paid).length || 0;
  const totalRevenue =
    bookings
      ?.filter((b) => b.paid)
      .reduce((sum, b) => sum + (b.events?.price || 0), 0) || 0;

  // Get upcoming events (next 5)
  const nextEvents = upcomingEvents.slice(0, 5);

  // Calculate booking counts for upcoming events
  const eventsWithCounts = await Promise.all(
    nextEvents.map(async (event) => {
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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of events and bookings
          </p>
        </div>
        <Link href="/admin/events/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Event
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {publishedEvents} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {paidBookings} paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">from paid bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">upcoming events</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Events</CardTitle>
          <Link href="/admin/events">
            <Button variant="ghost" size="sm" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {eventsWithCounts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No upcoming events.{" "}
              <Link
                href="/admin/events/new"
                className="text-primary hover:underline"
              >
                Create one
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {eventsWithCounts.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="font-medium hover:underline"
                    >
                      {event.title}
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatDateShort(event.date)}</span>
                      <span>{formatCurrency(event.price)}</span>
                      {event.instructor && <span>{event.instructor}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">
                        {event.booking_count}
                        {event.max_capacity && ` / ${event.max_capacity}`}
                      </p>
                      <p className="text-xs text-muted-foreground">bookings</p>
                    </div>
                    <Link href={`/admin/events/${event.id}`}>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
