"use strict";
class IntuitiveWebSocket {
    constructor(url, secure) {
        this.connected = false;
        this.responseType = "text";
        this.acceptedResponseTypes = ["text", "json", "xml", "html"];
        secure = secure !== null && secure !== void 0 ? secure : true;
        this.wsUrl = secure ?
            "wss://" + url :
            "ws://" + url;
    }
    onReady() { }
    ;
    onMessage(data) { }
    ;
    onClose(response) { }
    ;
    connect(data) {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.wsUrl);
            this.ws.addEventListener("error", (event) => {
                reject(String(event));
            });
            this.ws.addEventListener("open", (event) => {
                if (data)
                    this.ws.send(data);
                this.connected = true;
                this.onReady();
                resolve(String(event));
            });
            this.ws.addEventListener("message", (event) => {
                const d = (() => {
                    switch (this.responseType) {
                        case "text":
                            return event.data;
                        case "json":
                            try {
                                return JSON.parse(event.data);
                            }
                            catch (e) {
                                throw new Error("Error parsing JSON: " + e);
                            }
                            ;
                        case "xml":
                            try {
                                const XMLParser = new DOMParser();
                                return XMLParser.parseFromString(event.data, "text/xml");
                            }
                            catch (e) {
                                throw new Error("Error parsing XML: " + e);
                            }
                        case "html":
                            const el = document.createElement("html");
                            el.innerHTML = event.data;
                            return el;
                        default:
                            return event.data;
                    }
                });
                this.onMessage(d);
            });
            this.ws.addEventListener("close", (event) => {
                this.connected = false;
                this.onClose(event);
            });
        });
    }
    ;
    send(data) {
        if (this.connected)
            this.ws.send(data);
    }
    ;
    close(code, reason) {
        if (this.connected)
            this.ws.close(code, reason);
        else
            return;
        this.connected = false;
    }
    ;
    setResponseType(outputType) {
        if (this.acceptedResponseTypes.indexOf(outputType) === -1) {
            throw new Error("Response type not recognized: " + outputType);
            return;
        }
        else
            this.responseType = outputType;
    }
    ;
    ;
}
