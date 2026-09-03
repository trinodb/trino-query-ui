import Schema from './Schema'

class Catalog {
    private name: string
    private type: string
    private errorMessage: string = ''
    private schemas: Map<string, Schema> = new Map<string, Schema>()

    constructor(name: string, type: string) {
        this.name = name
        this.type = type
    }

    getName(): string {
        return this.name
    }

    getType(): string {
        return this.type
    }

    getOrAdd(schema: Schema): Schema {
        if (!this.schemas.has(schema.getName())) {
            this.schemas.set(schema.getName(), schema)
        }
        return this.schemas.get(schema.getName()) as Schema
    }

    getSchemas(): Map<string, Schema> {
        return this.schemas
    }

    setErrorMessage(error: string) {
        this.errorMessage = error
    }

    clearErrorMessage() {
        this.errorMessage = ''
    }

    getError() {
        return this.errorMessage
    }
}

export default Catalog
