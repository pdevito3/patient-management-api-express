import { Router } from 'express';
import {getAllPatientsEndpoint} from '~/domain/patients/features/getAllPatients';
import {getPatientByIdEndpoint} from '~/domain/patients/features/getPatientById';
import {createPatientEndpoint} from '~/domain/patients/features/createPatient';
import {updatePatientEndpoint} from '~/domain/patients/features/updatePatient';
import {deletePatientEndpoint} from '~/domain/patients/features/deletePatient';

const router = Router();

router.get('/', getAllPatientsEndpoint);
router.get('/:id', getPatientByIdEndpoint);
router.post('/', createPatientEndpoint);
router.put('/:id', updatePatientEndpoint);
router.delete('/:id', deletePatientEndpoint);

export default router;
