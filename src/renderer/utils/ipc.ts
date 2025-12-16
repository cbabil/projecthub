import type { OperationResult } from '@shared/types';

type ToastFn = (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;

interface SafeCallOptions {
  /** Toast function for showing notifications */
  toast?: ToastFn;
  /** Custom error message prefix */
  errorPrefix?: string;
  /** Whether to show toast on error (default: true) */
  showError?: boolean;
  /** Whether to show toast on success */
  showSuccess?: boolean;
  /** Success message */
  successMessage?: string;
}

/**
 * Safely execute an IPC call with error handling.
 * Returns the result data on success, undefined on failure.
 */
export async function safeIpc<T>(
  call: () => Promise<OperationResult<T>>,
  options: SafeCallOptions = {}
): Promise<T | undefined> {
  const { toast, errorPrefix = 'Operation failed', showError = true, showSuccess = false, successMessage } = options;

  try {
    const res = await call();
    if (!res.ok) {
      if (showError && toast) {
        toast(`${errorPrefix}: ${res.error ?? 'Unknown error'}`, 'error');
      }
      return undefined;
    }
    if (showSuccess && toast && successMessage) {
      toast(successMessage, 'success');
    }
    return res.data;
  } catch (error) {
    if (showError && toast) {
      toast(`${errorPrefix}: ${(error as Error).message}`, 'error');
    }
    return undefined;
  }
}

/**
 * Safely execute an IPC call, returning the full result object.
 * Use when you need access to both success and error states.
 */
export async function safeIpcResult<T>(
  call: () => Promise<OperationResult<T>>,
  options: Pick<SafeCallOptions, 'toast' | 'errorPrefix'> = {}
): Promise<OperationResult<T>> {
  const { toast, errorPrefix = 'Operation failed' } = options;

  try {
    const res = await call();
    if (!res.ok && toast) {
      toast(`${errorPrefix}: ${res.error ?? 'Unknown error'}`, 'error');
    }
    return res;
  } catch (error) {
    const message = (error as Error).message;
    if (toast) {
      toast(`${errorPrefix}: ${message}`, 'error');
    }
    return { ok: false, error: message };
  }
}

/**
 * Safely execute a void IPC call (no return data expected).
 * Returns true on success, false on failure.
 */
export async function safeIpcVoid(
  call: () => Promise<OperationResult<null | undefined>>,
  options: SafeCallOptions = {}
): Promise<boolean> {
  const { toast, errorPrefix = 'Operation failed', showError = true, showSuccess = false, successMessage } = options;

  try {
    const res = await call();
    if (!res.ok) {
      if (showError && toast) {
        toast(`${errorPrefix}: ${res.error ?? 'Unknown error'}`, 'error');
      }
      return false;
    }
    if (showSuccess && toast && successMessage) {
      toast(successMessage, 'success');
    }
    return true;
  } catch (error) {
    if (showError && toast) {
      toast(`${errorPrefix}: ${(error as Error).message}`, 'error');
    }
    return false;
  }
}
