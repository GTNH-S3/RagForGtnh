import { EventEmitter } from "events";
import { request, type RequestOptions } from "https";
import { IncomingMessage } from "http";
import {Question} from "../main/main.ts";
import {sleep} from "../utils/sleep.ts";

interface OperationResult {
    number1: number;
    number2: number;
    operator: string;
    result: number;
}

interface ChatUpdate {
    type: string;
    message: string;
    account?: string;
}

// Messaging service
class MessageService {
    private readonly hostname: string = "gtnh.umceko.com";

    async sendMessage(message: string): Promise<void> {
        const postData = JSON.stringify({ message });

        const options: RequestOptions = {
            hostname: this.hostname,
            path: "/map/up/sendmessage",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(postData)
            }
        };

        return new Promise((resolve, reject) => {
            const req = request(options, (res: IncomingMessage) => {
                console.log(`statusCode: ${res.statusCode}`);
                res.on("data", (d: Buffer) => process.stdout.write(d));
                res.on("end", () => resolve());
            });

            req.on("error", (error: Error) => {
                console.error("Error sending message:", error);
                reject(error);
            });

            req.write(postData);
            req.end();
        });
    }

    async fetchUpdates(currentTime: number): Promise<{ updates: ChatUpdate[], newTime: number }> {
        try {
            const response = await fetch(`https://${this.hostname}/map/up/world/world/${currentTime}`).then(res => res.json());
            return {
                updates: response.updates || [],
                newTime: Date.now()
            };
        } catch (error) {
            console.error("Error fetching updates:", error);
            return { updates: [], newTime: currentTime };
        }
    }
}

// Event handler
class ChatEventHandler {
    private eventEmitter: EventEmitter;
    private messageService: MessageService;
    private currentTime: number = Date.now();
    private readonly random_operators: string[] = ['+', '-'];
    private sentences: string[];
    private main_sentences: string[];
    private sentence_time: number = Date.now();

    constructor() {
        this.eventEmitter = new EventEmitter();
        this.messageService = new MessageService();
        this.sentences = this.initializeSentences();
        this.main_sentences = [...this.sentences];

        // Register event handlers
        this.registerEventHandlers();
    }

    private initializeSentences(): string[] {
        return [
            "Hello! How can I assist you today?",
            "Did you know? The Eiffel Tower can be 15 cm taller during the summer!",
            "What is your favorite programming language?",
            "Have you ever tried to solve a Rubik's Cube?",
            "If you could travel anywhere in the world, where would you go?"
            // Add more sentences as needed
        ];
    }

    private registerEventHandlers(): void {
        this.eventEmitter.on("askQuestion", this.onAskQuestion.bind(this));
        this.eventEmitter.on("waitForAnswer", this.onWaitForAnswer.bind(this));
        this.eventEmitter.on("waitForAiResponse", this.onWaitForAiResponse.bind(this));
        this.eventEmitter.on("answerResult", this.onAnswerResult.bind(this));
        this.eventEmitter.on("RandomSentence", this.onRandomSentence.bind(this));
    }

    private randomOperation(): OperationResult {
        const number1 = Math.floor(Math.random() * 100);
        const number2 = Math.floor(Math.random() * 100);
        const operator = this.random_operators[Math.floor(Math.random() * this.random_operators.length)];
        const result = eval(`${number1} ${operator} ${number2}`);
        return { number1, operator, number2, result };
    }

    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Event handlers
    private async onAskQuestion(): Promise<void> {
        const { number1, operator, number2, result } = this.randomOperation();
        const message = `What is ${number1} ${operator} ${number2}?`;
        console.log(message);
        await this.messageService.sendMessage(message);

        // Emit the next event to wait for the answer
        this.eventEmitter.emit("waitForAnswer", result);
    }

    private async onWaitForAnswer(result: number): Promise<void> {
        let timeout = 60000 * 25;
        const startTime = Date.now();

        const interval = setInterval(async () => {
            const { updates, newTime } = await this.messageService.fetchUpdates(this.currentTime);
            this.currentTime = newTime;

            for (const update of updates) {
                if (update.type === "chat") {
                    console.log("Chat message received:", update.message);

                    if (update.message == result.toString()) {
                        clearInterval(interval);
                        this.eventEmitter.emit("answerResult", true, update.account, result);
                        return;
                    }
                }
            }

            if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                this.eventEmitter.emit("answerResult", false, null, result);
            }
        }, 2000);
    }

    private async onWaitForAiResponse(): Promise<void> {
        const interval = setInterval(async () => {
            const { updates, newTime } = await this.messageService.fetchUpdates(this.currentTime);
            this.currentTime = newTime;

            for (const update of updates) {
                if (update.type === "chat" && update.message.startsWith("ai!")) {
                    console.log("AI message received:", update.message);
                    await sleep(2500);
                    await this.messageService.sendMessage("AI response received, processing...");
                    const aiPrompt = update.message.slice(3).trim();
                    const aiResponse = await Question(aiPrompt);

                    clearInterval(interval);
                    await sleep(4000);
                    await this.messageService.sendMessage(aiResponse);
                    this.eventEmitter.emit("waitForAiResponse");
                }
            }
        }, 2000);
    }

    private async onAnswerResult(isCorrect: boolean, account: string | null, result: number): Promise<void> {
        if (isCorrect) {
            console.log(`${account} answered correctly!`);
            await this.messageService.sendMessage(`${account} answered correctly!`);
        } else {
            console.log(`Nobody answered correctly! The correct answer was ${result}`);
            await this.messageService.sendMessage(`Nobody answered correctly! The correct answer was ${result}`);
        }

        await this.delay(50000);
        this.eventEmitter.emit("askQuestion"); // Ask the next question
    }

    private async onRandomSentence(): Promise<void> {
        if (this.sentences.length === 0) {
            this.sentences = [...this.main_sentences];
        }

        const randomIndex = Math.floor(Math.random() * this.sentences.length);
        const message = this.sentences[randomIndex];
        this.sentences.splice(randomIndex, 1);

        console.log(message);
        await this.messageService.sendMessage(message);

        await this.delay(60000 * 25);
        this.sentence_time = Date.now();
        this.eventEmitter.emit("RandomSentence");
    }

    // Time checker
    public checkSentenceTime(): void {
        const remainingTime = 25 * 60000 - (Date.now() - this.sentence_time);
        const remainingTimeInSeconds = Math.floor(remainingTime / 1000);
        console.log(`Checking sentence time: ${remainingTimeInSeconds} seconds`);
    }

    // Start the application
    public start(): void {
        // Uncomment as needed
        // this.eventEmitter.emit("askQuestion");
        this.eventEmitter.emit("waitForAiResponse");
        this.messageService.sendMessage("Bot is up")
        setInterval(this.checkSentenceTime.bind(this), 1000);
    }
}

// Create and start the handler
export const chatHandler = new ChatEventHandler();
