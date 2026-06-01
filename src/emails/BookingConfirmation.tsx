import React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
  Hr,
  Row,
  Column,
} from "@react-email/components";

export interface BookingConfirmationProps {
  name: string;
  email: string;
  packageName: string;
  date: string;
  time: string;
  people: string;
  deposit: number;
  total: number;
  bookingId: string;
}

export default function BookingConfirmation({
  name,
  packageName,
  date,
  time,
  people,
  deposit,
  total,
  bookingId,
}: BookingConfirmationProps) {
  const remaining = total - deposit;

  // Formatting date for prettier showcase if it is a simple ISO string, or just using the prop date
  let displayDate = date;
  try {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      displayDate = parsedDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  } catch (e) {
    // Fallback to raw string
  }

  return (
    <Html lang="id">
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header Brand */}
          <Section style={header}>
            <Text style={logoText}>BigApple Lens</Text>
            <Text style={tagline}>PREMIUM NYC PHOTOGRAPHY</Text>
          </Section>

          {/* Email Body Content */}
          <Section style={contentBody}>
            {/* Title Section */}
            <Section style={{ textAlign: "center", marginBottom: "30px" }}>
              <Text style={checkIcon}>✅</Text>
              <Heading style={titleHead}>Booking Confirmed!</Heading>
              <Text style={subtitleText}>
                Terima kasih, {name}. Sesi pemotretan Anda di New York City telah terjadwal dengan aman.
              </Text>
            </Section>

            {/* Summary Card */}
            <Section style={summaryCard}>
              <Heading style={summaryTitle}>Detail Pesanan Anda</Heading>
              <Hr style={divider} />
              
              <table style={tableStyle}>
                <tbody>
                  <tr style={tableRow}>
                    <td style={leadCol}>ID Pesanan:</td>
                    <td style={valCol}>
                      <span style={monoCode}>{bookingId}</span>
                    </td>
                  </tr>
                  <tr style={tableRow}>
                    <td style={leadCol}>Paket Pilihan:</td>
                    <td style={valCol}><strong style={boldText}>{packageName}</strong></td>
                  </tr>
                  <tr style={tableRow}>
                    <td style={leadCol}>Tanggal Sesi:</td>
                    <td style={valCol}>{displayDate}</td>
                  </tr>
                  <tr style={tableRow}>
                    <td style={leadCol}>Waktu Sesi:</td>
                    <td style={valCol}>{time}</td>
                  </tr>
                  <tr style={tableRow}>
                    <td style={leadCol}>Jumlah Orang:</td>
                    <td style={valCol}>{people} Orang</td>
                  </tr>
                  <tr style={tableRow}>
                    <td style={leadCol}>Deposit Dibayarkan:</td>
                    <td style={valCol}>
                      <span style={highlightPaid}>${deposit.toFixed(2)} USD</span>
                    </td>
                  </tr>
                  <tr style={tableRow}>
                    <td style={leadCol}>Sisa Pembayaran:</td>
                    <td style={valCol}>
                      <span style={highlightRemaining}>${remaining.toFixed(2)} USD</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <Text style={noticeText}>
                *Sisa pembayaran sebesar ${remaining.toFixed(2)} USD dibayarkan langsung secara tunai/transfer pada hari H sesi pemotretan.
              </Text>
            </Section>

            {/* Next Steps */}
            <Section style={nextStepsSection}>
              <Heading style={sectionTitle}>What's Next? (Langkah Selanjutnya)</Heading>
              <ol style={listStyle}>
                <li style={listItemStyle}>
                  <strong style={boldText}>Konfirmasi Lokasi:</strong> Kami akan segera menghubungi <span style={{ textDecoration: "underline" }}>{name}</span> via email/WhatsApp untuk mencocokkan titik pertemuan penjemputan spesifik di NYC.
                </li>
                <li style={listItemStyle}>
                  <strong style={boldText}>Ketepatan Waktu:</strong> Silakan hadir 15-10 menit sebelum waktu sesi yang dipilih untuk persiapan outfits dan cuaca.
                </li>
                <li style={listItemStyle}>
                  <strong style={boldText}>Pengiriman Foto:</strong> Sneak peek berupa 2-5 foto yang sudah dikurasi akan dikirim dalam waktu 24 jam setelah sesi selesai!
                </li>
              </ol>
            </Section>

            {/* CTA Button */}
            <Section style={{ textAlign: "center", marginTop: "35px", marginBottom: "20px" }}>
              <Button href="https://bigapplelens.com/portfolio" style={ctaButton}>
                View Our Portfolio
              </Button>
            </Section>
          </Section>

          {/* Footer Branding */}
          <Section style={footer}>
            <Text style={footerText}>
              BigApple Lens Photography • Times Square & Brooklyn Bridge NYC
            </Text>
            <Text style={footerText}>
              Pertanyaan atau Kendala? Hubungi kami di{" "}
              <a href="mailto:support@bigapplelens.com" style={footerLink}>
                support@bigapplelens.com
              </a>
            </Text>
            <Text style={unsubscribeText}>
              © 2026 BigApple Lens. All rights reserved. Anda menerima email ini karena melakukan pemesanan sesi di platform kami.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// === PREMIUM STYLING INLINE DEFINITIONS ===
const main = {
  backgroundColor: "#f4f4f5",
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  margin: "0 auto",
  padding: "40px 0",
};

const container = {
  maxWidth: "600px",
  backgroundColor: "#ffffff",
  border: "1px solid #e1e1e3",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

const header = {
  backgroundColor: "#0F0F0F",
  padding: "40px 20px",
  textAlign: "center" as const,
  borderBottom: "4px solid #D4AF37",
};

const logoText = {
  color: "#D4AF37",
  fontSize: "30px",
  fontWeight: "900",
  letterSpacing: "4px",
  textTransform: "uppercase" as const,
  margin: "0",
  padding: "0",
};

const tagline = {
  color: "#888888",
  fontSize: "10px",
  letterSpacing: "3px",
  textTransform: "uppercase" as const,
  margin: "5px 0 0 0",
  fontWeight: "600",
};

const contentBody = {
  padding: "40px 30px",
};

const checkIcon = {
  fontSize: "44px",
  margin: "0",
};

const titleHead = {
  fontSize: "26px",
  fontWeight: "800",
  color: "#111111",
  margin: "10px 0 5px 0",
};

const subtitleText = {
  fontSize: "14px",
  color: "#555555",
  lineHeight: "1.5",
  margin: "0",
};

const summaryCard = {
  backgroundColor: "#f9f9fb",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  padding: "24px",
  marginTop: "20px",
};

const summaryTitle = {
  fontSize: "15px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  color: "#111111",
  margin: "0 0 10px 0",
};

const divider = {
  borderTop: "1px solid #e5e5e7",
  margin: "12px 0",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const tableRow = {
  borderBottom: "1px solid #f0f0f2",
};

const leadCol = {
  padding: "10px 0",
  fontSize: "13px",
  color: "#6b7280",
  width: "40%",
  fontWeight: "500",
};

const valCol = {
  padding: "10px 0",
  fontSize: "13px",
  color: "#111111",
  textAlign: "right" as const,
};

const boldText = {
  fontWeight: "700",
};

const monoCode = {
  fontFamily: "monospace",
  fontSize: "12px",
  backgroundColor: "#e4e4e7",
  padding: "2px 6px",
  borderRadius: "4px",
  color: "#000000",
};

const highlightPaid = {
  color: "#16a34a",
  fontWeight: "700",
  fontSize: "14px",
};

const highlightRemaining = {
  color: "#ca8a04",
  fontWeight: "700",
  fontSize: "14px",
};

const noticeText = {
  fontSize: "11px",
  color: "#71717a",
  fontStyle: "italic",
  lineHeight: "1.4",
  marginTop: "12px",
  marginBottom: "0",
};

const nextStepsSection = {
  marginTop: "30px",
};

const sectionTitle = {
  fontSize: "14px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  color: "#0F0F0F",
  marginBottom: "15px",
};

const listStyle = {
  paddingLeft: "20px",
  margin: "0",
};

const listItemStyle = {
  fontSize: "13px",
  color: "#4b5563",
  lineHeight: "1.6",
  marginBottom: "10px",
};

const ctaButton = {
  backgroundColor: "#0F0F0F",
  border: "2px solid #D4AF37",
  borderRadius: "4px",
  color: "#D4AF37",
  fontSize: "13px",
  fontWeight: "700",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 30px",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const footer = {
  backgroundColor: "#0F0F0F",
  padding: "30px 20px",
  textAlign: "center" as const,
  color: "#999999",
};

const footerText = {
  fontSize: "11px",
  margin: "0 0 8px 0",
  lineHeight: "1.4",
};

const footerLink = {
  color: "#D4AF37",
  textDecoration: "underline",
};

const unsubscribeText = {
  fontSize: "9px",
  color: "#666666",
  marginTop: "20px",
  lineHeight: "1.4",
};
