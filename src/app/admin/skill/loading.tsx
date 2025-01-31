import CreateSkillDialog from "@/components/admin/CreateSkillDialog";
import { TableSkeleton } from "@/components/shared/Loading";

export default function Loading() {
    return (
        <div className="space-y-4">
            <CreateSkillDialog />
            <TableSkeleton rows={5} columns={4} />
        </div>
    );
}
