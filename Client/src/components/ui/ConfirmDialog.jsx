import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Info, X } from "lucide-react";

/**
 * ConfirmDialog — drop-in replacement for window.confirm()
 *
 * Props:
 *  open        {boolean}   Whether the dialog is visible
 *  title       {string}    Dialog heading
 *  message     {string}    Body text / description
 *  confirmText {string}    Label for the confirm button  (default: "Confirm")
 *  cancelText  {string}    Label for the cancel button   (default: "Cancel")
 *  variant     {string}    "danger" | "warning" | "info"  (default: "danger")
 *  onConfirm   {function}  Called when user clicks the confirm button
 *  onCancel    {function}  Called when user dismisses the dialog
 */
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onCancel?.(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const iconMap = {
    danger:  { icon: <AlertTriangle className="w-6 h-6" />, bg: "bg-red-100",    text: "text-red-600",    btn: "bg-red-600 hover:bg-red-700 shadow-red-500/30" },
    warning: { icon: <AlertTriangle className="w-6 h-6" />, bg: "bg-amber-100",  text: "text-amber-600",  btn: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30" },
    info:    { icon: <Info          className="w-6 h-6" />, bg: "bg-blue-100",   text: "text-blue-600",   btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30" },
  };

  const style = iconMap[variant] ?? iconMap.danger;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog */}
          <motion.div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-desc"
          >
            {/* Close X */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6">
              {/* Icon */}
              <div className={`w-12 h-12 ${style.bg} ${style.text} rounded-2xl flex items-center justify-center mb-4`}>
                {style.icon}
              </div>

              {/* Title */}
              <h2
                id="confirm-dialog-title"
                className="text-lg font-bold text-slate-900 mb-2"
              >
                {title}
              </h2>

              {/* Message */}
              <p
                id="confirm-dialog-desc"
                className="text-sm text-slate-500 leading-relaxed mb-6"
              >
                {message}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={onCancel}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg ${style.btn} transition-all duration-200`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
