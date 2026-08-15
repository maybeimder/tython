export class CharHelper {

      public static isDigit(char: string) { return char >= '0' && char <= '9' }
      public static isLetter(char: string) { return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') }
      public static isOperator(char: string) { return /[-+*/^]/.test(char) }
      public static isDelimiter(char: string) { return /[(){}]/.test(char) }
      public static isWhitespace(char: string) { return /^\s$/.test(char) }
}
