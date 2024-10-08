import bodyParser from "body-parser";

export default async (client: ExtendedClient) => {
    client.app.use(bodyParser.json());

    client.app.post("/payment", (req, res) => {
        client.emit("bdsd", req.body);
        res.send("OK");
    });

    client.app.get("/", (req, res) => {
        res.send("Hello world");
    });

    client.app.listen(process.env.PORT, () =>
        client.logger.success(`Start express server at port: ${process.env.PORT}`),
    );
};
