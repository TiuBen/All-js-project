import express, { Request, Response,NextFunction } from 'express';
import cors from 'cors';
import teamsRoutes from './routes/team.route';
import usersRoutes from './routes/user.route';
import positionsRoutes from './routes/position.route';
import dutyRecordsRoutes from './routes/dutyRecord.route';

const app = express();
const PORT = 3600;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World with TypeScript and Express!');
});





// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use('/api/teams', teamsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/positions', positionsRoutes);
app.use('/api/duty', dutyRecordsRoutes);

// Basic Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 Handler
app.use( (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not Found' });
});


// prisma.position.createMany(
//   {
//     data: [{
//       positionName: "test0",
//       order: 0,
//       isDisplay: true,
//       availableDutyType: {},
//       availableRoleType: {},
//     },
//     {
//       positionName: "test1",
//       order: 2,
//       isDisplay: true,
//       availableDutyType: {},
//       availableRoleType: {},
//     }]
//   }
// ).then(
//   () => console.log('Created Positions:')

// )









app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
