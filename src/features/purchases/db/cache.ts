import { getGlobalTag, getIdTag, getUserTag } from "@/lib/dataCache"
import { revalidateTag } from "next/cache"

export const getPurchaseGlobalTag = () => getGlobalTag("purchases")

export const getPurchaseIdTag = (id: string) => getIdTag("purchases", id)

export const getPurchaseUserTag = (userId: string) =>
  getUserTag("purchases", userId)

export const revalidatePurchaseCache = ({
  id,
  userId,
}: {
  id: string
  userId: string
}) => {
  revalidateTag(getPurchaseGlobalTag())
  revalidateTag(getPurchaseIdTag(id))
  revalidateTag(getPurchaseUserTag(userId))
}
