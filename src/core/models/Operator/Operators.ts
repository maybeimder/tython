
export enum OperatorType {
      "Add" = "Add",
      "Substract" = "Substract",
      "Multiply"="Multiply",
      "Divide"="Divide",
      "Power"="Power",
      "Assign"="Assign",
}

const operatorPrecedence: Record<OperatorType, number> = {
      "Add": 3,
      "Substract": 3,
      "Multiply": 2,
      "Divide": 2,
      "Power": 1,
      "Assign": 4
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

      constructor(lexeme: string) {
            this._lexeme = lexeme
            this._type = lexemeToOperatorType[lexeme]
            this._precedence = operatorPrecedence[this._type]
      }

      get precendece() { return this._precedence }
      get type() { return this._type}
}
