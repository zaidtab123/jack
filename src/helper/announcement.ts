import { Message, TextChannel, NewsChannel } from "discord.js";
import { serverLogger } from "../utils/logger";
import { announcementMessage, createBasicEmbed } from "../utils/messages";
import { COMMANDS, ERRORS } from "../utils/constants";
import { incomingMessageSchema } from "../models/incomingMessage";

/**
 * Handles all announcements
 *
 * @param {Message} incomingMessage
 * @param {incomingMessageSchema} messageType
 */

export async function handleAnnouncements(
  incomingMessage: Message,
  messageType: incomingMessageSchema
) {
  if (!messageType.incomingUser.isMod) {
    serverLogger("user-error", incomingMessage.content, "Unauthorized User");
    return incomingMessage.channel.send(
      `<@${messageType.incomingUser.id}>`,
      createBasicEmbed(ERRORS.UNAUTHORIZED_USER, "ERROR")
    );
  }
  try {
    const regex = new RegExp(
      `^${COMMANDS.prefix} ${COMMANDS.announce}( here | everyone | norole | | <@&.+> )<#.+> \{.*\} (.|\n)+$`,
      "g"
    );
    if (regex.test(incomingMessage.content)) {
      let channelId = incomingMessage.content.match(/<#.+?>/)![0];
      channelId = channelId.substring(2, channelId.length - 1);
      let title = incomingMessage.content.match(/\{.*?\}/)![0];
      title = title.substring(1, title.length - 1);
      const announcement = incomingMessage.content.substring(
        incomingMessage.content.indexOf("} ") + 2
      );
      const channel = incomingMessage.guild?.channels.cache.find(
        (ch) => ch.id == channelId
      );
      if (channel && (channel?.type === "text" || channel?.type === "news")) {
        const everyoneRegex = new RegExp(
          `^${COMMANDS.prefix} ${COMMANDS.announce} everyone`
        );
        const hereRegex = new RegExp(
          `^${COMMANDS.prefix} ${COMMANDS.announce} here`
        );
        const norole = new RegExp(
          `^${COMMANDS.prefix} ${COMMANDS.announce} norole`
        );
        const roleMentionRegex = new RegExp(
          `^${COMMANDS.prefix} ${COMMANDS.announce} <@&.+>`
        );
        if (everyoneRegex.test(incomingMessage.content)) {
          (channel as TextChannel | NewsChannel).send(
            "**📢 Announcement @everyone!**",
            {
              embed: announcementMessage(title, announcement),
            }
          );
        } else if (norole.test(incomingMessage.content)) {
          (channel as TextChannel | NewsChannel).send("**📢 Announcement!!**", {
            embed: announcementMessage(title, announcement),
          });
        } else if (hereRegex.test(incomingMessage.content)) {
          (channel as TextChannel | NewsChannel).send(
            "**📢 Announcement @here!**",
            {
              embed: announcementMessage(title, announcement),
            }
          );
        } else if (roleMentionRegex.test(incomingMessage.content)) {
          let roleId = incomingMessage.content.split(" ")[2];
          roleId = roleId.substring(3, roleId.length - 1);
          console.log(roleId);
          (channel as TextChannel | NewsChannel).send(
            `**📢 Announcement <@&${roleId}>!**`,
            {
              embed: announcementMessage(title, announcement),
            }
          );
        } else {
          (channel as TextChannel | NewsChannel).send({
            embed: announcementMessage(title, announcement),
          });
        }
        incomingMessage.channel.send("Sent! :white_check_mark: ");
        serverLogger(
          "success",
          incomingMessage.content.split(" ").splice(0, 5),
          "Announcements"
        );
      } else {
        throw Error;
      }
    } else {
      serverLogger(
        "user-error",
        incomingMessage.content.split(" ").splice(0, 5),
        "Invalid command"
      );
      incomingMessage.channel.send(
        `<@${messageType.incomingUser.id}>`,
        createBasicEmbed(ERRORS.INVALID_COMMAND, "ERROR")
      );
    }
  } catch (err) {
    incomingMessage.channel.send(
      `<@${messageType.incomingUser.id}>`,
      createBasicEmbed(ERRORS.INVALID_CHANNEL, "ERROR")
    );
    serverLogger(
      "user-error",
      incomingMessage.content.split(" ").splice(0, 5),
      "Announcement to invalid channel"
    );
  }
}

/**
 *
 * Handles all image announcements
 *
 * @param {Message} incomingMessage
 * @param {incomingMessageSchema} messageType
 * @returns {Message|undefined}
 */

export const handleImageAnnouncements = async (
  incomingMessage: Message,
  messageType: incomingMessageSchema
): Promise<Message | undefined> => {
  if (!messageType.incomingUser.isMod) {
    serverLogger("user-error", incomingMessage.content, "Unauthorized User");
    return incomingMessage.channel.send(
      `<@${messageType.incomingUser.id}>`,
      createBasicEmbed(ERRORS.UNAUTHORIZED_USER, "ERROR")
    );
  }
  try {
    const messageContentSplit = incomingMessage.content.split(" ");
    if (messageContentSplit.length < 3) {
      incomingMessage.channel.send(
        `<@${messageType.incomingUser.id}>`,
        createBasicEmbed(ERRORS.INVALID_COMMAND, "ERROR")
      );
      serverLogger(
        "user-error",
        incomingMessage.content.split(" ").splice(0, 5),
        "Announcement to invalid channel"
      );
    }
    let channelId = incomingMessage.content.match(/<#.+?>/)![0];
    channelId = channelId.substring(2, channelId.length - 1);
    const imageUrl = messageContentSplit[3];
    const channel = incomingMessage.guild?.channels.cache.find(
      (ch) => ch.id == channelId
    );
    if (channel && (channel?.type === "text" || channel?.type === "news")) {
      (channel as TextChannel).send(imageUrl);
      incomingMessage.channel.send("Sent! :white_check_mark: ");
      serverLogger(
        "success",
        incomingMessage.content.split(" ").splice(0, 5),
        "Announcements"
      );
    } else throw Error;
  } catch (err) {
    incomingMessage.channel.send(
      `<@${messageType.incomingUser.id}>`,
      createBasicEmbed(ERRORS.INVALID_CHANNEL, "ERROR")
    );
    serverLogger(
      "user-error",
      incomingMessage.content.split(" ").splice(0, 5),
      "Announcement to invalid channel"
    );
  }
};
