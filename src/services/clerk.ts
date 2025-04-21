// import { db } from "@/drizzle/db"
// import { getUserIdTag } from "@/features/users/db/cache"
import { AwaitedReturn } from "@/lib/utils";
import { auth, clerkClient } from "@clerk/nextjs/server";
// import { eq } from "drizzle-orm"
// import { cacheTag } from "next/dist/server/use-cache/cache-tag"
// import { redirect } from "next/navigation"
export const userRoles = ["user", "admin"] as const;
export type UserRole = (typeof userRoles)[number];

export const client = await clerkClient();

export async function getUserRole(user?: AwaitedReturn<typeof auth> | null) {
  if (!user) user = await auth();

  return user.sessionClaims?.role;
}

export function setUserRole(userId: string, role: UserRole) {
  client.users.updateUserMetadata(userId, { publicMetadata: { role } });
}

export async function isAdmin() {
  const userRole = await getUserRole();
  return userRole === "admin";
}

// export async function getCurrentUser({ allData = false } = {}) {
//   const { userId, sessionClaims, redirectToSignIn } = await auth()

//   if (userId != null && sessionClaims.dbId == null) {
//     redirect("/api/clerk/syncUsers")
//   }

//   return {
//     clerkUserId: userId,
//     userId: sessionClaims?.dbId,
//     role: sessionClaims?.role,
//     user:
//       allData && sessionClaims?.dbId != null
//         ? await getUser(sessionClaims.dbId)
//         : undefined,
//     redirectToSignIn,
//   }
// }

// export function syncClerkUserMetadata(user: {
//   id: string
//   clerkUserId: string
//   role: UserRole
// }) {
//   return client.users.updateUserMetadata(user.clerkUserId, {
//     publicMetadata: {
//       dbId: user.id,
//       role: user.role,
//     },
//   })
// }

// async function getUser(id: string) {
//   "use cache"
//   cacheTag(getUserIdTag(id))
//   console.log("Called")

//   return db.query.UserTable.findFirst({
//     where: eq(UserTable.id, id),
//   })
// }
