export const TableRowSkeleton = ({ columns }: { columns: number }) => {
    return (
        <tr className="animate-pulse">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="whitespace-nowrap px-6 py-4">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                </td>
            ))}
        </tr>
    );
};

export const TableSkeleton = ({
    rows,
    columns
}: {
    rows: number;
    columns: number;
}) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {Array.from({ length: columns }).map((_, i) => (
                            <th
                                key={i}
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                                <div className="h-4 w-20 rounded bg-gray-200" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {Array.from({ length: rows }).map((_, i) => (
                        <TableRowSkeleton key={i} columns={columns} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};
