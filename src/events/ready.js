import { Events } from "discord.js"

export const eventName = Events.ClientReady

export function execute(client) {
    LOG(`${client.user.tag} is up and running`)
}