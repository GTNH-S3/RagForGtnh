import {SchemaType} from "@google/generative-ai";

export interface Section {
    title: string;
    links: { href: string; title: string }[];
}

export const schema = {
    description: "List of keywords",
    type: SchemaType.ARRAY,
    items: {
        type: SchemaType.OBJECT,
        properties: {
            keyword: {
                type: SchemaType.STRING,
                description: "The keyword of the context",
                nullable: false,
            },
        },
        required: ["keyword"],
    },
};

