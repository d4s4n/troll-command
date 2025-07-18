const { COMMAND_NAME, PERMISSION_NAME, PLUGIN_OWNER_ID } = require('../constants.js');

module.exports = (Command, trollHandler) => {
    return class TrollCommand extends Command {
        constructor() {
            super({
                name: COMMAND_NAME,
                description: 'Начинает или останавливает троллинг игрока.',
                aliases: ['троль'],
                permissions: PERMISSION_NAME,
                owner: PLUGIN_OWNER_ID,
                allowedChatTypes: ['clan', 'private', 'chat'],
                args: [{
                    name: 'ник',
                    type: 'string',
                    required: false
                }]
            });
        }

        async handler(bot, typeChat, user, { ник }) {
            const executor = await bot.api.getUser(user.username);
            if (!executor || (!executor.isOwner && !executor.hasPermission(PERMISSION_NAME))) {
                return this.onInsufficientPermissions(bot, typeChat, user);
            }

            if (ник) {
                trollHandler.start(ник, user);
            } else {
                trollHandler.stop(user);
            }
        }
    }
};