import Express from 'express';

export const app = Express();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`The app is running at port ${port}`);
})