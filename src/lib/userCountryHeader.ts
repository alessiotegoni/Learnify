import { pppCoupons } from "@/data/pppCoupons";
import { headers } from "next/headers";

const COUNTRY_HEADER_KEY = "x-user-country";

export const setUserCountryHeader = (
  headers: Headers,
  hasCountry: boolean,
  country: string | undefined
) =>
  !hasCountry || !country
    ? headers.delete(COUNTRY_HEADER_KEY)
    : headers.set(COUNTRY_HEADER_KEY, country);

async function getUserCountry() {
  const head = await headers();

  return head.get(COUNTRY_HEADER_KEY);
}

export async function getUserCoupon() {
  const country = await getUserCountry();
  if (!country) return;

  const coupon = pppCoupons.find(({ countryCodes }) =>
    countryCodes.includes(country)
  );

  return coupon;
}
