export const numberClean = (input: string): string => {
    // Eliminar todos los caracteres no numéricos usando una expresión regular
    const cleanedNumber = input.replace(/\D/g, '');
    return cleanedNumber;
};