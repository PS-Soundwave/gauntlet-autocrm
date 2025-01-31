import "./env";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { Client } from "langsmith";
import { uuidv7 } from "uuidv7";
import { env } from "@/env";
import { model, queuePrompt, skillPrompt } from "@/services/smartAssign";

// Initialize LangSmith client
const client = new Client();

// Create output parsers for the combined outputs
type SkillOutput = {
    analysis: string;
    skill_ids: string[];
};

type QueueOutput = {
    analysis: string;
    queue_id: string | null;
};

const skillOutputParser = new JsonOutputParser<SkillOutput>();
const queueOutputParser = new JsonOutputParser<QueueOutput>();

// Create combined chains
const skillChain = RunnableSequence.from([
    skillPrompt,
    model,
    skillOutputParser
]);
const queueChain = RunnableSequence.from([
    queuePrompt,
    model,
    queueOutputParser
]);

const skillsQueueId = "1d30c7db-515b-441b-8cf7-b574a46f05cb";
const queuesQueueId = "c52d95b2-3103-497e-83c7-9d76ac4e5dcc";

const queuesDatasetId = "1160beaf-6716-4c4b-aa4d-04a103452034";
const skillsDatasetId = "6ae0e2c6-153d-4ef4-b6b4-c458e1b30107";

const evaluateChains = async () => {
    try {
        // Get the dataset
        const datasets = [];
        for await (const dataset of client.listDatasets()) {
            datasets.push(dataset);
        }

        const skillsDataset = datasets.find((d) => d.id === skillsDatasetId);
        const queuesDataset = datasets.find((d) => d.id === queuesDatasetId);

        if (!skillsDataset || !queuesDataset) {
            throw new Error(
                "Dataset not found. Run createEvalDataset.ts first."
            );
        }

        // Create evaluation runs for skills
        const skillExamples = await client.listExamples({
            datasetId: skillsDataset.id
        });

        const skillRuns = [];

        for await (const example of skillExamples) {
            if (!example.outputs?.skill_ids) {
                continue;
            }

            const runId = uuidv7();
            await skillChain.invoke(
                {
                    title: example.inputs.title,
                    content: example.inputs.content,
                    skills: example.inputs.skills
                },
                {
                    runId,
                    metadata: {
                        expected_output: example.outputs.skill_ids
                    }
                }
            );

            skillRuns.push(runId);
        }

        while (true) {
            const result = await fetch(
                `https://api.smith.langchain.com/api/v1/annotation-queues/${skillsQueueId}/runs`,
                {
                    method: "POST",
                    body: JSON.stringify(skillRuns),
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-Key": env.LANGCHAIN_API_KEY
                    }
                }
            );

            if (result.status === 200) {
                break;
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Create evaluation runs for queues
        const queueExamples = await client.listExamples({
            datasetId: queuesDataset.id
        });

        const queueRuns = [];

        for await (const example of queueExamples) {
            if (!example.outputs?.queue_id) {
                continue;
            }

            const runId = uuidv7();
            await queueChain.invoke(
                {
                    title: example.inputs.title,
                    content: example.inputs.content,
                    queues: example.inputs.queues
                },
                {
                    runId,
                    metadata: {
                        expected_output: example.outputs.queue_id
                    }
                }
            );

            queueRuns.push(runId);
        }

        while (true) {
            const result = await fetch(
                `https://api.smith.langchain.com/api/v1/annotation-queues/${queuesQueueId}/runs`,
                {
                    method: "POST",
                    body: JSON.stringify(queueRuns),
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-Key": env.LANGCHAIN_API_KEY
                    }
                }
            );

            if (result.status === 200) {
                break;
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        console.log("Evaluation completed!");
        console.log(
            "View results and provide feedback at: https://smith.langchain.com/"
        );
    } catch (error) {
        console.error("Error running evaluation:", error);
    }
};

evaluateChains();
