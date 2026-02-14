import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/signin(.*)",
  "/signup(.*)",
  "/sso-callback(.*)",
  "/assets(.*)",
  "/api/upload(.*)",
]);

export default clerkMiddleware((auth, req) => {

  if (!isPublicRoute(req)) {
    auth().protect();   
  }

});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)"],
};
