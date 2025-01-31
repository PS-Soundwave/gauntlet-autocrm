import "./env";
import { Client } from "langsmith";

const client = new Client();

const skillRuns = ["0194b588-19ac-7745-a607-c548382c26f1"];

const main = async () => {
    await client.addRunsToAnnotationQueue(
        "8eec8d58-15d2-40d0-a3f8-846aa80f4291",
        skillRuns
    );
};

main();
