import { dodoClient } from "../utils/dodoClient.js";

export const createCheckoutSession = async (req:any, res:any) => {
  try {
    const { orgId, email, priceId, planName } = req.body;

    if (!orgId || !email) {
      return res.status(400).json({ message: "Missing orgId or email" });
    }

    console.log("Creating Dodo checkout session for orgId:", orgId, "email:", email);

    const session = await dodoClient.checkoutSessions.create({
      product_cart: [
        {
          product_id: priceId, // ✅ YOUR PRODUCT
          quantity: 1,
        },
      ],

    //   subscription_data: {
    //     trial_period_days: 14,
    //   },

      customer: {
        email,
      },

      metadata: {
        orgId,
        plan: planName,
      },

      return_url: `${process.env.FRONTEND_URL}/dashboard/billing/success`,
    });

    return res.json({
      checkoutUrl: session.checkout_url,
    });
  } catch (error) {
    console.error("Dodo checkout error:", error);
    return res.status(500).json({ message: "Failed to create checkout session" });
  }
};
