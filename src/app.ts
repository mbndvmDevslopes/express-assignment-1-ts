import express, { Request, Response } from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";
import e from "express";

const app = express();
app.use(express.json());

const checkValidKeys = (req: Request, res: Response) => {
  const validKeys = ["name", "description", "breed", "age"];
  const bodyKeys = Object.keys(req.body);
  const invalidKeys: string[] = [];

  for (const key of bodyKeys) {
    if (!validKeys.includes(key)) {
      invalidKeys.push(key);
    }
  }

  if (invalidKeys.length > 0) {
    const errorMessages = invalidKeys.map(
      (key) => `'${key}' is not a valid key`
    );
    return res.status(400).send({ errors: errorMessages });
  }
};

app.get("/", (_req, res) => {
  return res.json({ message: "Hello World!" }).status(200); // the 'status' is unnecessary but wanted to show you how to define a status
});

app.get("/dogs", async (_, res) => {
  const dogs = await prisma.dog.findMany();
  return res.status(200).send(dogs);
});

app.get("/dogs/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
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
    return res.status(204).send("No data");
  }
  return res.status(200).send(dog);
});

app.post("/dogs", async (req, res) => {
  const errorArray = [];
  const body = req.body;
  checkValidKeys(req, res);
  try {
    if (typeof body.name !== "string") {
      errorArray.push("name should be a string");
    }
    if (typeof body.description !== "string") {
      errorArray.push("description should be a string");
    }
    if (typeof body.breed !== "string") {
      errorArray.push("breed should be a string");
    }
    if (typeof body.age !== "number") {
      errorArray.push("age should be a number");
    }
    if (errorArray.length > 0) {
      return res.status(400).json({ errors: errorArray });
    }

    const newDog = await prisma.dog.create({
      data: {
        ...body,
      },
    });
    return res.status(201).send(newDog);
  } catch (error) {
    return res.status(400).send("error");
  }
});

app.delete("/dogs/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).send({
      message: "id should be a number",
    });
  }
  try {
    const deletedDog = await prisma.dog.delete({
      where: { id },
    });
    res.status(200).send(deletedDog);
  } catch (e) {
    return res.status(204).send("error deleting dog");
  }
});

app.patch("/dogs/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  checkValidKeys(req, res);
  try {
    await prisma.dog.update({
      where: {
        id,
      },
      data: req.body,
    });
    return res.status(201).send(req.body);
  } catch (error) {
    console.error("Error updating dog:", error);
    return res
      .status(500)
      .send({ error: "There was an error updating dog" });
  }
});
app.use(errorHandleMiddleware);
const port = process.env.NODE_ENV === "test" ? 3001 : 3007;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
