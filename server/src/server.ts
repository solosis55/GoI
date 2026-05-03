import app from "./app.js";

const port = Number(process.env.PORT ?? 4000);

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
