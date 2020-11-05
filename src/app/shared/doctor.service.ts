import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Doctor } from './doctor.model';

@Injectable({
	providedIn: 'root'
})
export class DoctorService {
	formData: Doctor;
	constructor(private firestore: AngularFirestore) {}

	getDoctors() {
		return this.firestore.collection('doctors').snapshotChanges();
	}
}
