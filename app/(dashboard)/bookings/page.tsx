import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingCard } from "@/components/bookings/booking-card";
import { Ticket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function BookingsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      events (*)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Separate bookings into upcoming and past
  const now = new Date();
  const upcomingBookings =
    bookings?.filter((b) => new Date(b.events.date) >= now) || [];
  const pastBookings =
    bookings?.filter((b) => new Date(b.events.date) < now) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your event bookings
        </p>
      </div>

      {bookings?.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <Ticket className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No bookings yet</h3>
          <p className="text-muted-foreground mb-4">
            You haven't booked any events yet.
          </p>
          <Link href="/dashboard">
            <Button>Browse Events</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Upcoming Bookings */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            {upcomingBookings.length === 0 ? (
              <p className="text-muted-foreground">
                No upcoming bookings.{" "}
                <Link href="/dashboard" className="text-primary hover:underline">
                  Browse events
                </Link>
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    event={booking.events}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Past Events</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {pastBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    event={booking.events}
                    isPast
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
