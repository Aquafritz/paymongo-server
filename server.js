import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import chalk from "chalk";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.PAYMONGO_SECRET_KEY;

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, description } = req.body;

    const response = await axios.post(
      "https://api.paymongo.com/v1/payment_intents",
      {
        data: {
          attributes: {
            amount: amount * 100,
            currency: "PHP",
            payment_method_allowed: ["gcash", "card", "paymaya", "grab_pay"],
            payment_method_options: {
              card: {
                request_three_d_secure: "automatic",
              },
            },
            description,
          },
        },
      },
      {
        auth: { username: SECRET, password: "" },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(400).json({ error: err.response?.data || err.message });
  }
});

app.post("/attach-payment", async (req, res) => {
  const { paymentIntentId, paymentMethodId, returnUrl } = req.body;
  try {
    const response = await axios.post(
      `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}/attach`,
      {
        data: {
          attributes: {
            payment_method: paymentMethodId,
            return_url: returnUrl, // you need to run the Quick Coat website first then copy the URL of the running website then paste that url in here...
          },
        },
      },
      { auth: { username: SECRET, password: "" } }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(400).json({ error: err.response?.data || err.message });
  }
});

const startServer = (port) => {
  const server = app.listen(port, async () => {
    console.clear();

    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    const log = (msg, color = chalk.green) => console.log(color(msg));

    console.log(chalk.greenBright("Initializing PayMongo Node Core..."));
    await delay(300);
    console.log(chalk.greenBright("Loading environment variables..."));
    await delay(300);
    console.log(chalk.greenBright("Decrypting API keys..."));
    await delay(300);
    console.log(chalk.greenBright("Establishing secure connection..."));
    await delay(500);
    console.clear();

    console.log(chalk.green.bold("╔══════════════════════════════════════════════════════════════════════════════════╗"));
    console.log(chalk.green.bold("║    █████╗  ██████╗ ██╗   ██╗ █████╗ ███████╗███████╗██████╗ ██╗████████╗███████╗ ║"));
    console.log(chalk.green.bold("║   ██╔══██╗██╔═══██╗██║   ██║██╔══██╗██╔════╝██╔════╝██╔══██╗██║╚══██╔══╝██╔════╝ ║"));
    console.log(chalk.green.bold("║   ███████║██║   ██║██║   ██║███████║███████╗█████╗  ██████╔╝██║   ██║   █████╗   ║"));
    console.log(chalk.green.bold("║   ██╔══██║██║   ██║██║   ██║██╔══██║╚════██║██╔══╝  ██╔══██╗██║   ██║   ██╔══╝   ║"));
    console.log(chalk.green.bold("║   ██║  ██║╚██████╔╝╚██████╔╝██║  ██║███████║███████╗██║  ██║██║   ██║   ███████╗ ║"));
    console.log(chalk.green.bold("║   ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝   ╚═╝   ╚══════╝ ║"));
    console.log(chalk.green.bold("║                                                                                  ║"));
    console.log(chalk.green.bold("║                               [ AQUAFRITZ SERVER ]                               ║"));
    console.log(chalk.green.bold("╚══════════════════════════════════════════════════════════════════════════════════╝"));

    await delay(400);
    const lines = [
      { label: "STATUS", value: "ONLINE ✅", color: chalk.greenBright },
      { label: "ENV", value: process.env.NODE_ENV || "development", color: chalk.cyanBright },
      { label: "HOST", value: `http://localhost:${port}`, color: chalk.yellowBright },
      { label: "SECRET", value: SECRET ? "Loaded 🔐" : "Missing ❌", color: chalk.magentaBright },
      { label: "PID", value: process.pid.toString(), color: chalk.whiteBright },
    ];

    console.log();
    console.log(chalk.green("┌" + "─".repeat(56) + "┐"));
    for (const l of lines) {
      await delay(150);
      console.log(
        chalk.green(
          `│ ${chalk.bold(l.label.padEnd(8))}: ${l.color(l.value.padEnd(42))} │`
        )
      );
    }
    console.log(chalk.green("└" + "─".repeat(56) + "┘"));

    console.log();
    await delay(200);
    log("// System secured. Awaiting connections...", chalk.green.dim);
    await delay(300);
    log("// Press Ctrl+C to terminate.", chalk.green.dim);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      const newPort = port + 1;
      console.log(chalk.red(`❌ Port ${port} is already in use.`));
      console.log(chalk.yellow(`🔄 Trying port ${newPort} instead...`));
      setTimeout(() => startServer(newPort), 1000);
    } else {
      console.error(chalk.red(`💥 Server error: ${err.message}`));
    }
  });
};

const initialPort = parseInt(process.env.PORT || 4242, 10);
startServer(initialPort);