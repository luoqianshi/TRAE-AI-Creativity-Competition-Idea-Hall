export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <Icon size={28} className="text-text-secondary" />
        </div>
      )}
      <h3 className="text-base font-medium text-text mb-1">{title}</h3>
      {description && <p className="text-sm text-text-secondary max-w-xs">{description}</p>}
    </div>
  );
}
