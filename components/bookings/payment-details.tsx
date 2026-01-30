"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Event, Booking } from "@/types/database";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface PaymentDetailsProps {
  booking: Booking;
  event: Event;
  paymentDetails: {
    iban: string;
    bic: string;
    creditorName: string;
    creditorAddress: string;
  };
  epcString: string;
}

export function PaymentDetails({
  booking,
  event,
  paymentDetails,
  epcString,
}: PaymentDetailsProps) {
  const { toast } = useToast();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    async function generateQR() {
      try {
        const dataUrl = await QRCode.toDataURL(epcString, {
          width: 300,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });
        setQrCodeDataUrl(dataUrl);
      } catch (error) {
        console.error("Failed to generate QR code:", error);
      }
    }
    generateQR();
  }, [epcString]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard.`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Payment Details
          <Badge variant={booking.paid ? "success" : "warning"}>
            {booking.paid ? "Paid" : "Pending Payment"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code */}
        <div className="flex flex-col items-center space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Scan this QR code with your banking app to pay instantly
          </p>
          {qrCodeDataUrl ? (
            <div className="bg-white p-4 rounded-lg">
              <img
                src={qrCodeDataUrl}
                alt="Payment QR Code"
                className="w-64 h-64 md:w-72 md:h-72"
              />
            </div>
          ) : (
            <div className="w-64 h-64 md:w-72 md:h-72 bg-muted animate-pulse rounded-lg" />
          )}
        </div>

        <Separator />

        {/* Payment Information */}
        <div className="space-y-4">
          <h4 className="font-medium">Bank Transfer Details</h4>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Recipient</p>
                <p className="font-medium">{paymentDetails.creditorName}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  copyToClipboard(paymentDetails.creditorName, "Recipient")
                }
              >
                {copiedField === "Recipient" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">IBAN</p>
                <p className="font-mono font-medium">{paymentDetails.iban}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  copyToClipboard(
                    paymentDetails.iban.replace(/\s/g, ""),
                    "IBAN"
                  )
                }
              >
                {copiedField === "IBAN" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">BIC</p>
                <p className="font-mono font-medium">{paymentDetails.bic}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(paymentDetails.bic, "BIC")}
              >
                {copiedField === "BIC" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="font-medium text-lg">
                  {formatCurrency(event.price)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  copyToClipboard(event.price.toFixed(2), "Amount")
                }
              >
                {copiedField === "Amount" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border-2 border-primary/20">
              <div>
                <p className="text-xs text-muted-foreground">
                  Payment Reference (IMPORTANT!)
                </p>
                <p className="font-mono font-bold text-lg text-primary">
                  {booking.reference}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(booking.reference, "Reference")}
              >
                {copiedField === "Reference" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
            <strong>Important:</strong> Please include the payment reference{" "}
            <code className="font-mono bg-muted px-1 rounded">
              {booking.reference}
            </code>{" "}
            in your bank transfer so we can identify your payment.
          </p>
        </div>

        <Separator />

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/bookings" className="flex-1">
            <Button variant="outline" className="w-full">
              View My Bookings
            </Button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <Button variant="secondary" className="w-full">
              Browse More Events
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
