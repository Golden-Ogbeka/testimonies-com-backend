import { Router } from 'express';
import { AdminController } from '../../controllers/admin';

const AdminRouter = Router();
const Controller = AdminController();

export default AdminRouter;
