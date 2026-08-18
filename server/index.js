import express from 'express'

const app = express()

app.use(express.static('.'))
app.use(express.urlencoded({ extended: true }));

app.listen(3500, () => {
  console.log(`Server started successfully! Access it at: http://localhost:${3500}/public`);
})