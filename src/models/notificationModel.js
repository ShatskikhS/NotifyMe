import { PRIORITIES, STATUSES } from "./consts/notificationFields.js"
class Notification {
    constructor({id, source, priority = PRIORITIES.LOW, message, channels, sendAt, receivedAt, status = STATUSES.RECEIVED} = {}) {
        this.id = id;
        this.source = source;
        this.priority = priority;
        this.message = message;
        this.channels = channels;
        this.sendAt = sendAt ? (sendAt instanceof Date ? sendAt : new Date(sendAt)) : null;
        this.receivedAt = receivedAt ? (receivedAt instanceof Date ? receivedAt : new Date(receivedAt)) : new Date();
        this.status = status;
    }

    toJSON() {
        return {
            id: this.id,
            source: this.source,
            priority: this.priority,
            message: this.message,
            channels: this.channels,
            receivedAt: this.receivedAt,
            sendAt: this.sendAt,
            status: this.status
        };
    }

    static fromJSON(obj) {
        return new Notification({
            ...obj
        });
    }
}

export default Notification;
