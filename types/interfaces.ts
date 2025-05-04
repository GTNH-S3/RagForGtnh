import {SchemaType} from "@google/generative-ai";

export interface Section {
    title: string;
    links: { href: string; title: string }[];
}

export const schemaKeyWord = {
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

export const schemaofDecompositon = {
    description: "List of decomposed sentences",
    type: SchemaType.ARRAY,
    items: {
        type: SchemaType.OBJECT,
        properties: {
            subQuery: {
                type: SchemaType.STRING,
                description: "The decomposed sentence",
                nullable: false,
            },
        },
        required: ["subQuery"],
    },

}

export interface WikiPages {
    title: string;
    content: string;
}


// Schema definition for chunking
export const schemaOfChunk = {
    description: "List of chunk sentences",
    type: SchemaType.ARRAY,
    items: {
        type: SchemaType.OBJECT,
        properties: {
            chunk: {
                type: SchemaType.STRING,
                description: "Chunk",
                nullable: false,
            },
        },
        required: ["chunk"]
    }
};

export const schemeSummery = {
    description: "Summery of the all chunk",
    type: SchemaType.OBJECT,
    properties: {
        sum: {
            type: SchemaType.STRING,
            description: "summery of the chunk",
            nullable: true,
        }
    },
    required: ["sum"]
}