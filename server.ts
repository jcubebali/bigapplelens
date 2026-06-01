import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import fs from "fs/promises";
import { sendConfirmationEmail } from "./src/lib/mailer.js";

const AVAILABILITY_FILE_PATH = path.join(process.cwd(), "data", "availability.json");
const BOOKINGS_FILE_PATH = path.join(process.cwd(), "data", "bookings.json");

// Lock mechanism for write operations to avoid write race conditions on files
let isDbLocked = false;

async function acquireDbLock(): Promise<void> {
  while (isDbLocked) {
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  isDbLocked = true;
}

function releaseDbLock(): void {
  isDbLocked = false;
}

interface DateConfig {
  available: boolean;
  slots: string[];
  bookedSlots?: string[];
}

interface AvailabilityData {
  [dateStr: string]: DateConfig;
}

// === HELPER FUNCTIONS FOR FILE OPERATIONS ===

// Baca file JSON, return {} atau [] jika tidak ada
async function readJSON(filePath: string): Promise<any> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (filePath.endsWith("bookings.json")) {
      return [];
    }
    return {};
  }
}

// Tulis file JSON dengan formatting aman dan atomic lock
async function writeJSON(filePath: string, data: any): Promise<void> {
  await acquireDbLock();
  try {
    const jsonString = JSON.stringify(data, null, 2);
    // Write to a temporary file first then rename to guarantee atomic write
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, jsonString, "utf-8");
    await fs.rename(tempPath, filePath);
  } finally {
    releaseDbLock();
  }
}

// Tambah booking ke bookings.json
async function appendBooking(booking: any): Promise<void> {
  try {
    const bookings = await readJSON(BOOKINGS_FILE_PATH);
    
    // Idempotency check: see if stripeSessionId already exists
    const exists = bookings.some((b: any) => b.stripeSessionId === booking.stripeSessionId);
    if (!exists) {
      bookings.push(booking);
      await writeJSON(BOOKINGS_FILE_PATH, bookings);
    }
  } catch (error) {
    console.error("Error inside appendBooking helper:", error);
  }
}

// Update status booking berdasarkan stripeSessionId
async function updateBookingStatus(stripeSessionId: string, status: string): Promise<void> {
  try {
    const bookings = await readJSON(BOOKINGS_FILE_PATH);
    let updated = false;
    
    bookings.forEach((b: any) => {
      if (b.stripeSessionId === stripeSessionId) {
        b.status = status;
        updated = true;
      }
    });
    
    if (updated) {
      await writeJSON(BOOKINGS_FILE_PATH, bookings);
    }
  } catch (error) {
    console.error("Error inside updateBookingStatus helper:", error);
  }
}

// Toggle slot di availability.json (booked: true -> ditambahkan, booked: false -> dihapus)
async function markSlotBooked(date: string, time: string, booked: boolean): Promise<void> {
  try {
    const availability = await readJSON(AVAILABILITY_FILE_PATH);
    
    if (!availability[date]) {
      availability[date] = {
        available: true,
        slots: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
        bookedSlots: []
      };
    }
    
    // Normalize format of chosen slot (e.g., if chosen time has suffix like '09:00 AM' -> '09:00')
    let normalizedTime = time;
    if (time.includes(":")) {
      const parts = time.split(" ");
      normalizedTime = parts[0];
    }

    const bookedSlots = availability[date].bookedSlots || [];
    
    if (booked) {
      if (!bookedSlots.includes(normalizedTime)) {
        bookedSlots.push(normalizedTime);
      }
    } else {
      const index = bookedSlots.indexOf(normalizedTime);
      if (index > -1) {
        bookedSlots.splice(index, 1);
      }
    }
    
    availability[date].bookedSlots = bookedSlots;
    await writeJSON(AVAILABILITY_FILE_PATH, availability);
  } catch (error) {
    console.error("Error inside markSlotBooked helper:", error);
  }
}

// Compatibility wrapper for original code
async function markSlotAsBooked(date: string, time: string): Promise<boolean> {
  try {
    await markSlotBooked(date, time, true);
    return true;
  } catch (error) {
    console.error("Failed to dynamically reserve the slot inside JSON catalog", error);
    return false;
  }
}

