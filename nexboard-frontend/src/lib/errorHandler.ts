import toast from 'react-hot-toast';
import type { ApiError } from '../types';

export function handleApiError(err: unknown): void {
  const error = (err as { response?: { data?: ApiError } })?.response?.data;
  if (error?.message) {
    toast.error(error.message);
    if (error.details?.length) {
      error.details.forEach((d) => toast.error(d, { duration: 4000 }));
    }
  } else {
    toast.error('An unexpected error occurred');
  }
}
