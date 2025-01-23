import { Skill } from "@/api/types";

interface SkillPillProps {
    skill: Skill;
    onRemove?: () => void;
    className?: string;
}

export const SkillPill = ({ skill, onRemove, className }: SkillPillProps) => {
    return (
        <div
            className={`flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-sm ${className}`}
        >
            <span className="text-gray-700">{skill.name}</span>
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="ml-1 text-gray-400 hover:text-gray-600"
                >
                    ×
                </button>
            )}
        </div>
    );
};

interface AddSkillButtonProps {
    skill: Skill;
    onClick: () => void;
    className?: string;
}

export const AddSkillButton = ({
    skill,
    onClick,
    className
}: AddSkillButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50 ${className}`}
        >
            <span className="flex items-center">
                <span className="mr-1 flex-none text-gray-700">+</span>
                <span className="text-left leading-tight text-gray-700">
                    {skill.name}
                </span>
            </span>
        </button>
    );
};
