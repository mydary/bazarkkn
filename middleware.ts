export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/panitia/:path*", "/verify/:path*", "/superadmin/:path*"],
};
