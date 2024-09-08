const express = require("express");
const morgan = require("morgan");
const app = express();
app.use(express.json());

morgan.token("content", function (req, res) {
    const person = JSON.stringify(req.body);
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

app.get("/", (request, response) => {
    response.send("<h1>Hello World</h1>");
});

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
    persons = persons.filter((person) => person.id !== id);
    response.status(204).end();
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

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
