import { getGlobalTag, getIdTag, getUserTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export const getUserProductAccessGlobalTag = () =>
  getGlobalTag("userProductAccess");

export const getUserProductAccessIdTag = ({
  productId,
  userId,
}: {
  productId: string;
  userId: string;
}) => getIdTag("userProductAccess", `product:${productId}-user:${userId}`);

export const getUserProductAccessUserTag = (userId: string) =>
  getUserTag("userProductAccess", userId);

export const revalidateUserProductAccessCache = ({
  productId,
  userId,
}: {
  productId: string;
  userId: string;
}) => {
  revalidateTag(getUserProductAccessGlobalTag());
  revalidateTag(getUserProductAccessIdTag({ productId, userId }));
  revalidateTag(getUserProductAccessUserTag(userId));
};
