import { CreditWallet } from "../models/creditWallet.model.js";

import sequelize from "../config/database.js";
import { CreditTransaction } from "../models/index.js";


export async function allocateCredits(orgId: string, amount: number) {
 
  const wallet = await CreditWallet.findOne({ where: { organization_id: orgId } });

  if (wallet) {
    wallet.setDataValue("balance", wallet.getDataValue("balance") + amount);
    await wallet.save();
  } else {
    await CreditWallet.create({
      organization_id: orgId,
      balance: amount,
    });
  }
}

export async function consumeCredits({
  orgId,
  amount,
  reason,
  referenceId,
}: {
  orgId: string;
  amount: number;
  reason: string;
  referenceId?: string;
}) {
  return sequelize.transaction(async (t) => {
    const wallet = await CreditWallet.findOne({
      where: { organization_id: orgId },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });
   

    if (!wallet || wallet.getDataValue("balance") < amount) {
      throw new Error("INSUFFICIENT_CREDITS");
    }

    wallet.setDataValue("balance", wallet.getDataValue("balance") - amount);
    await wallet.save({ transaction: t });

    // await CreditTransaction.create(
    //   {
    //     organization_id: orgId,
    //     amount: amount,
    //     type: 'CONSUMPTION',
    //     reason: reason ?? '',
    //     meta: {},
    //     reference_id: referenceId,
    //   },
    //   { transaction: t }
    // );Missing orgId in user contex

    return wallet.getDataValue("balance");
  });
}

export async function refundCredits({
  orgId,
  amount,
  reason,
  referenceId,
}: {
  orgId: string;
  amount: number;
  reason: string;
  referenceId?: string;
}) {
  await CreditWallet.increment(
    { balance: amount },
    { where: { organization_id: orgId } }
  );

  await CreditTransaction.create({
    organization_id: orgId,
    amount,
    reason,
    reference_id: referenceId,
  });
}

// export async function consumeCredits({
//   orgId,
//   amount,
//   reason,
//   referenceId,
// }: {
//   orgId: string;
//   amount: number;
//   reason: string;
//   referenceId?: string;
// }) {
//   return sequelize.transaction(async (t) => {
//     const wallet = await CreditWallet.findOne({
//       where: { org_id: orgId },
//       lock: t.LOCK.UPDATE,
//       transaction: t,
//     });

//     if (!wallet || wallet.balance < amount) {
//       throw new Error('INSUFFICIENT_CREDITS');
//     }

//     wallet.balance -= amount;
//     await wallet.save({ transaction: t });

//     await CreditTransaction.create(
//       {
//         org_id: orgId,
//         amount: -amount,
//         reason,
//         reference_id: referenceId,
//       },
//       { transaction: t }
//     );

//     return wallet.balance;
//   });
// }
