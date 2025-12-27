import { Campaign } from "../models/campaign.model.js";
import { CampaignLead } from "../models/campaignLead.model.js";


export async function checkCampaignCompletion(campaignId: string) {
  const activeCount = await CampaignLead.count({
    where: {
      campaign_id: campaignId,
      status: 'ACTIVE'
    }
  });

  if (activeCount === 0) {
    await Campaign.update(
      { status: 'COMPLETED' },
      { where: { id: campaignId } }
    );
  }
}
