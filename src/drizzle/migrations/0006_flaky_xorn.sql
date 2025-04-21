ALTER TABLE "user_course_access" RENAME TO "user_product_access";--> statement-breakpoint
ALTER TABLE "user_product_access" RENAME COLUMN "courseId" TO "productId";--> statement-breakpoint
ALTER TABLE "user_product_access" DROP CONSTRAINT "user_course_access_courseId_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "user_product_access" DROP CONSTRAINT "user_course_access_clerkUserId_courseId_pk";--> statement-breakpoint
ALTER TABLE "user_product_access" ADD CONSTRAINT "user_product_access_clerkUserId_productId_pk" PRIMARY KEY("clerkUserId","productId");--> statement-breakpoint
ALTER TABLE "user_product_access" ADD CONSTRAINT "user_product_access_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;