const {
    COMMAND_NAME,
    PERMISSION_NAME,
    PLUGIN_OWNER_ID
} = require('./constants.js');
const TrollHandler = require('./lib/trollHandler.js');
const createTrollCommand = require('./commands/troll.js');

async function onLoad(bot, options) {
    const log = bot.sendLog;
    const Command = bot.api.Command;
    const settings = options.settings;

    bot.pluginData = bot.pluginData || {};
    if (!bot.pluginData.trollCommand) {
        bot.pluginData.trollCommand = {
            isTrolling: false,
            targetPlayer: null,
            timeoutId: null,
        };
    }

    const trollHandler = new TrollHandler(bot, settings);
    const TrollCommand = createTrollCommand(Command, trollHandler);

    try {
        await bot.api.registerPermissions([{
            name: PERMISSION_NAME,
            description: 'Доступ к команде troll',
            owner: PLUGIN_OWNER_ID
        }]);

        await bot.api.addPermissionsToGroup('Admin', [PERMISSION_NAME]);
        await bot.api.registerCommand(new TrollCommand());
        log(`[${PLUGIN_OWNER_ID}] Команда '${COMMAND_NAME}' успешно зарегистрирована.`);

    } catch (error) {
        log(`[${PLUGIN_OWNER_ID}] Ошибка при загрузке: ${error.message}`);
    }

    bot.once('end', () => {
        if (bot.pluginData.trollCommand.timeoutId) {
            clearTimeout(bot.pluginData.trollCommand.timeoutId);
            bot.pluginData.trollCommand.isTrolling = false;
        }
    });
}

async function onUnload({
    botId,
    prisma
}) {
    console.log(`[${PLUGIN_OWNER_ID}] Удаление ресурсов для бота ID: ${botId}`);
    try {
        await prisma.command.deleteMany({
            where: {
                botId,
                owner: PLUGIN_OWNER_ID
            }
        });
        await prisma.permission.deleteMany({
            where: {
                botId,
                owner: PLUGIN_OWNER_ID
            }
        });
        console.log(`[${PLUGIN_OWNER_ID}] Команды и права плагина удалены.`);
    } catch (error) {
        console.error(`[${PLUGIN_OWNER_ID}] Ошибка при очистке ресурсов:`, error);
    }
}

module.exports = {
    onLoad,
    onUnload,
};