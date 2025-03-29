import { Router } from 'express';
import { 
  getAllPatients, 
  getPatientById, 
  createPatient, 
  updatePatient, 
  deletePatient 
} from './features';

const router = Router();

router.get('/', getAllPatients);
router.get('/:id', getPatientById);
router.post('/', createPatient);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

export default router;
