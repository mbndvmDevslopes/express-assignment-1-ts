import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";
import { PrismaClientValidationError } from "@prisma/client/runtime";

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
    res.status(204).send("No data");
  }
  res.status(200).send(dog);
});

/* app.post("/dogs", (req) => {
  const body = req.body;
});
 */
app.delete("/dogs/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const deletedDog = await prisma.dog.delete({
      where: {
        id,
      },
    });
    res.status(200).send(deletedDog);
  } catch (error) {
    console.error(error);
  }
});

app.patch("/dogs/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body;

  try {
    const updatedDog = await prisma.dog.update({
      where: {
        id,
      },
      data,
    });
    res.status(201).send(updatedDog);
  } catch (error) {
    if (error instanceof PrismaClientValidationError) {
      console.error(
        "Prisma Validation Error:",
        error.message
      );
      res
        .status(400)
        .send({ error: "Invalid update data" });
    } else {
      console.error("Error updating dog:", error);
      res
        .status(500)
        .send({ error: "Internal Server Error" });
    }
  }
});


app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
