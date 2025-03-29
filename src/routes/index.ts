import { Router } from 'express';
import patientRoutes from '../domain/patients/routes';

const router = Router();

router.use('/patients', patientRoutes);

export default router;
