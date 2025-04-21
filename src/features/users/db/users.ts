// import { db } from "@/drizzle/db";
// import { users } from "@/drizzle/schema";
// import { eq } from "drizzle-orm";
// import { revalidateUserCache } from "./cache";

// export async function insertUser(data: typeof users.$inferInsert) {
//   const [newUser] = await db
//     .insert(users)
//     .values(data)
//     .returning()
//     .onConflictDoUpdate({ target: [users.clerkUserId], set: data });

//   if (!newUser) throw new Error("Failed to create user");
//   revalidateUserCache(newUser.id);

//   return newUser;
// }

// export async function updateUser(
//   clerkUserId: string,
//   data: Partial<typeof users.$inferInsert>
// ) {
//   const [updatedUser] = await db
//     .update(users)
//     .set(data)
//     .where(eq(users.clerkUserId, clerkUserId))
//     .returning({ id: users.id });

//   if (!updatedUser) throw new Error("Failed to update user");
//   revalidateUserCache(updatedUser.id);

//   return updatedUser;
// }

// export async function deleteUser(clerkUserId: string) {
//   const [deletedUser] = await db
//     .update(users)
//     .set({
//       deletedAt: new Date(),
//       email: "redacted@deleted.com",
//       name: "Deleted User",
//       clerkUserId: "deleted",
//       imageUrl: null,
//     })
//     .where(eq(users.clerkUserId, clerkUserId))
//     .returning({ id: users.id });

//   if (!deletedUser) throw new Error("Failed to delete user");
//   revalidateUserCache(deletedUser.id);

//   return deletedUser;
// }
