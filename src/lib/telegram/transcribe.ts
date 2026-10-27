import "server-only";

export async function transcribeAudio(bytes: ArrayBuffer, filename: string) {
    const key = process.env.OPENAI_API_KEY;

    if (!key) throw new Error("AI assistant is not configured. Add OPENAI_API_KEY on the server.");

    const form = new FormData();
    
    form.append("file", new File([bytes], filename || "voice.ogg", { type: "audio/ogg" }));
    form.append("model", "whisper-1");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
        body: form,
    });

    if (!response.ok) throw new Error("Could not transcribe the voice message");

    const payload = (await response.json()) as { text?: string };

    return payload.text?.trim() ?? "";
}
