import { Principal, IDL} from 'azle';

/**
 * @typedef {Object} ChatContentPart
 * Represents a single part of content within a message (e.g., text).
 * @property {text} text - The text content.
 */
export const ChatContentPart = IDL.Record({
    text: IDL.Text
});

export interface IChatContentPart {
    text: string;
}

/**
 * @typedef {Object} ChatMessage
 * Represents a single message in the conversation (either user or model).
 * @property {text} role - "user" or "model".
 * @property {Vec<typeof ChatContentPart>} parts - Array of content parts.
 */
export const ChatMessage = IDL.Record({
    role: IDL.Text,
    parts: IDL.Vec(ChatContentPart)
});

export interface IChatMessage {
    role: string;
    parts: IChatContentPart[];
}

/**
 * @typedef {Object} SearchResultItem
 * Type for Google Custom Search API results item.
 * @property {text} title
 * @property {text} link
 * @property {text} snippet
 * @property {Opt<text>} displayLink
 */
export const SearchResultItem = IDL.Record({
    title: IDL.Text,
    link: IDL.Text,
    snippet: IDL.Text,
    displayLink: IDL.Opt(IDL.Text)
});

export interface ISearchResultItem {
    title: string;
    link: string;
    snippet: string;
    displayLink: [string] | [];
}

/**
 * @typedef {Object} AISearchAnswer
 * Type for a complete AI search answer.
 * @property {text} query - The original user query.
 * @property {text} answer - The AI-generated synthesized answer.
 * @property {Vec<typeof SearchResultItem>} sources - The relevant search results used for the answer.
 * @property {text} timestamp - ISO string of when the answer was generated.
 */
export const AISearchAnswer = IDL.Record({
    query: IDL.Text,
    answer: IDL.Text,
    sources: IDL.Vec(SearchResultItem),
    timestamp: IDL.Text
});

export interface IAISearchAnswer {
    query: string;
    answer: string;
    sources: ISearchResultItem[];
    timestamp: string;
}

/**
 * @typedef {Object} SessionData
 * Represents the session data for a single user/principal.
 * @property {Vec<typeof ChatMessage>} conversationHistory - The chat history with the LLM for this session.
 * @property {Vec<typeof AISearchAnswer>} searchAnswerHistory - The history of full AI search answers for this session.
 */
export const SessionData = IDL.Record({
    conversationHistory: IDL.Vec(ChatMessage),
    searchAnswerHistory: IDL.Vec(AISearchAnswer)
});

export interface ISessionData {
    conversationHistory: IChatMessage[];
    searchAnswerHistory: IAISearchAnswer[];
}

// A generic Result type for functions that might succeed or fail.
// This matches Azle's Result structure
export const Result = <T, E>(Ok: IDL.Type<T>, Err: IDL.Type<E>) => 
    IDL.Variant({
        Ok,
        Err
    });

export type Result<T, E> = {
    Ok: T;
} | {
    Err: E;
};

// Helper for creating an 'Ok' result
export function Ok<T>(value: T): Result<T, never> {
    return { Ok: value };
}

// Helper for creating an 'Err' result
export function Err<E>(error: E): Result<never, E> {
    return { Err: error };
}
