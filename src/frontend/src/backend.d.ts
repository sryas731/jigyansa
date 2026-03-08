import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ChatMessage {
    text: string;
    messageType: Variant_user_jigyansa;
    timestamp: Time;
}
export type Time = bigint;
export interface Conversation {
    messages: Array<ChatMessage>;
    timestamp: Time;
}
export enum Variant_user_jigyansa {
    user = "user",
    jigyansa = "jigyansa"
}
export interface backendInterface {
    backfillExistingUsers(users: Array<[Principal, string]>): Promise<void>;
    clearConversationHistory(arg0: null): Promise<void>;
    getAllUserMessagesQuery(id: Principal): Promise<Array<ChatMessage>>;
    getConversationHistory(arg0: null): Promise<Array<Conversation>>;
    getMessageExamples(arg0: null): Promise<Array<[string, string]>>;
    getUserName(arg0: null): Promise<string | null>;
    isFirstTimeUser(arg0: null): Promise<boolean>;
    isNameSet(arg0: null): Promise<boolean>;
    onboardingComplete(arg0: null): Promise<void>;
    rollbackPromptHistory(arg0: null): Promise<void>;
    sendMessage(message: string): Promise<ChatMessage>;
    setUserName(name: string): Promise<void>;
}
