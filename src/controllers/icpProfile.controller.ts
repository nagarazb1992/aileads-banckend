import { Membership } from "../models/membership.model.js";
import { scoreLeadICP } from "../services/icp.service.js";
import type { Request as ExpressRequest, Response } from "express";
import { IcpProfile } from "../models/IcpProfile.js";

interface AuthRequest extends ExpressRequest {
  user?: {
    userId: string;
    // add other user properties if needed
  };
}


export async function scoreICP(req: any, res: any) {
  const { leadId, icpDescription } = req.body;
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;
  const result = await scoreLeadICP({
    orgId,
    leadId,
    icpDescription,
  });

  res.json(result);
}

/**
 * CREATE
 */
export const createIcpProfile = async (req: AuthRequest, res: Response) => {
  const membership = await Membership.findOne({
    where: { user_id: req.user?.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;

  const profile = await IcpProfile.create({ ...req.body, org_id: orgId });
  return res.status(201).json(profile);
};

/**
 * GET ALL (by org)
 */
export const getIcpProfiles = async (req: any, res: any) => {
  const membership = await Membership.findOne({
    where: { user_id: req.user?.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;

  if (!orgId || typeof orgId !== 'string') {
    return res.status(400).json({ message: "org_id is required and must be a string" });
  }

  const profiles = await IcpProfile.findAll({
    where: { org_id: orgId },
    order: [["createdAt", "DESC"]],
  });

  return res.json(profiles);
};

/**
 * GET ONE
 */
export const getIcpProfileById = async (req: any, res: any) => {
  const membership = await Membership.findOne({
    where: { user_id: req.user?.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;
  const profile = await IcpProfile.findOne({ where: { org_id: orgId } });

  if (!profile) {
    return res.status(404).json({ message: "ICP Profile not found" });
  }

  return res.json(profile);
};

/**
 * UPDATE
 */
export const updateIcpProfile = async (req: any, res: any) => {
  const profile = await IcpProfile.findByPk(req.params.id);

  if (!profile) {
    return res.status(404).json({ message: "ICP Profile not found" });
  }

  await profile.update(req.body);
  return res.json(profile);
};

/**
 * DELETE
 */
export const deleteIcpProfile = async (req: any, res: any) => {
  const profile = await IcpProfile.findByPk(req.params.id);

  if (!profile) {
    return res.status(404).json({ message: "ICP Profile not found" });
  }

  await profile.destroy();
  return res.status(204).send();
};
