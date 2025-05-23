import { createElement } from 'react';
import toast from 'react-hot-toast';

const toastStyles = {
  style: {
    background: '#1A1D23',
    color: 'white',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  duration: 3000,
};

const SuccessToast = ({ message }) => (
  <div className="flex items-center">
    <svg className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
    <span className="text-green-400 font-medium">{message}</span>
  </div>
);

const ErrorToast = ({ message }) => (
  <div className="flex items-center">
    <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
    <span className="text-red-400 font-medium">{message}</span>
  </div>
);

export const showToast = {
  success: (message) => {
    toast.success(createElement(SuccessToast, { message }), toastStyles);
  },
  error: (message) => {
    toast.error(createElement(ErrorToast, { message }), toastStyles);
  },
}; 