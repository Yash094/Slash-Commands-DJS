const discord = require("discord.js");
const client = new discord.Client();

client.on("ready", () => {
  console.log("ready");

  client.api
    .applications(client.user.id)
    .guilds("664505860327997461")
    .commands.post({
      data: {
        name: "hello",
        description: "Replies with Hello World!"
      }
    });

  client.api
    .applications(client.user.id)
    .guilds("664505860327997461")
    .commands.post({
      data: {
        name: "echo",
        description: "Echos your text as an embed!",

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
          }
        ]
      }
    }),
    client.api
      .applications(client.user.id)
      .guilds("664505860327997461")
      .commands.post({
        data: {
          name: "rps",
          description: "Echos your text as an embed!",

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

    if (command == "hello") {
      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            content: "Hello World!"
          }
        }
      });
    }

    if (command == "echo") {
      const description = args.find(arg => arg.name.toLowerCase() == "content")
        .value;
      const color = interaction.data.options[1].value;
      const embed = new discord.MessageEmbed()
        .setTitle("Echo!")
        .setColor(color)
        .setDescription(description)
        .setAuthor(interaction.member.user.username);

      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: await createAPIMessage(interaction, embed)
        }
      });
    }
    if (command == "rps") {
      const selected = interaction.data.options[0].value;
      const chooseArr = ["rock", "paper", "scissors"];
      const botChoice = chooseArr[Math.floor(Math.random() * chooseArr.length)];
      function getResult(me, botChosen) {
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
            content: getResult(selected, botChoice)
          }
        }
      });
    }
  });
});

async function createAPIMessage(interaction, content) {
  const apiMessage = await discord.APIMessage.create(
    client.channels.resolve(interaction.channel_id),
    content
  )
    .resolveData()
    .resolveFiles();

  return { ...apiMessage.data, files: apiMessage.files };
}

client.login(require("./config.json").token);
