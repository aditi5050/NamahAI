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
    return auth().redirectToSignIn(); 
  }

});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)"],
};