// Lazy Stripe initialization
function getStripe(): Stripe {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is required");
  }
  return new Stripe(stripeKey, {
    apiVersion: "2025-02-24.acacia" as any,
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // === STRIPE WEBHOOK ENDPOINT (MUST BE REGISTERED BEFORE Global express.json Middleware) ===
  app.post("/api/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    if (!sig) {
      return res.status(400).send("Webhook Error: Missing stripe-signature header");
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("STRIPE_WEBHOOK_SECRET environment variable is missing - signature verification might fail.");
    }

    let event: Stripe.Event;

    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret || "");
    } catch (err: any) {
      console.error(`Webhook Signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Process Stripe Events
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const metadata = session.metadata || {};
          
          const packageId = metadata.packageId || "unknown";
          const packageName = metadata.packageName || "Custom Session";
          const date = metadata.date || "";
          const time = metadata.time || "";
          const people = parseInt(metadata.people || "1");
          const name = metadata.name || session.customer_details?.name || "Client";
          const email = session.customer_email || session.customer_details?.email || "unknown@example.com";
          const stripeSessionId = session.id;
          const deposit = session.amount_total ? session.amount_total / 100 : 0;
          const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : "";

          const id = `b_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          
          const newBooking = {
            id,
            stripeSessionId,
            paymentIntentId,
            packageId,
            packageName,
            name,
            date,
            time,
            people,
            email,
            status: "confirmed",
            deposit,
            paidAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };

          // Append to bookings database
          await appendBooking(newBooking);

          // Mark slot in availability catalog
          if (date && time) {
            await markSlotBooked(date, time, true);
          }

          // Send automatic confirmation email to the client using dual-provider (isolated inside helper)
          await sendConfirmationEmail({
            name,
            email,
            packageName,
            date,
            time,
            people: String(people),
            deposit,
            total: session.amount_total ? (session.amount_total / 100) : (deposit * 2),
            bookingId: id,
          });

          console.log(`Booking confirmed: ${email} - ${packageName} on ${date} at ${time}`);
          break;
        }

        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const sessionId = paymentIntent.metadata?.checkout_session_id || paymentIntent.id;
          
          console.log(`Payment failed for session: ${sessionId}`);
          await updateBookingStatus(sessionId, "failed");
          break;
        }

        case "charge.refunded": {
          const charge = event.data.object as Stripe.Charge;
          const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : "";

          // Cari booking berdasarkan stripeSessionId / paymentIntentId
          const bookings = await readJSON(BOOKINGS_FILE_PATH);
          const booking = bookings.find((b: any) => b.paymentIntentId === paymentIntentId || b.stripeSessionId === paymentIntentId);
          
          if (booking) {
            await updateBookingStatus(booking.stripeSessionId, "refunded");
            
            // Kembalikan slot ke tersedia
            if (booking.date && booking.time) {
              await markSlotBooked(booking.date, booking.time, false);
            }
            console.log(`Booking refunded successfully, slot freed: ${booking.email} on ${booking.date} at ${booking.time}`);
          } else {
            console.log(`Charge refunded but matching booking not found for payment intent: ${paymentIntentId}`);
          }
          break;
        }

        case "checkout.session.expired": {
          const session = event.data.object as Stripe.Checkout.Session;
          const sessionId = session.id;
          
          console.log(`Session expired: ${sessionId}`);
          
          // Hapus booking pending jika ada
          const bookings = await readJSON(BOOKINGS_FILE_PATH);
          const filtered = bookings.filter((b: any) => !(b.stripeSessionId === sessionId && b.status === "pending"));
          
          if (bookings.length !== filtered.length) {
            await writeJSON(BOOKINGS_FILE_PATH, filtered);
          }

          // Kembalikan slot di availability.json menjadi tersedia kembali karena checkout gagal / expired
          const date = session.metadata?.date;
          const time = session.metadata?.time;
          if (date && time) {
            await markSlotBooked(date, time, false);
            console.log(`Freed expiration reserved slot for ${date} at ${time}`);
          }
          break;
        }

        default:
          console.log(`Unhandled Stripe Event Type: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (err: any) {
      console.error(`Error processing webhook event: ${err.message}`);
      res.status(500).json({ error: "Internal processing failure" });
    }
  });

  // Global body parsers for JSON and URLencoded requests (registered AFTER webhook raw body)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // GET /api/availability (Public Endpoint)
  app.get("/api/availability", async (req, res) => {
    try {
      const data = await readJSON(AVAILABILITY_FILE_PATH);
      const monthFilter = req.query.month as string; // optionally filter format: YYYY-MM
      
      if (monthFilter) {
        const filtered: AvailabilityData = {};
        Object.entries(data).forEach(([key, val]) => {
          if (key.startsWith(monthFilter)) {
            filtered[key] = val as DateConfig;
          }
        });
        return res.json(filtered);
      }
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to read availability catalog" });
    }
  });

  // POST /api/admin/availability (Protected Single Date Edit)
  app.post("/api/admin/availability", async (req, res) => {
    const key = req.headers["x-admin-key"];
    if (key !== "admin2024") {
      return res.status(401).json({ error: "Unauthorized command" });
    }

    try {
      const { date, available, slots, bookedSlots } = req.body;
      if (!date) {
        return res.status(400).json({ error: "Missing Target Date parameter" });
      }

      const currentData = await readJSON(AVAILABILITY_FILE_PATH);
      
      currentData[date] = {
        available: available !== undefined ? available : true,
        slots: slots || [],
        bookedSlots: bookedSlots || currentData[date]?.bookedSlots || []
      };

      await writeJSON(AVAILABILITY_FILE_PATH, currentData);
      res.json({ success: true, updated: date });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to update configurations" });
    }
  });

  // POST /api/admin/availability/bulk (Protected Multi-Date Edit)
  app.post("/api/admin/availability/bulk", async (req, res) => {
    const key = req.headers["x-admin-key"];
    if (key !== "admin2024") {
      return res.status(401).json({ error: "Unauthorized bulk override" });
    }

    try {
      const { dates, available, slots } = req.body;
      if (!dates || !Array.isArray(dates) || dates.length === 0) {
        return res.status(400).json({ error: "Dates list array is required" });
      }

      const currentData = await readJSON(AVAILABILITY_FILE_PATH);

      dates.forEach(dateStr => {
        const existBooked = currentData[dateStr]?.bookedSlots || [];
        currentData[dateStr] = {
          available: available !== undefined ? available : true,
          slots: slots || [],
          bookedSlots: existBooked
        };
      });

      await writeJSON(AVAILABILITY_FILE_PATH, currentData);
      res.json({ success: true, updatedCount: dates.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed bulk operation writing" });
    }
  });

  // Stripe Session Endpoint updated to mark booking slot as locked and store full metadata
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const stripe = getStripe();
      const { packageId, packageName, price, date, time, people, name, email, notes, phone } = req.body;
      const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

      // Calculate deposit (50%)
      const depositAmount = price * 0.5;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${packageName} - Deposit`,
                description: `Date: ${date} at ${time} | People: ${people} | Notes: ${notes || 'None'}`,
              },
              unit_amount: Math.round(depositAmount * 100), // convert to cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${appUrl}/booking/success`,
        cancel_url: `${appUrl}/booking`,
        customer_email: email,
        metadata: {
          packageId,
          packageName,
          date,
          time,
          people: String(people),
          name: name || "",
          phone: phone || "",
          notes: notes || ""
        }
      });

      // Once the checkout session is successfully created, we immediately mark the selected slot as booked
      // so other users cannot occupy the precise same hour slot while they finish checkout.
      await markSlotAsBooked(date, time);

      res.json({ url: session.url, sessionId: session.id });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
  });

  // GET /api/admin/bookings (Real + Mock bookings combined for high fidelity control panel)
  app.get("/api/admin/bookings", async (req, res) => {
    const key = req.headers["x-admin-key"];
    if (key !== "admin2024") {
      return res.status(401).json({ error: "Unauthorized access detected." });
    }

    const mockBookings = [
      {
        id: "1",
        name: "Alex Rivera",
        packageId: "express-ts",
        packageName: "Express Times Square",
        date: "2026-06-05",
        time: "06:00 PM (Sunset)",
        people: 2,
        status: "Confirmed",
        deposit: 124.5,
        email: "alex@example.com"
      },
      {
        id: "2",
        name: "Sofia Chen",
        packageId: "dumbo-iconic",
        packageName: "DUMBO Iconic",
        date: "2026-06-06",
        time: "07:00 AM (Sunrise)",
        people: 1,
        status: "Completed",
        deposit: 199.5,
        email: "sofia@example.com"
      },
      {
        id: "3",
        name: "Marcus & Emily",
        packageId: "brooklyn-combo",
        packageName: "Brooklyn Combo",
        date: "2026-06-12",
        time: "04:00 PM",
        people: 2,
        status: "Pending",
        deposit: 274.5,
        email: "emily@example.com"
      },
      {
        id: "4",
        name: "Liam Gallagher",
        packageId: "full-nyc",
        packageName: "Full Iconic NYC",
        date: "2026-06-15",
        time: "11:00 AM",
        people: 4,
        status: "Pending",
        deposit: 399.5,
        email: "liam@example.com"
      },
      {
        id: "5",
        name: "Christian Bale",
        packageId: "engagement",
        packageName: "Engagement Special",
        date: "2026-06-20",
        time: "06:00 PM (Sunset)",
        people: 2,
        status: "Confirmed",
        deposit: 349.5,
        email: "christian@example.com"
      }
    ];

    try {
      const realBookings = await readJSON(BOOKINGS_FILE_PATH);
      const formattedReal = realBookings.map((b: any) => ({
        id: b.id,
        name: b.name || "Real Customer",
        packageId: b.packageId,
        packageName: b.packageName,
        date: b.date,
        time: b.time,
        people: parseInt(b.people) || 1,
        status: b.status.charAt(0).toUpperCase() + b.status.slice(1), // Capitalize
        deposit: b.deposit,
        email: b.email
      }));
      res.json([...formattedReal, ...mockBookings]);
    } catch {
      res.json(mockBookings);
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // For SPA routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
