const discord = require("discord.js");
const client = new discord.Client();
const config = require("./config.json");
client.on("ready", () => {
  console.log("ready");

  client.api
    .applications(client.user.id)
    .guilds(config.guildid)
    .commands.post({
      data: {
        name: "ping",
        description: "Replies with pong!"
      }
    });

  client.api
    .applications(client.user.id)
    .guilds(config.guildid)
    .commands.post({
      data: {
        name: "embed",
        description: "Embeds your text as an embed!",

        options: [
          {
            name: "content",
            description: "Content of the embed",
            type: 3,
            required: true
          },
          {
            name: "color",
            description: "color of the embed",
            type: 3,
            required: true
          },
          {
            name: "title",
            description: "title of the embed",
            type: 3,
            required: true
          }
        ]
      }
    }),
    client.api
      .applications(client.user.id)
      .guilds(config.guildid)
      .commands.post({
        data: {
          name: "rps",
          description: "Play RPS With Bot",

          options: [
            {
              name: "rps",
              description: "Play rock player scissors",
              type: 3,
              required: true,
              choices: [
                {
                  name: "rock",
                  value: "rock"
                },
                {
                  name: "paper",
                  value: "paper"
                },
                {
                  name: "scissors",
                  value: "scissors"
                }
              ]
            }
          ]
        }
      });

  client.ws.on("INTERACTION_CREATE", async interaction => {
    const command = interaction.data.name.toLowerCase();
    const args = interaction.data.options;

    if (command == "ping") {
      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            content: "Pong!"
          }
        }
      });
    }

    if (command == "embed") {
      const description = interaction.data.options[0].value;
      const color = interaction.data.options[1].value;
      console.log(color);
      const myuser = interaction.member.user.username;
      const title = interaction.data.options[2].value;
      const embed = new discord.MessageEmbed()
        .setTitle(title)
        .setColor(color)
        .setDescription(description)
        .setAuthor(myuser);

      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: await Message(interaction, embed)
        }
      });
    }
    if (command == "rps") {
      const selected = interaction.data.options[0].value;
      const chooseArr = ["rock", "paper", "scissors"];
      const botChoice = chooseArr[Math.floor(Math.random() * chooseArr.length)];
      function Result(me, botChosen) {
        if (
          (me === "rock" && botChosen === "scissors") ||
          (me === "paper" && botChosen === "rock") ||
          (me === "scissors" && botChosen === "paper")
        ) {
          return "Bot choose " + botChoice + " You won!";
        } else if (me === botChosen) {
          return "Bot choose " + botChoice + " Its a tie!";
        } else {
          return `Bot choose ${botChoice} You lost!`;
        }
      }
      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            content: Result(selected, botChoice)
          }
        }
      });
    }
  });
});

async function Message(interaction, content) {
  const Msg = await discord.APIMessage.create(
    client.channels.resolve(interaction.channel_id),
    content
  )
    .resolveData()
    .resolveFiles();

  return { ...Msg.data, files: Msg.files };
}

client.login(config.token);
