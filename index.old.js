const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const { addBlog,getAllBlogs,getBlogById,deleteBlog } = require('./src/controllers/controllers/blogController.js')
const { sendMail } = require('./src/controllers/controllers/emailController.js')

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://kokareshraddha5_db_user:kokareshraddha5_db_user@cluster0.0ort1bw.mongodb.net/awscc_blogs?retryWrites=true&w=majority&appName=Cluster0")
.then(() => {
  console.log(" MongoDB Connected Successfully")
})
.catch((err) => {
  console.error(" MongoDB Connection Error:", err.message)
})

app.post("/addBlog",addBlog);

app.get("/blogs", getAllBlogs)

app.get("/blogs/:id", getBlogById)

app.delete("/blogs/:id", deleteBlog)

app.post("/sendEmail", sendMail);

app.listen(3001, () => {
    console.log("Server is Running")
})
