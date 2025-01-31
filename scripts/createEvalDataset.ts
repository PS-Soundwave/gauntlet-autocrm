import "./env";
import { Client } from "langsmith";
import { v4 as uuidv4 } from "uuid";

// Initialize LangSmith client
const client = new Client();

// Define our skills dataset
const skills = [
    {
        id: uuidv4(),
        name: "Technical Support",
        description:
            "General technical troubleshooting and platform functionality issues",
        smart_assign: true
    },
    {
        id: uuidv4(),
        name: "Billing",
        description:
            "Payment processing, subscription management, and invoice inquiries",
        smart_assign: true
    },
    {
        id: uuidv4(),
        name: "Account Management",
        description:
            "User access, authentication, and account configuration support",
        smart_assign: true
    },
    {
        id: uuidv4(),
        name: "Integration",
        description: "API, third-party integrations, and data sync support",
        smart_assign: true
    },
    {
        id: uuidv4(),
        name: "Security",
        description:
            "Security concerns, compliance issues, and data protection",
        smart_assign: true
    }
];

// Define our queues dataset
const queues = [
    {
        id: uuidv4(),
        name: "General Support",
        description:
            "First-line support for basic inquiries and troubleshooting",
        smart_assign: true
    },
    {
        id: uuidv4(),
        name: "Technical Escalation",
        description:
            "Complex technical issues requiring senior engineer attention",
        smart_assign: true
    },
    {
        id: uuidv4(),
        name: "Billing Support",
        description: "Dedicated team for financial and subscription matters",
        smart_assign: true
    },
    {
        id: uuidv4(),
        name: "Enterprise Support",
        description: "Priority support for enterprise-level customers",
        smart_assign: true
    },
    {
        id: uuidv4(),
        name: "Security & Compliance",
        description:
            "Specialized team for security incidents and compliance matters",
        smart_assign: true
    }
];

// Define our test tickets
const tickets = [
    {
        title: "Cannot log into account after password reset",
        content:
            "Reset my password following the email instructions but getting 'Invalid Credentials' error when trying to log in.",
        expected_skills: ["Account Management", "Technical Support"],
        expected_queue: "General Support"
    },
    {
        title: "Double-charged for monthly subscription",
        content:
            "Our account was charged twice for the May subscription. Need immediate refund for the duplicate charge.",
        expected_skills: ["Billing"],
        expected_queue: "Billing Support"
    },
    {
        title: "API authentication failing intermittently",
        content:
            "Our integration is experiencing random authentication failures. Need urgent assistance as this is affecting our production environment.",
        expected_skills: ["Integration", "Technical Support"],
        expected_queue: "Technical Escalation"
    },
    {
        title: "Suspicious login attempts detected",
        content:
            "Multiple failed login attempts from unknown IP addresses. Need to review security logs and implement additional protection.",
        expected_skills: ["Security", "Account Management"],
        expected_queue: "Security & Compliance"
    },
    {
        title: "Bulk user import failing",
        content:
            "Unable to import 500 new users via the admin portal. The process stops at 50% with a timeout error.",
        expected_skills: ["Account Management", "Technical Support"],
        expected_queue: "Enterprise Support"
    },
    {
        title: "Integration webhook configuration help",
        content:
            "Need assistance setting up webhooks for real-time data synchronization with our internal systems.",
        expected_skills: ["Integration"],
        expected_queue: "Technical Escalation"
    },
    {
        title: "Update billing contact information",
        content:
            "Need to change the billing contact and email address for invoice delivery after company restructuring.",
        expected_skills: ["Billing", "Account Management"],
        expected_queue: "Billing Support"
    },
    {
        title: "SSO configuration not working",
        content:
            "Unable to configure SAML SSO with our identity provider. Getting 'Invalid assertion' errors.",
        expected_skills: ["Security", "Integration"],
        expected_queue: "Enterprise Support"
    },
    {
        title: "Platform extremely slow during peak hours",
        content:
            "System response time is over 10 seconds during our busiest period. This is affecting our customer service operations.",
        expected_skills: ["Technical Support"],
        expected_queue: "Technical Escalation"
    },
    {
        title: "Data export compliance verification",
        content:
            "Need to verify our data export process complies with GDPR requirements before proceeding with bulk export.",
        expected_skills: ["Security", "Technical Support"],
        expected_queue: "Security & Compliance"
    },
    {
        title: "API rate limit increase request",
        content:
            "Requesting temporary rate limit increase for upcoming data migration project.",
        expected_skills: ["Integration"],
        expected_queue: "Enterprise Support"
    },
    {
        title: "Account merger assistance",
        content:
            "Need help merging two business accounts following company acquisition.",
        expected_skills: ["Account Management", "Billing"],
        expected_queue: "Enterprise Support"
    },
    {
        title: "Payment processing error",
        content:
            "Getting 'Transaction Failed' error when trying to process payment for subscription upgrade.",
        expected_skills: ["Billing", "Technical Support"],
        expected_queue: "Billing Support"
    },
    {
        title: "Security audit assistance",
        content:
            "Need comprehensive security logs and access history for the past 30 days for external audit.",
        expected_skills: ["Security"],
        expected_queue: "Security & Compliance"
    },
    {
        title: "API documentation discrepancy",
        content:
            "Found inconsistencies between API documentation and actual endpoint behavior for user management calls.",
        expected_skills: ["Integration", "Technical Support"],
        expected_queue: "Technical Escalation"
    },
    {
        title: "Bulk email notifications not sending",
        content:
            "Scheduled customer notifications are not being sent. Error logs show SMTP configuration issues.",
        expected_skills: ["Technical Support"],
        expected_queue: "General Support"
    },
    {
        title: "Emergency access request",
        content:
            "Need urgent access restoration for admin user. Current admin is on leave and we have a critical system update.",
        expected_skills: ["Account Management", "Security"],
        expected_queue: "Security & Compliance"
    },
    {
        title: "Integration timeout issues",
        content:
            "Third-party integration keeps timing out during large data syncs. Need optimization guidance.",
        expected_skills: ["Integration", "Technical Support"],
        expected_queue: "Technical Escalation"
    },
    {
        title: "Update payment method",
        content:
            "Need to update corporate credit card details before next billing cycle.",
        expected_skills: ["Billing"],
        expected_queue: "Billing Support"
    },
    {
        title: "User permission sync failure",
        content:
            "Group permission changes are not propagating to all user accounts in the organization.",
        expected_skills: ["Account Management", "Technical Support"],
        expected_queue: "Enterprise Support"
    }
];

