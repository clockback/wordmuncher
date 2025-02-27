export function leftUnanswered(
    inflectionAnswers: Map<string, string>,
): boolean {
    for (const answer of inflectionAnswers.values()) {
        if (answer.length === 0) {
            return true;
        }
    }
    return false;
}
