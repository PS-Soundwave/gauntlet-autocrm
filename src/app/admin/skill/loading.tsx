import CreateSkillDialog from "@/components/admin/CreateSkillDialog";
import { TableSkeleton } from "@/components/shared/Loading";

export default function Loading() {
    return (
        <>
            <h1 className="mb-4 text-2xl font-bold">Skills Management</h1>
            <div className="space-y-4">
                <CreateSkillDialog />
                <TableSkeleton rows={5} columns={2} />
            </div>
        </>
    );
}
