export function getRoleBasedRedirect(role) {
  if (role === "ROLE_EMPLOYEE") return "/my";
  return "/dashboard";
}
