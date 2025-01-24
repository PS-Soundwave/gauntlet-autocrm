const TagPill = ({ tag, onRemove }: { tag: string; onRemove?: () => void }) => {
    return (
        <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            {tag}
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded text-gray-400 hover:text-gray-600"
                >
                    ×
                </button>
            )}
        </span>
    );
};

const AddTagButton = ({ onClick }: { onClick: () => void }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1 rounded bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
        >
            + Add
        </button>
    );
};

export { TagPill, AddTagButton };
