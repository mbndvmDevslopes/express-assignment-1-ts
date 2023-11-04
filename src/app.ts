import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Hello World!" }).status(200); // the 'status' is unnecessary but wanted to show you how to define a status
});

app.get("/dogs", async (req, res) => {
  const dogs = await prisma.dog.findMany();
  res.status(200).send(dogs);
});

app.get("/dogs/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  console.log("type of id:", typeof id);
  if (typeof id !== "number") {
    return res.status(400).send({
      message: "id should be a number",
    });
  }
  const dog = await prisma.dog.findUnique({
    where: {
      id,
    },
  });

  if (!dog) {
    res.status(204).send("No data");
  }
  res.status(200).send(dog);
});

app.post("/dogs", (req, res) => {
  const body = req.body;
});

app.delete("/dogs/:id", (req, res) => {
  const id = parseInt(req.params.id);
});

app.patch("/dogs/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;
  console.log(req.body)
   if (req.body.name || req.body.description || req.body.breed || req.body.age) {
   
     const updatedDog = await prisma.dog.update({
       where: {
         id,
       },
       data: body,
     });
  } 
  else {
    return  res.status(500).send({message:`${req.body} is not a valid key`})
  }
});
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
