"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BookingWithUser } from "@/types/database";
import { formatDateShort } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, Users, CheckCircle } from "lucide-react";

interface AttendeeTableProps {
  bookings: BookingWithUser[];
  eventId: string;
}

export function AttendeeTable({ bookings, eventId }: AttendeeTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === bookings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(bookings.map((b) => b.id));
    }
  };

  const updateBooking = async (
    id: string,
    field: "paid" | "attended",
    value: boolean
  ) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ [field]: value })
        .eq("id", id);

      if (error) throw error;
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const bulkMarkAttended = async () => {
    if (selectedIds.length === 0) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ attended: true })
        .in("id", selectedIds);

      if (error) throw error;
      toast({
        title: "Success",
        description: `Marked ${selectedIds.length} attendees as attended.`,
      });
      setSelectedIds([]);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const bulkMarkPaid = async () => {
    if (selectedIds.length === 0) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ paid: true })
        .in("id", selectedIds);

      if (error) throw error;
      toast({
        title: "Success",
        description: `Marked ${selectedIds.length} bookings as paid.`,
      });
      setSelectedIds([]);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Reference",
      "Booked At",
      "Paid",
      "Attended",
    ];
    const rows = bookings.map((b) => [
      b.profiles?.full_name || "N/A",
      b.profiles?.email || "N/A",
      b.reference,
      formatDateShort(b.created_at),
      b.paid ? "Yes" : "No",
      b.attended ? "Yes" : "No",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `attendees-${eventId}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No bookings yet</h3>
        <p className="text-muted-foreground">
          No one has booked this event yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={bulkMarkPaid}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Mark Paid ({selectedIds.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={bulkMarkAttended}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Mark Attended ({selectedIds.length})
              </Button>
            </>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedIds.length === bookings.length &&
                    bookings.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Booked</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Attended</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(booking.id)}
                    onCheckedChange={() => toggleSelect(booking.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {booking.profiles?.full_name || "N/A"}
                </TableCell>
                <TableCell>{booking.profiles?.email || "N/A"}</TableCell>
                <TableCell className="font-mono text-sm">
                  {booking.reference}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateShort(booking.created_at)}
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={booking.paid}
                    onCheckedChange={(checked) =>
                      updateBooking(booking.id, "paid", checked as boolean)
                    }
                    disabled={isUpdating}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={booking.attended}
                    onCheckedChange={(checked) =>
                      updateBooking(booking.id, "attended", checked as boolean)
                    }
                    disabled={isUpdating}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>Total: {bookings.length}</span>
        <span>Paid: {bookings.filter((b) => b.paid).length}</span>
        <span>Attended: {bookings.filter((b) => b.attended).length}</span>
      </div>
    </div>
  );
}
