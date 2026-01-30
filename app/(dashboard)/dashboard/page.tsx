import { createClient } from "@/lib/supabase/server";
import { EventCard } from "@/components/events/event-card";
import { CalendarDays } from "lucide-react";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true });

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
      <div>
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
        <p className="text-muted-foreground mt-2">
          Browse and book your spot at our seminars and workshops
        </p>
      </div>

      {eventsWithCounts.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No upcoming events</h3>
          <p className="text-muted-foreground">
            Check back later for new seminars and workshops.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {eventsWithCounts.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