const createDataset = async () => {
    try {
        // Create a new dataset
        const skillsDataset = await client.createDataset(
            "autocrm_smart_assign_skills_eval",
            {
                description: "Evaluation dataset for AutoCRM smart assignment"
            }
        );

        const queuesDataset = await client.createDataset(
            "autocrm_smart_assign_queues_eval",
            {
                description: "Evaluation dataset for AutoCRM smart assignment"
            }
        );

        // Format skills and queues as they would appear in the database
        const skillsStr = skills
            .filter((s) => s.smart_assign)
            .map(
                (s) =>
                    `ID: ${s.id}\nName: ${s.name}\nDescription: ${s.description}\n`
            )
            .join("\n");

        const queuesStr = queues
            .filter((q) => q.smart_assign)
            .map(
                (q) =>
                    `ID: ${q.id}\nName: ${q.name}\nDescription: ${q.description}\n`
            )
            .join("\n");

        const promises = [];

        // Create test cases
        for (const ticket of tickets) {
            // Create input for skills chain
            promises.push(
                client.createExample(
                    {
                        title: ticket.title,
                        content: ticket.content,
                        skills: skillsStr
                    },
                    {
                        skill_ids: ticket.expected_skills
                            .map(
                                (name) =>
                                    skills.find((s) => s.name === name)?.id
                            )
                            .filter(Boolean)
                    },
                    {
                        datasetId: skillsDataset.id
                    }
                )
            );

            // Create input for queue chain
            promises.push(
                client.createExample(
                    {
                        title: ticket.title,
                        content: ticket.content,
                        queues: queuesStr
                    },
                    {
                        queue_id: queues.find(
                            (q) => q.name === ticket.expected_queue
                        )?.id
                    },
                    {
                        datasetId: queuesDataset.id
                    }
                )
            );
        }

        await Promise.all(promises);

        const skillsQueue = await client.createAnnotationQueue({
            name: "skills_assignment_eval"
        });
        const queuesQueue = await client.createAnnotationQueue({
            name: "queues_assignment_eval"
        });

        console.log("Dataset created successfully!");
        console.log("Skills Dataset ID:", skillsDataset.id);
        console.log("Queues Dataset ID:", queuesDataset.id);
        console.log("Skills Queue ID:", skillsQueue.id);
        console.log("Queues Queue ID:", queuesQueue.id);
    } catch (error) {
        console.error("Error creating dataset:", error);
    }
};

createDataset();
