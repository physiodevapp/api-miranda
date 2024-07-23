import express from 'express';

export const app = express();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`The app is running at port ${port}`);
})