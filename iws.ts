class IntuitiveWebSocket {
    ws: WebSocket;
    wsUrl: string;
    connected: boolean = false;
    responseType: string = "text";
    acceptedResponseTypes: string[] = ["text", "json", "xml", "html"];
    onReady(): void { };
    onMessage(data: any): void { };
    onClose(response?: CloseEvent): void { };
    connect(data?: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.wsUrl);
            this.ws.addEventListener("error", (event: Event) => {
                reject(String(event));
            });
            this.ws.addEventListener("open", (event: Event) => {
                if (data) this.ws.send(data);
                this.connected = true;
                this.onReady();
                resolve(String(event));
            });
            this.ws.addEventListener("message", (event: MessageEvent) => {
                const d = (() => {
                    switch (this.responseType) {
                        case "text":
                            return event.data;
                        case "json":
                            try {
                                return JSON.parse(event.data);
                            } catch (e) {
                                throw new Error("Error parsing JSON: " + e);
                            };
                        case "xml":
                            try {
                                const XMLParser = new DOMParser();
                                return XMLParser.parseFromString(event.data, "text/xml");
                            } catch (e) {
                                throw new Error("Error parsing XML: " + e);
                            }
                        case "html":
                            const el = document.createElement("html");
                            el.innerHTML = event.data;
                            return el;
                        default:
                            return event.data;
                    }
                })
                this.onMessage(d);
            });
            this.ws.addEventListener("close", (event: CloseEvent) => {
                this.connected = false;
                this.onClose(event);
            });
        });
    };
    send(data: string): void {
        if (this.connected) this.ws.send(data);
    };
    close(code?: number, reason?: string): void {
        if (this.connected) this.ws.close(code, reason);
        else return;
        this.connected = false;
    };
    setResponseType(outputType: string): void {
        if (this.acceptedResponseTypes.indexOf(outputType) === -1) {
            throw new Error("Response type not recognized: " + outputType);
            return;
        } else this.responseType = outputType;
    };
    constructor(url: string, secure?: boolean) {
        secure = secure ?? true;
        this.wsUrl = secure ?
            "wss://" + url :
            "ws://" + url;
    };
}