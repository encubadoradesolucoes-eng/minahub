/**
 * Validação de NUIT (Número Único de Identificação Tributária) de Moçambique
 * Formato: 9 dígitos
 * 9º dígito é o dígito de controlo (checksum módulo 11)
 */
export function validarNUIT(nuit: string): boolean {
    // Remover caracteres não numéricos
    const digits = nuit.replace(/\D/g, "");

    // Deve ter exatamente 9 dígitos
    if (digits.length !== 9) return false;

    // Algoritmo de Checksum (Módulo 11)
    // Pesos: 9, 8, 7, 6, 5, 4, 3, 2 para os primeiros 8 dígitos
    let sum = 0;
    for (let i = 0; i < 8; i++) {
        sum += parseInt(digits[i]) * (9 - i);
    }

    const remainder = sum % 11;
    let expectedDigit = 0;
    if (remainder > 1) {
        expectedDigit = 11 - remainder;
    }

    return parseInt(digits[8]) === expectedDigit;
}

export function formatarNUIT(nuit: string): string {
    const digits = nuit.replace(/\D/g, "").slice(0, 9);
    return digits; // NUIT geralmente é usado como número corrido ou com espaços, mas 9 dígitos é o padrão
}
