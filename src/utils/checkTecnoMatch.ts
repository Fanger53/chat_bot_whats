const checkTecnoMatch = (input: string): boolean => {
    const target = "tecno";
    const normalizedInput = input.toLowerCase();
    const words = normalizedInput.split(/\s+/);

    for (const word of words) {
        let matchCount = 0;
        for (let i = 0; i < word.length; i++) {
            if (target.includes(word[i])) {
                matchCount++;
            } else {
                matchCount = 0; // Reset count if characters are not consecutive
            }
            if (matchCount >= 4) {
                return true;
            }
        }
    }
    return false;
};

export default checkTecnoMatch;