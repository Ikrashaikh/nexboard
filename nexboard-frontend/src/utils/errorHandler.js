import toast from 'react-hot-toast';

export function handleApiError(err) {
  if (!err.response) {
    toast.error('Network error — check your connection');
    return;
  }
  if (err.response.status === 401) return; // handled by interceptor silently

  const data = err.response?.data;

  // 403 on a protected endpoint = no permission
  // 403 on /auth/login = bad credentials (Spring Security behaviour)
  if (err.response.status === 403) {
    const path = err.response?.config?.url ?? '';
    if (path.includes('/auth/login')) {
      toast.error('Invalid username or password');
    } else {
      toast.error("You don't have permission to do this");
    }
    return;
  }

  if (data?.message) {
    toast.error(data.message);
    if (Array.isArray(data.details)) {
      data.details.forEach((d) => toast.error(d, { duration: 4000 }));
    }
  } else {
    toast.error('An unexpected error occurred');
  }
}
