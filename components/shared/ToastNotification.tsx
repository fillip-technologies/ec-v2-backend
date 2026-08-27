'use client';

import React from 'react';
import {
  ToastContainer,
  toast,
  ToastOptions,
  Slide,
  Id,
} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

interface ToastContentProps {
  title?: string;
  message: string;
}

const CustomToastContent: React.FC<ToastContentProps> = ({ title, message }) => (
  <div className="flex flex-col gap-0.5 min-w-0 pr-2">
    {title && (
      <span className="text-xs font-black text-textPrimary tracking-tight">
        {title}
      </span>
    )}
    <p className="text-xs font-semibold text-textPrimary leading-snug break-words">
      {message}
    </p>
  </div>
);

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  transition: Slide,
};

/**
 * Global Top-Right Toast Notification API with shrinking bottom progress bar.
 */
export const showToast = {
  success: (message: string, title?: string, options?: ToastOptions): Id => {
    return toast.success(
      <CustomToastContent title={title || 'Success'} message={message} />,
      {
        ...defaultOptions,
        ...options,
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
        className:
          '!bg-white !text-textPrimary !rounded-[20px] !border !border-emerald-200 !shadow-xl !p-4 !font-sans !overflow-hidden',
        progressClassName: '!bg-emerald-500 !h-1 !bottom-0 !rounded-b-[20px] !rounded-tr-md',
      }
    );
  },

  error: (message: string, title?: string, options?: ToastOptions): Id => {
    return toast.error(
      <CustomToastContent title={title || 'Error'} message={message} />,
      {
        ...defaultOptions,
        ...options,
        icon: <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />,
        className:
          '!bg-white !text-textPrimary !rounded-[20px] !border !border-rose-200 !shadow-xl !p-4 !font-sans !overflow-hidden',
        progressClassName: '!bg-rose-500 !h-1 !bottom-0 !rounded-b-[20px] !rounded-tr-md',
      }
    );
  },

  warning: (message: string, title?: string, options?: ToastOptions): Id => {
    return toast.warning(
      <CustomToastContent title={title || 'Attention'} message={message} />,
      {
        ...defaultOptions,
        ...options,
        icon: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
        className:
          '!bg-white !text-textPrimary !rounded-[20px] !border !border-amber-200 !shadow-xl !p-4 !font-sans !overflow-hidden',
        progressClassName: '!bg-amber-500 !h-1 !bottom-0 !rounded-b-[20px] !rounded-tr-md',
      }
    );
  },

  info: (message: string, title?: string, options?: ToastOptions): Id => {
    return toast.info(
      <CustomToastContent title={title || 'Information'} message={message} />,
      {
        ...defaultOptions,
        ...options,
        icon: <Info className="h-5 w-5 text-brand shrink-0" />,
        className:
          '!bg-white !text-textPrimary !rounded-[20px] !border !border-brand/20 !shadow-xl !p-4 !font-sans !overflow-hidden',
        progressClassName: '!bg-brand !h-1 !bottom-0 !rounded-b-[20px] !rounded-tr-md',
      }
    );
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      pending: string;
      success: string;
      error: string;
    },
    options?: ToastOptions
  ) => {
    return toast.promise(
      promise,
      {
        pending: {
          render() {
            return <CustomToastContent title="Processing" message={messages.pending} />;
          },
          icon: <Info className="h-5 w-5 text-brand shrink-0 animate-spin" />,
        },
        success: {
          render() {
            return <CustomToastContent title="Completed" message={messages.success} />;
          },
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
        },
        error: {
          render({ data }: any) {
            const errMsg = data?.message || messages.error;
            return <CustomToastContent title="Failed" message={errMsg} />;
          },
          icon: <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />,
        },
      },
      {
        ...defaultOptions,
        ...options,
      }
    );
  },

  dismiss: (toastId?: Id) => {
    toast.dismiss(toastId);
  },

  flash: (type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string) => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('flash_toast', JSON.stringify({ type, message, title }));
      }
    } catch {
      // ignore
    }
  },
};

// Aliases for convenience
export const notify = showToast;

/**
 * Mountable Top-Right Toast Notification Container for Root Layout.
 */
export const ToastNotificationContainer: React.FC = () => {
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const flash = sessionStorage.getItem('flash_toast');
        if (flash) {
          sessionStorage.removeItem('flash_toast');
          const parsed = JSON.parse(flash);
          if (parsed && parsed.message) {
            const type = (parsed.type || 'success') as 'success' | 'error' | 'warning' | 'info';
            setTimeout(() => {
              if (showToast[type]) {
                showToast[type](parsed.message, parsed.title);
              }
            }, 200);
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      transition={Slide}
      className="!z-[99999] !top-5 !right-5 !p-0 !w-[360px] !max-w-[calc(100vw-40px)]"
      toastClassName="!mb-3 !rounded-[20px] !shadow-lg overflow-hidden border border-borderLight"
      closeButton={({ closeToast }) => (
        <button
          type="button"
          onClick={closeToast}
          aria-label="Close notification"
          className="p-1 rounded-full text-textMuted hover:text-textPrimary hover:bg-bgSoft transition-all cursor-pointer self-start -mr-1 -mt-1"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    />
  );
};

export { toast };
export default ToastNotificationContainer;
