
export enum OperatorType {
      "Add" = "Add",
      "Substract" = "Substract",
      "Multiply"="Multiply",
      "Divide"="Divide",
      "Power"="Power",
      "Assign"="Assign",
}

const operatorPrecedence: Record<OperatorType, number> = {
      "Assign": 1,
      "Add": 2,
      "Substract": 2,
      "Multiply": 3,
      "Divide": 3,
      "Power": 4,
}

const lexemeToOperatorType: Record<string, OperatorType> = {
      "*": OperatorType.Multiply,
      "/": OperatorType.Divide,
      "+": OperatorType.Add,
      "-": OperatorType.Substract,
      "^": OperatorType.Power,
      ":=": OperatorType.Assign
}

export class Operator {
      private readonly _lexeme: string
      private readonly _type: OperatorType
      private readonly _precedence: number
      private readonly _leftAssociative: boolean

      constructor(lexeme: string) {
            this._lexeme = lexeme
            this._type = lexemeToOperatorType[lexeme]
            this._precedence = operatorPrecedence[this._type]
            this._leftAssociative = lexeme !== "^"
      }

      get precendece() { return this._precedence }
      get leftAssociativity() { return this._leftAssociative }
      get type() { return this._type }

      toString() { return `${this._lexeme}`}
}
