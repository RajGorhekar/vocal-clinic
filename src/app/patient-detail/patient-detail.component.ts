import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { FirebaseService } from '../shared/firebase.service';
import { AngularFirestore } from '@angular/fire/firestore';

import { PatientService } from '../shared/Patient.service';
import { ToastrService } from 'ngx-toastr';

@Component({
	selector: 'app-patient-detail',
	templateUrl: './patient-detail.component.html',
	styleUrls: [ './patient-detail.component.css' ]
})
export class PatientDetailComponent implements OnInit {
	public patientId;
	patientInfo: any;
	public doctor: any;
	constructor(
		private route: ActivatedRoute,
		private firestore: AngularFirestore,
		public service: PatientService,
		public fs: FirebaseService,
		private toastr: ToastrService,
		private router: Router
	) {}

	ngOnInit() {
		this.fs.loading = true;
		let id = this.route.snapshot.paramMap.get('id');
		this.patientId = id;
		this.firestore
			.collection('patient-data')
			.ref.doc(this.patientId)
			.get()
			.then((doc) => {
				this.patientInfo = doc.data();
				console.log(this.patientInfo);
				this.fs.loading = false;
			})
			.catch((err) => {
				console.log(err);
				this.fs.loading = false;
			});
		this.signDocument();
	}

	signDocument = () => {
		this.doctor = JSON.parse(localStorage.getItem('user'));
		console.log(this.doctor);
	};

	editPrescription = (title: string, doctorname: string) => {
		this.fs.loading = true;
		console.log(title);
		this.firestore
			.doc('patient-data/' + this.patientId)
			.update({ prescription: title, doctor: doctorname, answered: 'true' });
		this.fs.loading = false;
		this.generatePDF();
		this.toastr.success('', 'Updated a Patient successfully');
		// this.router.navigate([ '/doctor' ]);
	};

	generatePDF = () => {
		print();
	};

	sendPDF = () => {};
}
