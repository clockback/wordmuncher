export function speak(text: string, languageCode: string | null): void {
    if (!languageCode || typeof window === "undefined") {
        return;
    }

    if (!window.speechSynthesis) {
        return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCode;
    utterance.rate = 0.7;
    window.speechSynthesis.speak(utterance);
}
