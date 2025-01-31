import { JsonOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { db } from "@/db";

interface SmartAssignInput {
    ticketTitle: string;
    ticketContent: string;
}

interface SmartAssignResult {
    skillIds: string[];
    queueId: string | null;
}

// Create output schemas for type inference
type SkillOutput = {
    analysis: string;
    skill_ids: string[];
};

type QueueOutput = {
    analysis: string;
    queue_id: string | null;
};

// Create chat model with response format
export const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0
}).bind({
    response_format: { type: "json_object" }
});

// Create combined prompts that include both reasoning and decision
export const skillPrompt = PromptTemplate.fromTemplate(`
Given a support ticket, analyze the requirements and determine which skills are most relevant.
Think step by step about what the ticket requires and how it maps to the available skills.
Only return skill IDs that are highly relevant to the ticket content.
If no skills are clearly relevant, return an empty array.

Ticket Title: {title}
Ticket Content: {content}

Available Skills:
{skills}

Return a JSON object with the following schema:
{{
    "analysis": string,  // Your step-by-step reasoning about why these skills are relevant
    "skill_ids": string[]  // Array of skill IDs that are relevant to the ticket
}}
`);

export const queuePrompt = PromptTemplate.fromTemplate(`
Given a support ticket, analyze the requirements and determine which queue is most appropriate.
Think step by step about what the ticket requires and how it maps to the available queues.
Only return a queue ID if there is a clear match for the ticket content.
If no queue is clearly relevant, return null.

Ticket Title: {title}
Ticket Content: {content}

Available Queues:
{queues}

Return a JSON object with the following schema:
{{
    "analysis": string,  // Your step-by-step reasoning about why this queue is appropriate
    "queue_id": string | null  // ID of the most appropriate queue, or null if no clear match
}}
`);

// Create output parsers
const skillOutputParser = new JsonOutputParser<SkillOutput>();
const queueOutputParser = new JsonOutputParser<QueueOutput>();

// Create combined chains
const skillChain = RunnableSequence.from([
    {
        title: (input: SmartAssignInput) => input.ticketTitle,
        content: (input: SmartAssignInput) => input.ticketContent,
        skills: async () => {
            const skills = await db
                .selectFrom("skills")
                .where("smart_assign", "=", true)
                .select(["id", "name", "description"])
                .execute();

            return skills
                .map(
                    (skill) =>
                        `ID: ${skill.id}\nName: ${skill.name}\nDescription: ${skill.description || "No description"}\n`
                )
                .join("\n");
        }
    },
    skillPrompt,
    model,
    skillOutputParser
]);

const queueChain = RunnableSequence.from([
    {
        title: (input: SmartAssignInput) => input.ticketTitle,
        content: (input: SmartAssignInput) => input.ticketContent,
        queues: async () => {
            const queues = await db
                .selectFrom("queues")
                .where("smart_assign", "=", true)
                .select(["id", "name", "description"])
                .execute();

            return queues
                .map(
                    (queue) =>
                        `ID: ${queue.id}\nName: ${queue.name}\nDescription: ${queue.description || "No description"}\n`
                )
                .join("\n");
        }
    },
    queuePrompt,
    model,
    queueOutputParser
]);

export const smartAssign = async (
    input: SmartAssignInput
): Promise<SmartAssignResult> => {
    try {
        // Run both chains in parallel
        const [skillResult, queueResult] = await Promise.all([
            skillChain.invoke(input),
            queueChain.invoke(input)
        ]);

        return {
            skillIds: skillResult.skill_ids,
            queueId: queueResult.queue_id
        };
    } catch (error) {
        console.error("Smart assignment error:", error);
        return {
            skillIds: [],
            queueId: null
        };
    }
};
