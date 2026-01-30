const DEFAULT_MAX_TOKENS = 500;
const DEFAULT_OVERLAP = 50;
/**
 * Simple text chunking by approximate token count (words * 1.3).
 * Splits on sentence boundaries when possible.
 */
export function chunkText(text, options = {}) {
    const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
    const overlap = options.overlap ?? DEFAULT_OVERLAP;
    // Approximate tokens as words * 1.3
    const maxWords = Math.floor(maxTokens / 1.3);
    const overlapWords = Math.floor(overlap / 1.3);
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks = [];
    let currentChunk = [];
    let currentWordCount = 0;
    for (const sentence of sentences) {
        const sentenceWords = sentence.split(/\s+/).length;
        if (currentWordCount + sentenceWords > maxWords &&
            currentChunk.length > 0) {
            chunks.push(currentChunk.join(" "));
            // Keep overlap from the end of the current chunk
            const overlapSentences = [];
            let overlapCount = 0;
            for (let i = currentChunk.length - 1; i >= 0 && overlapCount < overlapWords; i--) {
                overlapSentences.unshift(currentChunk[i]);
                overlapCount += currentChunk[i].split(/\s+/).length;
            }
            currentChunk = overlapSentences;
            currentWordCount = overlapCount;
        }
        currentChunk.push(sentence);
        currentWordCount += sentenceWords;
    }
    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(" "));
    }
    return chunks;
}
