export class CaseNotHandledError extends Error {
    constructor(message) {
        super(message);
        this.name = "CaseNotHandledError";
    }
}
