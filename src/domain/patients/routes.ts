import { Router } from 'express';
import {getAllPatients} from '~/domain/patients/features/getAllPatients';
import {getPatientById} from '~/domain/patients/features/getPatientById';
import {createPatient} from '~/domain/patients/features/createPatient';
import {updatePatient} from '~/domain/patients/features/updatePatient';
import {deletePatient} from '~/domain/patients/features/deletePatient';

const router = Router();

router.get('/', getAllPatients);
router.get('/:id', getPatientById);
router.post('/', createPatient);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

export default router;
