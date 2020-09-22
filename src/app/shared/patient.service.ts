import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Patient } from './patient.model';

@Injectable({
	providedIn: 'root'
})
export class PatientService {
	formData: Patient;
	constructor(private firestore: AngularFirestore) {}

	viewPatients() {
		return this.firestore.collection('patient-data').snapshotChanges();
	}

}
