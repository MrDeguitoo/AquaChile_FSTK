export default function LoadingSpinner({ message = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-gray-600">{message}</p>
    </div>
  );
}