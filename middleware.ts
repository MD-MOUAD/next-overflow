import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes using createRouteMatcher
const isPublicRoute = createRouteMatcher([
  '/', 
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook', 
  '/question/:id', 
  '/tags', 
  '/tags/:id', 
  '/profile/:id', 
  '/community', 
  '/jobs'
]);

// Define ignored routes
const isIgnoredRoute = createRouteMatcher([
  '/api/webhook', 
  '/api/chatgpt'
]);

// Clerk middleware setup
export default clerkMiddleware((auth, request) => {
  // Skip the route if it's an ignored route
  if (isIgnoredRoute(request)) {
    return;
  }

  // Protect the route if it's not public
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

// Matcher config for applying the middleware to certain routes
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
