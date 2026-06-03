import dotenv from "dotenv";
import { app } from "./app";

dotenv.config();

const DEFAULT_PORT = 3000;

function resolvePort(value: string | undefined): number {
  if (!value) {
    return DEFAULT_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0) {
    return DEFAULT_PORT;
  }

  return port;
}

const port = resolvePort(process.env.PORT);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
