"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Event, Booking } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { generateBookingReference, formatCurrency } from "@/lib/utils";
import { generateEPCQRString, getPaymentDetails } from "@/lib/epc-qr";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";
import { PaymentDetails } from "@/components/bookings/payment-details";

interface BookingFormProps {
  event: Event;
  existingBooking: Booking | null;
  isSoldOut: boolean;
}

export function BookingForm({
  event,
  existingBooking,
  isSoldOut,
}: BookingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(existingBooking);

  async function handleBooking() {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to book an event.",
          variant: "destructive",
        });
        return;
      }

      // Generate unique reference
      let reference = generateBookingReference();
      let attempts = 0;

      // Ensure reference is unique
      while (attempts < 10) {
        const { data: existing } = await supabase
          .from("bookings")
          .select("id")
          .eq("reference", reference)
          .single();

        if (!existing) break;
        reference = generateBookingReference();
        attempts++;
      }

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          event_id: event.id,
          user_id: user.id,
          reference,
          paid: false,
          attended: false,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already booked",
            description: "You have already booked this event.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Booking failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      setBooking(data);
      toast({
        title: "Booking confirmed!",
        description: "Please complete your payment using the details below.",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (booking) {
    const paymentDetails = getPaymentDetails();
    const epcString = generateEPCQRString({
      iban: paymentDetails.iban,
      bic: paymentDetails.bic,
      creditorName: paymentDetails.creditorName,
      amount: event.price,
      reference: booking.reference,
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Booking Confirmed!</span>
        </div>
        <PaymentDetails
          booking={booking}
          event={event}
          paymentDetails={paymentDetails}
          epcString={epcString}
        />
      </div>
    );
  }

  if (isSoldOut) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">
          This event is sold out. Please check back later or contact us for
          waitlist options.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          By booking this event, you agree to pay {formatCurrency(event.price)}{" "}
          via bank transfer. You will receive payment instructions after
          confirming your booking.
        </p>
      </div>
      <Button
        onClick={handleBooking}
        disabled={isLoading}
        size="lg"
        className="w-full"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Confirm Booking - {formatCurrency(event.price)}
      </Button>
    </div>
  );
}
