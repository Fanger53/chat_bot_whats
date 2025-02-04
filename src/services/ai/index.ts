import OpenAI from "openai";

// Definición manual del tipo ChatCompletionMessageParam
type ChatCompletionMessageParam =
    | {
          role: "system" | "user" | "assistant";
          content: string;
      }
    | {
          role: "function";
          name: string;
          content: string;
      };

class AIClass {
    private openai: OpenAI;
    private model: string;

    constructor(apiKey: string, _model: string) {
        if (!apiKey || apiKey.length === 0) {
            throw new Error("DASHSCOPE_API_KEY is missing");
        }

        this.openai = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
            timeout: 15 * 1000,
        });

        this.model = _model;
    }

    /**
     * 
     * @param messages - Array de mensajes de chat
     * @param model - Modelo opcional (si no se proporciona, usa el modelo predeterminado)
     * @param temperature - Controla la creatividad de las respuestas
     * @returns Respuesta generada por Qwen
     */
    createChat = async (
        messages: ChatCompletionMessageParam[],
        model?: string,
        temperature: number = 0
    ): Promise<string> => {
        try {
            const completion = await this.openai.chat.completions.create({
                model: model ?? this.model,
                messages,
                temperature,
                max_tokens: 326,
                top_p: 0,
                frequency_penalty: 0,
                presence_penalty: 0,
            });

            return completion.choices[0].message.content || "Sin respuesta";
        } catch (err) {
            console.error(err);
            return "ERROR";
        }
    };
}

export default AIClass;