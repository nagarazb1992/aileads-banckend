import { handleCheckoutCompleted } from "../services/billing.service.js";

export async function paddleWebhook(req:any, res:any) {
  try {
    const event = req.body;

    switch (event.name) {
      case 'checkout.completed':
        await handleCheckoutCompleted(event);
        break;

      default:
        console.log('Unhandled Paddle event:', event.name);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Paddle webhook error:', error);
    res.sendStatus(500);
  }
}
