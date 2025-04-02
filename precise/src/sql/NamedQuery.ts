class NamedQuery {

    public name: string;
    public node: any;

    constructor(name: string, node: any) {
        this.name = name;
        this.node = node;
    }
}

export default NamedQuery;