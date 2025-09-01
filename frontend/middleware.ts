import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)", // exclude static files
    "/",                          // root
    "/(docs|practice|session)(.*)", // match routes to protect in future
    "/api/(.*)"                   // protect future API routes
  ],
};
