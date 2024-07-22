
import Express from 'express';
import { router as routes } from './config/routes.config';
import logger from 'morgan';

const app = Express();

app.use(logger("dev"));

app.use('/v1', routes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`The app is running at port ${port}`);
})