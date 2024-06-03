import { Client, GatewayIntentBits } from "discord.js";
import { existsSync, lstatSync, readdirSync } from "fs";
import { cwd } from "process"

class CodieBot extends Client
{
    #ROOT = cwd().concat('/src')
    #options = {
        eventsDirectory: 'events',
        slashCommandsDirectory: 'slash',
        prefixCommandsDirectory: 'prefix',
        prefix: '!',
    }

    constructor(options)
    {
        const allIntents = []

        if (!options?.intents)
        {
            WARN("Προειδοποίηση: Έχεις ξεχάσει να βάλεις τα intents!\nΤο CodieBot έβαλε αυτόματα όλα τα intents.")
            Object.keys(GatewayIntentBits).forEach(key => allIntents.push(GatewayIntentBits[key]))
        }

        super({ intents: options?.intents || allIntents })

        if (options) Object.assign(this.#options, options)

        this.#loadModuleDirectory(this.#options.eventsDirectory, "event")
        this.#loadModuleDirectory(this.#options.prefixCommandsDirectory, "prefixCommand")

        const token = options?.token

        if (!token)
        {
            ERROR("Έχεις ξεχάσει να βάλεις το token σου.")
            LOG("Το token θα το βρεις στο discord developer portal")
            CODE("θα πρέπει να το βάλεις στα options του CodieBot", `const bot = new CodieBot({token: "YOUR_SUPER_SECRET_TOKEN"})`)
            return
        }

        this.login(token)
    }

    #loadModuleDirectory(directory, type)
    {
        const rootPath = this.#ROOT.concat("/", directory);

        if (!existsSync(rootPath))
        {
            ERROR(`Ο φάκελος "${directory}" δεν υπάρχει.`);
            LOG(`Φτιάξε έναν φάκελο με όνομα "${directory}" μέσα στον φάκελο "src"`);
            return;
        }

        const filenames = readdirSync(rootPath);

        for (const filename of filenames)
        {
            const fullpath = rootPath.concat("/", filename);
            if (!lstatSync(fullpath).isFile())
            {
                this.#loadModuleDirectory(directory.concat("/", filename), type);
                continue;
            }
            this.#loadModule(directory, filename, type);
        }
    }

    async #loadModule(directory, file, type)
    {
        const fullPath = `../${directory}/${file}`;
        const { [`${type}Name`]: name, execute } = await import(fullPath);

        if (!name)
        {
            ERROR(`Δεν υπάρχει το "${type}Name" στο ${file}.`)
            CODE(`Χρησιμοποίησε`, `export const ${type}Name = ...`);
            return;
        }

        if (!execute)
        {
            ERROR(`Δεν υπάρχει το "execute" function στο ${file}.`);
            CODE("Πρέπει να φτιάξεις ένα function ->", "\nexport function execute(interaction) {\n  // Your event/command logic here\n} ");
            return;
        }
        this.on(name, execute);
        SUCCESS(`${type}`)
        SUCCESS(`ΕΠΙΤΥΧΙΑ | ${file} -> ${name}\n`);
    }
}

export default CodieBot