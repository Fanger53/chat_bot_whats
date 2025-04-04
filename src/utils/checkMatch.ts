const checkTecnoMatch = (input: string): boolean => {
    const target = "tecno";
    const normalizedInput = input.toLowerCase();
    const words = normalizedInput.split(/\s+/);
    
    // Verificar si alguna palabra contiene "tecno" exactamente
    for (const word of words) {
        if (word.includes(target)) {
            return true;
        }
        
        // Alternativa: Verificar similitud usando una ventana deslizante
        // para buscar 5 caracteres consecutivos que formen una subsecuencia de "tecno"
        for (let i = 0; i <= word.length - 5; i++) {
            const substring = word.substring(i, i + 5);
            // Verificar si este substring de 5 caracteres es similar a "tecno"
            // Podemos usar levenshtein distance u otra medida de similitud
            if (isSimilarTo(substring, target)) {
                return true;
            }
        }
    }
    return false;
};

// Función para determinar si un string de 5 caracteres es similar a "tecno"
// Podemos definir "similar" como tener al menos X caracteres en común en la posición correcta
const isSimilarTo = (str: string, target: string): boolean => {
    let matchCount = 0;
    
    // Contar cuántos caracteres coinciden en la misma posición
    for (let i = 0; i < Math.min(str.length, target.length); i++) {
        if (str[i] === target[i]) {
            matchCount++;
        }
    }
    
    // Consideramos similar si al menos 4 de 5 caracteres coinciden
    return matchCount >= 4;
};


const checkBirthMatch = (input: string): boolean => {
    const target = "cumpleaños";
    const normalizedInput = input.toLowerCase();
    const words = normalizedInput.split(/\s+/);
    
    // Verificar si alguna palabra contiene "cumpleaños" exactamente
    for (const word of words) {
        if (word.includes(target)) {
            return true;
        }
        
        // Verificar similitud usando una ventana deslizante
        // para buscar 8 caracteres consecutivos que formen una subsecuencia de "cumpleaños"
        for (let i = 0; i <= word.length - 8; i++) {
            const substring = word.substring(i, i + 8);
            // Verificar si este substring de 8 caracteres es similar a parte de "cumpleaños"
            if (isSimilarTo(substring, target)) {
                return true;
            }
        }
    }
    return false;
};


export {checkTecnoMatch, checkBirthMatch};