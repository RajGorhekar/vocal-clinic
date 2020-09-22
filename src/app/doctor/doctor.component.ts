import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FirebaseService } from '../shared/firebase.service';
import { Patient } from '../shared/patient.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { PatientService } from 'src/app/shared/Patient.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
	selector: 'app-doctor',
	templateUrl: './doctor.component.html',
	styleUrls: [ './doctor.component.css' ]
})
export class DoctorComponent implements OnInit {
	@Output() isLogout = new EventEmitter<void>();

	list: Patient[];
	public isloggedin = false;
	constructor(
		public service: PatientService,
		public firebaseService: FirebaseService,
		private firestore: AngularFirestore,
		private toastr: ToastrService,
		private router: Router,
		private route: ActivatedRoute
	) {}



	ngOnInit() {
		if (localStorage.getItem('user') !== null) {
			this.isloggedin = true;
		} else {this.isloggedin = false;}
		this.service.viewPatients().subscribe((actionArray) => {
			this.list = actionArray.map((item) => {
				return {
					id: item.payload.doc.id,
					...item.payload.doc.data() as {}
				} as Patient;
			});
		});
		console.log(this.list);
	}

	createPrescription(patient) {
		this.router.navigate([ '/patients', patient.id ]);
	}

	logout() {
		this.firebaseService.logout();
		this.firebaseService.logout();
		localStorage.setItem('admin', 'false');
		this.router.navigate([ '/login' ]);
	}
}
