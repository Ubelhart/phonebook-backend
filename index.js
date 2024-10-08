require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

morgan.token('content', function (request) {
    const person = JSON.stringify(request.body)
    return person
})

app.use(
    morgan(
        ':method :url :status :res[content-length] - :response-time ms :content'
    )
)

app.get('/api/persons', (request, response, next) => {
    Person.find({})
        .then((persons) => {
            response.json(persons)
        })
        .catch((error) => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then((person) => {
            response.json(person)
        })
        .catch((error) => next(error))
})

app.get('/info', (request, response, next) => {
    const currentDate = new Date()
    Person.find({})
        .then((persons) => {
            response.send(`<p>Phonebook has info for ${persons.length}</p>
                                <p>${currentDate}</p>`)
        })
        .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then((result) => {
            response.status(200).json(result)
        })
        .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    if (request.body.number) {
        const newNumber = {
            number: request.body.number
        }

        return Person.findByIdAndUpdate(request.params.id, newNumber, {
            new: true,
            runValidators: true,
            context: 'query'
        })
            .then((updatedPerson) => {
                response.status(200).json(updatedPerson)
            })
            .catch((error) => next(error))
    }
    return response(400).json({ error: 'number missing' })
})

app.post('/api/persons', (request, response, next) => {
    const { name, number } = request.body
    if (!name) {
        return response.status(400).json({ error: 'name missing' })
    }
    if (!number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    Person.findOne({ name: name })
        .then((verificatedNamePerson) => {
            if (verificatedNamePerson) {
                return response.status(400).json({
                    error: 'name already exist'
                })
            }
            const person = new Person({
                name: name,
                number: number
            })
            const error = person.validateSync()
            if (error) {
                return response.status(400).json({ error: error.message })
            }
            person
                .save()
                .then((result) => {
                    response.json(result)
                })
                .catch((error) => next(error))
        })
        .catch((error) => next(error))
})

const unknownEndPoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndPoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
