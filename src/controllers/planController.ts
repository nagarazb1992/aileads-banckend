import { Plan } from "../models/Plan.js";

export async function getPlans(req:any, res:any) {
  const plans = await Plan.findAll({ order: [['priceMonthlyUsd', 'ASC']] });
  res.json(plans);
}