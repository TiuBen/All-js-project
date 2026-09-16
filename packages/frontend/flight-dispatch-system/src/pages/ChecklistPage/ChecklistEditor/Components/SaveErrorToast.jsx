import { AlertCircle, X } from "lucide-react";

/**
 * ============================================================
 * SaveErrorToast —— 保存/提交失败提示（常驻，不自动消失，可手动关闭）
 * ------------------------------------------------------------
 * 用户偏好：通知类提示常驻（非自动消失），由用户自己关闭。
 * 独立组件：失败文案变化时只重渲染这一小块，不牵动编辑页其他部分。
 *
 * @param {Object}   props
 * @param {string}   props.message 失败文案；为空则不渲染
 * @param {Function} props.onClose 关闭回调
 * ============================================================
 */
export default function SaveErrorToast({ message, onClose }) {
    if (!message) return null;

    return (
        <div className="fixed left-1/2 top-0 z-[70] w-[440px] max-w-[92vw] -translate-x-1/2">
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50/95 p-2.5 shadow-lg backdrop-blur">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
                <div className="flex-1 text-sm text-red-700">{message}</div>
                <button
                    className="rounded p-1 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600"
                    title="关闭提示"
                    onClick={onClose}
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}
