const express=require("express");
const app=express();
const port=5000;
app.use(express.json());
const mongoose=require("mongoose")

app.listen(port,()=>{
    console.log("Server is running at port ",port);
})

async function connectToDatabase() {
    try {
        await mongoose.connect("mongodb+srv://kazifaruq:P5jwF0heTgAaYCRP@cluster0.9du46.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
        });
        console.log('Database connected successfully..');
    } catch (err) {
        console.error('Database connection error:', err);
    }
}

// Call the function to connect to the database
connectToDatabase();


//creating schema
const bookSchema=new mongoose.Schema({
    Title:{
        type: String,
        required: true, // Title is required
    },
    Author: {
        type: String,
        required: true, // Author is required
    },
    PublishedYear: {
        type: Number,
        required: true, // PublishedYear is required
        min: 1450, // Minimum year (e.g., year of the first printed book)
        max: new Date().getFullYear(), // Maximum year (current year)
    },
    Genre: {
        type: String,
        required: true, // Genre is required
    },
    Available: {
        type: Boolean,
        default: true, // Default value for Available
    }
})

const BookCollection=mongoose.model('BookTable',bookSchema);

// POST /books: To add a new book
app.post("/books", async (req, res) => {
    const bookData = req.body;
    try {
        const book = await BookCollection.create(bookData);
        res.status(201).send({msg:"Record has been added..",book});
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: "Validation Error", errors: err.errors });
        }
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// 2. GET /books: To fetch all books
app.get("/books", async (req, res) => {
    try {
        const books = await BookCollection.find();
        res.status(200).send({msg:"List of Books",books});
    } catch (err) {
        res.status(500).send({msg:"Error=",err});
    }
});

// 3. GET /books/:id: To fetch a single book by its ID
app.get("/books/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const book = await BookCollection.findById(id);
        if (!book) {
            return res.status(404).send({ msg: "Book not found",id });
        }
        res.status(200).send({msg:"Book is found..",book});
    } catch (err) {
        return res.status(400).send({ message: "Invalid ID format" });
    }
});


// PUT /books/:id: To update the details of a book by its ID
app.put("/books/:id", async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    try {
        const book = await BookCollection.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!book) {
            return res.status(404).send({ message: "Book not found" });
        }
        res.status(200).send(book);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: "Validation Error", errors: err.errors });
        }
        return res.status(400).send({ message: "Invalid ID format" });
    }
});


// DELETE /books/:id: To delete a book by its ID
app.delete("/books/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const book = await BookCollection.findByIdAndDelete(id);
        if (!book) {
            return res.status(404).send({ message: "Book not found" });
        }
        res.status(200).send({ message: "Book deleted successfully" });
    } catch (err) {
        return res.status(400).send({ message: "Invalid ID format" });
    }
});
