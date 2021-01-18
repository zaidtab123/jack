import { Message, TextChannel } from "discord.js";
import { serverLogger } from "../utils/logger";
import {
  announcementMessage,
  invalidChannel,
  invalidCommand,
  unauthorizedUser,
} from "../utils/messages";
import { checkForAccessByRoles } from "../helper/roleAuth";
export async function handleAnnouncements(incomingMessage: Message) {
  try {
    const isAllowed = await checkForAccessByRoles(incomingMessage.member, [
      "Moderator",
    ]);
    if (isAllowed) {
      const channelName = incomingMessage.content.split(" ")[2];
      const title = incomingMessage.content.split(" ")[3];
      const announcement = incomingMessage.content
        .split(" ")
        .slice(4)
        .join(" ");
      if (!announcement) {
        serverLogger(
          "user-error",
          incomingMessage.content.split(" ").splice(0, 5),
          "Announcement text missing"
        );
        incomingMessage.channel.send(invalidCommand());
      } else {
        const channel: TextChannel = incomingMessage.guild?.channels.cache.find(
          (ch) => ch.name == channelName
        ) as TextChannel;
        if (channel && channel?.type == "text") {
          channel.send("@everyone", {
            embed: announcementMessage(title, announcement),
          });
          incomingMessage.channel.send("Sent! :white_check_mark: ");
        } else {
          throw Error;
        }
      }
    } else {
      serverLogger(
        "user-error",
        incomingMessage.content.split(" ").splice(0, 5),
        "Unauthorized User"
      );
      incomingMessage.channel.send(unauthorizedUser());
    }
  } catch (err) {
    incomingMessage.channel.send(invalidChannel());
    serverLogger(
      "user-error",
      incomingMessage.content.split(" ").splice(0, 5),
      "Announcement to invalid channel"
    );
  }
}
