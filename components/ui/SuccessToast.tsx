"use client";

import { toast } from "sonner";

type ToastOpts = {
  description?: string;
  duration?: number;
};

export function successToast(message: string, opts: ToastOpts = {}) {
  return toast.success(message, { duration: 4000, ...opts });
}

export function errorToast(message: string, opts: ToastOpts = {}) {
  return toast.error(message, { duration: 6000, ...opts });
}

export function infoToast(message: string, opts: ToastOpts = {}) {
  return toast(message, { duration: 4000, ...opts });
}
