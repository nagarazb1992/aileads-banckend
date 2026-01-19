import { WhatsappAccount } from '../models/WhatsappAccount.js';

export async function connectWhatsapp(req:any, res:any) {
  const { phone } = req.body;

  const account = await WhatsappAccount.create({
    org_id: req.user.orgId,
    user_id: req.user.userId,
    phone_number: phone,
    provider: 'TWILIO'
  });

  res.json(account);
}
