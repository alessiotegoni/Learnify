"use server";

import { db } from "@/drizzle/db";
import { isAdmin } from "@/services/clerk";
import { stripeServerClient } from "@/services/stripe/stripeServer";
import { updatePurchase } from "../db/purchases";
import { revokeUserCourseAccess } from "@/features/courses/db/userCourseAccess";

export async function refundPurchase(purchaseId: string) {
  if (!(await isAdmin()))
    return { error: true, message: "Error refunding this purchase" };

  const data = await db.transaction(async (trx) => {
    const refundedPurchase = await updatePurchase(
      purchaseId,
      { refundedAt: new Date() },
      trx
    );

    const session = await stripeServerClient.checkout.sessions.retrieve(
      refundedPurchase.stripeSessionId
    );

    if (!session.payment_intent) {
      trx.rollback();
      return {
        error: true,
        message: "Error refunding this purchase",
      };
    }

    try {
      await stripeServerClient.refunds.create({
        payment_intent:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent.id,
      });
      await revokeUserCourseAccess(refundedPurchase, trx);
    } catch (err) {
      trx.rollback();
      return { error: true, message: "Error refunding this purchase" };
    }
  });

  return data ?? { error: false, message: "Succesfully refunded purchase" };
}
