const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.static("dist"));
app.use(express.json());

morgan.token("content", function (request) {
    const person = JSON.stringify(request.body);
    return person;
});

app.use(
    morgan(
        ":method :url :status :res[content-length] - :response-time ms :content"
    )
);

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122"
    }
];

app.get("/api/persons", (request, response) => {
    response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find((person) => person.id === id);
    if (person) {
        return response.json(person);
    }
    response.status(404).end();
});

app.get("/info", (request, response) => {
    const currentDate = new Date();
    response.send(`<p>Phonebook has info for ${persons.length}</p>
                            <p>${currentDate}</p>`);
});

app.delete("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);
    const deletedPerson = persons.find((person) => person.id === id);
    persons = persons.filter((person) => person.id !== id);
    response.status(200).json(deletedPerson);
});

app.put("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);
    const updatedPerson = persons.find((person) => {
        return person.id === id;
    });
    if (request.body.number) {
        updatedPerson.number = request.body.number;
        return response.status(200).json(updatedPerson);
    }
    return response(400).json({ error: "name missing" });
});

app.post("/api/persons", (request, response) => {
    const newPerson = request.body;
    if (!newPerson.name) {
        return response.status(400).json({ error: "name missing" });
    }
    if (!newPerson.number) {
        return response.status(400).json({
            error: "number missing"
        });
    }

    const verificatedNamePerson = persons.some(
        (person) => person.name === newPerson.name
    );
    if (verificatedNamePerson) {
        return response.status(400).json({
            error: "name already exist"
        });
    }

    const id = Math.floor(Math.random() * 999);
    newPerson.id = id;
    persons = persons.concat(newPerson);
    response.json(newPerson);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
