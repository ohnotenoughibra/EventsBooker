/**
 * EPC QR Code Generator
 * Generates a SEPA/EPC QR code string according to the European Payments Council guidelines
 * This format is widely used in Austria and Germany for bank transfers
 */

interface EPCQRData {
  iban: string;
  bic?: string;
  creditorName: string;
  amount: number;
  reference: string;
  information?: string;
}

export function generateEPCQRString(data: EPCQRData): string {
  // EPC QR code format specification:
  // Service Tag (BCD)
  // Version (002)
  // Character set (1 = UTF-8)
  // Identification (SCT = SEPA Credit Transfer)
  // BIC of beneficiary
  // Name of beneficiary
  // IBAN of beneficiary
  // Amount (EUR format)
  // Purpose (empty for us)
  // Reference (Structured Creditor Reference or unstructured remittance information)
  // Remittance information (unstructured)
  // Information for beneficiary

  const lines = [
    "BCD", // Service Tag
    "002", // Version
    "1", // Character set (UTF-8)
    "SCT", // SEPA Credit Transfer
    data.bic || "", // BIC (optional but recommended)
    data.creditorName.substring(0, 70), // Beneficiary name (max 70 chars)
    data.iban.replace(/\s/g, ""), // IBAN (remove spaces)
    `EUR${data.amount.toFixed(2)}`, // Amount
    "", // Purpose (empty)
    "", // Structured reference (empty, using unstructured)
    data.reference.substring(0, 140), // Unstructured remittance info (max 140 chars)
    data.information?.substring(0, 70) || "", // Additional info (max 70 chars)
  ];

  return lines.join("\n");
}

export function getPaymentDetails() {
  return {
    iban: process.env.NEXT_PUBLIC_PAYMENT_IBAN || "AT12 3456 7890 1234 5678",
    bic: process.env.NEXT_PUBLIC_PAYMENT_BIC || "BKAUATWW",
    creditorName: process.env.NEXT_PUBLIC_PAYMENT_CREDITOR_NAME || "Roots Collective",
    creditorAddress: process.env.NEXT_PUBLIC_PAYMENT_CREDITOR_ADDRESS || "",
  };
}
