// 二次确认弹窗
export function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed z-[99] right-0 left-0 top-0 bottom-0 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white p-4 rounded-md shadow-lg text-center">
        <p className="text-black mb-5 text-[16px]">{message}</p>
        <button className="bg-red-500 text-white px-4 py-2 mr-2 rounded hover:bg-red-600" onClick={onConfirm}>
          Confirm
        </button>
        <button className="bg-gray-400 text-black px-4 py-2 rounded hover:bg-gray-500" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
