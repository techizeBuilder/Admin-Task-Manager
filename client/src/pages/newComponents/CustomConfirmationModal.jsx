import React from "react";
import { X, AlertTriangle, Trash2, CheckCircle, Edit, HelpCircle } from "lucide-react";

const CustomConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = "danger", // danger, warning, success, info
    confirmText = "Confirm",
    cancelText = "Cancel",
    showIcon = true,
    children
}) => {
    if (!isOpen) return null;

    const getTypeConfig = () => {
        switch (type) {
            case "danger":
                return {
                    icon: <Trash2 className="w-6 h-6" />,
                    iconBg: "bg-red-100",
                    iconColor: "text-red-600",
                    confirmBg: "bg-red-600 hover:bg-red-700",
                    titleColor: "text-red-900",
                };
            case "warning":
                return {
                    icon: <AlertTriangle className="w-6 h-6" />,
                    iconBg: "bg-yellow-100",
                    iconColor: "text-yellow-600",
                    confirmBg: "bg-yellow-600 hover:bg-yellow-700",
                    titleColor: "text-yellow-900",
                };
            case "success":
                return {
                    icon: <CheckCircle className="w-6 h-6" />,
                    iconBg: "bg-green-100",
                    iconColor: "text-green-600",
                    confirmBg: "bg-green-600 hover:bg-green-700",
                    titleColor: "text-green-900",
                };
            case "edit":
                return {
                    icon: <Edit className="w-6 h-6" />,
                    iconBg: "bg-blue-100",
                    iconColor: "text-blue-600",
                    confirmBg: "bg-blue-600 hover:bg-blue-700",
                    titleColor: "text-blue-900",
                };
            default:
                return {
                    icon: <HelpCircle className="w-6 h-6" />,
                    iconBg: "bg-gray-100",
                    iconColor: "text-gray-600",
                    confirmBg: "bg-gray-600 hover:bg-gray-700",
                    titleColor: "text-gray-900",
                };
        }
    };

    const config = getTypeConfig();

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            ></div>

            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            {showIcon && (
                                <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${config.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                                    <span className={config.iconColor}>
                                        {config.icon}
                                    </span>
                                </div>
                            )}
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className={`text-lg font-medium leading-6 ${config.titleColor}`}>
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {message}
                                    </p>
                                    {children && (
                                        <div className="mt-4">
                                            {children}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="button"
                            onClick={onConfirm}
                            className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm ${config.confirmBg} focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm`}
                        >
                            {confirmText}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomConfirmationModal;