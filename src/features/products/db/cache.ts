import { getGlobalTag, getIdTag } from "@/lib/dataCache"
import { revalidateTag } from "next/cache"

export const getProductGlobalTag = () => getGlobalTag("products")

export const getProductIdTag = (id: string) => getIdTag("products", id)

export const revalidateProductCache = (id: string) => {
  revalidateTag(getProductGlobalTag())
  revalidateTag(getProductIdTag(id))
}
