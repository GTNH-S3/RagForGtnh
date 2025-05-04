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
            "F(n) ile Rest midyenin gece ermeninstan fetihi hakkındaki düşünceleri beni 25 yaşımda ikahamet ettirmeye zorluyor",
            "Ermenistan Pornosu bence zenginler için fazla kalifiye olsa da, fakirler için biraz daha ucuz olabilir",
            "Bir gün Manova ile Anova bir bara gitmişler. Anova Demişki benim  KTGA senin KTGA ından daha büyük demiş Manova da buna cevap olarak benim TKT'em senin TKT nı ezer demiş",
            "Bu hayatta Japonlar ve Atatürkün yaptığı devrimlerden daha büyük bir şey yoktur",
            "ATATÜRK",
            "Bu hayatta başımıza Ampülü koyduğu için gidip edisonu s*kecem",
            "Bu hayatta en hakiki müşrit kimdir? diye sorarsanız benim cevabım Atatürk ve Anime Kızları olur",
            "Ben Ege Hakkı Eker Olmak İstiyorum",
            "F =ma",
            "byfeb.com tepkim eclair şeklinde sunulup porno edilmiştir.",
            "Understandable, have a great day",
            "Umut Cevdet Koçak yani umceko.com",
            "Finaller mi The Finaller mi?",
            "Bir gün bir adamın biri bir gün bir gün demiş",
            "0 31 961 29791 923523 28629151",
            "na na na nananana nan nan nanana (Evangelion Opening)",
            ":) Finals Anlayan anladı :)",
            "ORDUDA YAŞIYORUM (ARMY OLMAYAN)",
            "ERROR: SYNTAX ERROR CASIOFX-991EX",
            "BU KIZLAR NİYE BÖYLE YA",
            "MEMESINI BAŞKASININ YALADIĞI KIZIN DERDİNİ BEN ÇEKMEM",
            "İZMİR'İN ALTYAPISINI VE ÜSTYAPISINI YÖNETEN BÜTÜN GERÇEK VE TÜZEL KİŞİLERİN, KAMU VE ÖZEL KURUM VE KURULUŞLARIN ANASINI GÖTTEN SİKEYİM",
            "TOPTAN FİYATINA PERAKENDE LEBLEBİ VE BIÇAK",
            "ÇAKIBEY MANGAL ET VE IZGARA",
            "YER VE GÖKTE BİR BEN LETHALLER LETHALİYİM - EGE HAKKI EKER",
            "We paid tribute to ugliness and we got rid of it, now we can talk in a nice polite way",
            "derin cevdet çok büyük",
            "GÖKHAN ABİ by gökhan abi",
            "Her yere pirozladım her yer piroz oldu",
            "Algoritma Tasarım 28.01.2025 Salı 11:00 A251-A253-A257",
            "PERDE-İ ZULMET ÇEKİLMİŞŞ KORKARIM İKBALİMEAMKKK",
            "ARKADAŞLAR ÖDÜL BURSUMU SWEET BONANZADA YEDİM ÖDÜL BURSUNU KAYBEDENOLDUMU",
            "Cem Yılmaz Kaybını Bakireledi",
            "kaggle da ipynb dosyasını nasıl html e dönüştürüyordu efendi hoca?",
            "Dora ahhh Özsoy ahhh ohhh stratera",
            "Instead of going sober in January, try having a million,zibillion,mega ultra infinity beers",
            "Gulsin Hüseyin 1944 normandiya anlayananlar",
            "Tuborgun 100 de 100 dünyasından geliyorum Ben Filiz Hanım ah oh",
            "w10u gargara eyliyorum iyi forumlar",
            "Elif,Deü left",
            "SİKİBİYİ BİDİLİYORUM",
            "Sex gibi ama prono yani ne bilim porno işte",
            "prostat masajı yapıyorum yazma yazma",
            "Keman Yayı At yayı Agah Yayı",
            "Dusunsene halitsin ama piroz ve kiroz degilsin",
            "Minel Ayrıldı",
            "Maynıl Zıbaynıl Gıbaynıl Ege Bayram",
            "Ege Bayram 25 yaşında",
            "I loved it when Piroz said 'its piroz time' and Pirozzed all over the place",
            "Gal ege bayram??",
            "Emel Hoca Yazıyor...",
            "A251 saddam hussein momentum tork moment yeah",
            "Agahı birbirine temas eden objelerden çıkan ses dalgalarından zevk almasını tebrik eyliyorum",
            "çarşambayı sel aldıysa perşembe kaç yaşındadır?",
            "dubai çikolata aromalı yenilebilir tanga",
            "Ellik TOKAT yöresinin kırmızı çizgisidir."
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
