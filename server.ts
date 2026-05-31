import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON
  app.use(express.json());

  // API endpoints
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        throw new Error("Stripe secret key is missing");
      }

      const stripe = new Stripe(stripeKey, {
        apiVersion: "2025-02-24.acacia" as any,
      });

      const { packageId, packageName, price, date, time, people, name, email, notes } = req.body;
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
          date,
          time,
          people,
        }
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res.status(500).json({ error: error.message || "Failed to create checkout session" });
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
