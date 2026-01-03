/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastAction {
    label: string;
    onClick: () => void;
}

interface ToastOptions {
    duration?: number;
    action?: ToastAction;
    onClose?: () => void;
    playSound?: boolean;
}

interface ToastQueueItem {
    id: string;
    type: ToastType;
    message: string;
    options: ToastOptions;
}

// Notification sound using Web Audio API
const playNotificationSound = () => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    } catch (error) {
        console.warn('Could not play notification sound:', error);
    }
};

// Global toast queue and state
let toastQueue: ToastQueueItem[] = [];
let toastSubscribers: Array<(queue: ToastQueueItem[]) => void> = [];
let toastIdCounter = 0;

const notifyToastChange = () => {
    toastSubscribers.forEach(callback => callback([...toastQueue]));
};

const addToastToQueue = (type: ToastType, message: string, options: ToastOptions = {}): string => {
    const id = `toast-${++toastIdCounter}`;
    const { duration = 4000, playSound = false } = options;

    if (playSound) {
        playNotificationSound();
    }

    toastQueue.push({ id, type, message, options });
    notifyToastChange();

    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(() => {
            removeToastFromQueue(id);
        }, duration);
    }

    return id;
};

const removeToastFromQueue = (id: string) => {
    toastQueue = toastQueue.filter(item => item.id !== id);
    notifyToastChange();
};

export const useToastManager = () => {
    const [toasts, setToasts] = React.useState<ToastQueueItem[]>(toastQueue);

    React.useEffect(() => {
        const subscriber = (queue: ToastQueueItem[]) => setToasts(queue);
        toastSubscribers.push(subscriber);

        return () => {
            toastSubscribers = toastSubscribers.filter(cb => cb !== subscriber);
        };
    }, []);

    return { toasts, removeToast: removeToastFromQueue };
};

const showToast = (type: ToastType, message: string, options: ToastOptions = {}): string => {
    return addToastToQueue(type, message, options);
};

const showSuccessToast = (message: string, options?: ToastOptions) => {
    return showToast('success', message, { duration: 4000, ...options });
};

const showErrorToast = (message: string, options?: ToastOptions) => {
    return showToast('error', message, { duration: 5000, ...options });
};

const showWarningToast = (message: string, options?: ToastOptions) => {
    return showToast('warning', message, { duration: 4500, ...options });
};

const showInfoToast = (message: string, options?: ToastOptions) => {
    return showToast('info', message, { duration: 4000, ...options });
};

const showNotificationToast = (message: string, options?: ToastOptions) => {
    return showToast('info', message, { playSound: true, duration: 4000, ...options });
};

const showPromiseToast = <T>(
    promise: Promise<T>,
    messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
    },
    options?: {
        successOptions?: ToastOptions;
        errorOptions?: ToastOptions;
    }
) => {
    const { successOptions, errorOptions } = options || {};
    const loadingId = showToast('info', messages.loading, { duration: 0 });

    return promise
        .then((data) => {
            removeToastFromQueue(loadingId);
            const successMessage = typeof messages.success === 'function' ? messages.success(data) : messages.success;
            showToast('success', successMessage, successOptions);
            return data;
        })
        .catch((error) => {
            removeToastFromQueue(loadingId);
            const errorMessage = typeof messages.error === 'function' ? messages.error(error) : messages.error;
            showToast('error', errorMessage, errorOptions);
            throw error;
        });
};

const dismissToast = (toastId: string) => {
    removeToastFromQueue(toastId);
};

const dismissAllToasts = () => {
    toastQueue = [];
    notifyToastChange();
};

// Toast container component to render all toasts
export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToastManager();

    return React.createElement(
        React.Fragment,
        null,
        toasts.map((toast) =>
            React.createElement(
                Snackbar,
                {
                    key: toast.id,
                    open: true,
                    autoHideDuration: toast.options.duration || 4000,
                    onClose: () => removeToast(toast.id),
                    anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
                },
                React.createElement(
                    Alert,
                    {
                        onClose: () => removeToast(toast.id),
                        severity: toast.type as any,
                        sx: { width: '100%' },
                        action: toast.options.action
                            ? React.createElement(
                                Button,
                                {
                                    color: 'inherit',
                                    size: 'small',
                                    onClick: () => {
                                        toast.options.action?.onClick();
                                        removeToast(toast.id);
                                    },
                                },
                                toast.options.action.label
                            )
                            : undefined,
                    },
                    toast.message
                )
            )
        )
    );
};

export {
    showToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    showNotificationToast,
    showPromiseToast,
    dismissToast,
    dismissAllToasts,
    type ToastType,
    type ToastAction,
    type ToastOptions,
};
