function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class TrollHandler {
    constructor(bot, settings) {
        this.bot = bot;
        this.settings = settings;
        this.trollData = bot.pluginData.trollCommand;
    }

    start(targetPlayer, user) {
        if (this.trollData.isTrolling) {
            if (this.settings.sendNotificationsToPM) {
                if (this.trollData.targetPlayer.toLowerCase() === targetPlayer.toLowerCase()) {
                    const message = this.settings.trollingSamePlayerMessage.replace('{player}', this.trollData.targetPlayer);
                    this.bot.api.sendMessage('private', message, user.username);
                } else {
                    const message = this.settings.alreadyTrollingMessage.replace('{player}', this.trollData.targetPlayer);
                    this.bot.api.sendMessage('private', message, user.username);
                }
            }
            return;
        }

        this.trollData.isTrolling = true;
        this.trollData.targetPlayer = targetPlayer;
        this.trollData.initiator = user.username;

        if (this.settings.sendNotificationsToPM) {
            const startMsg = this.settings.startMessage.replace('{player}', targetPlayer);
            this.bot.api.sendMessage('private', startMsg, user.username);
        }

        let messagesToSend = [...this.settings.trollMessages];
        if (this.settings.enableRandomOrder) {
            messagesToSend = shuffleArray(messagesToSend);
        }

        this._sendNextMessage(messagesToSend);
    }

    stop(user) {
        if (!this.trollData.isTrolling) {
            if (this.settings.sendNotificationsToPM) {
                this.bot.api.sendMessage('private', this.settings.notTrollingMessage, user.username);
            }
            return;
        }

        if (this.trollData.timeoutId) {
            clearTimeout(this.trollData.timeoutId);
        }

        if (this.settings.sendNotificationsToPM) {
            this.bot.api.sendMessage('private', this.settings.stopMessage, user.username);
        }

        this.trollData.isTrolling = false;
        this.trollData.targetPlayer = null;
        this.trollData.timeoutId = null;
        this.trollData.initiator = null;
    }

    _sendNextMessage(messages) {
        if (!this.trollData.isTrolling) {
            return;
        }

        if (messages.length === 0) {
            if (this.settings.sendNotificationsToPM && this.trollData.initiator) {
                const finishMsg = this.settings.finishMessage.replace('{player}', this.trollData.targetPlayer);
                this.bot.api.sendMessage('private', finishMsg, this.trollData.initiator);
            }
            this.trollData.isTrolling = false;
            this.trollData.targetPlayer = null;
            this.trollData.timeoutId = null;
            this.trollData.initiator = null;
            return;
        }

        const messageTemplate = messages.shift();
        const finalMessage = `${this.trollData.targetPlayer}, ${messageTemplate}`;

        this.bot.api.sendMessage('global', finalMessage);

        const delay = getRandomDelay(this.settings.minDelayMs, this.settings.maxDelayMs);

        this.trollData.timeoutId = setTimeout(() => {
            this._sendNextMessage(messages);
        }, delay);
    }
}

module.exports = TrollHandler;