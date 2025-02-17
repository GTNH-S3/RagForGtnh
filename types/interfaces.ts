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
