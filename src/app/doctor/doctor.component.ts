import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FirebaseService } from '../shared/firebase.service';
import { Patient } from '../shared/patient.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { PatientService } from 'src/app/shared/Patient.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { JsonPipe } from '@angular/common';

@Component({
	selector: 'app-doctor',
	templateUrl: './doctor.component.html',
	styleUrls: [ './doctor.component.css' ]
})
export class DoctorComponent implements OnInit {
	@Output() isLogout = new EventEmitter<void>();

	list: Patient[];
	public isloggedin: boolean = false;
	index: number = 0;
	constructor(
		public service: PatientService,
		public firebaseService: FirebaseService,
		private firestore: AngularFirestore,
		private toastr: ToastrService,
		private router: Router,
		private route: ActivatedRoute
	) {}

	setList = (x : Patient[]) => {
		this.list = x;
	};

	ngOnInit() {
		this.firebaseService.loading = true;
		var loggedInUser = localStorage.getItem('user');

		if (loggedInUser !== null) {
			this.isloggedin = true;
			this.service.viewPatients().subscribe((actionArray) => {
				let templist = [];

				if (localStorage.getItem('admin') === 'true') {
					for (let item in actionArray) {
						if (actionArray[item].payload.doc.data()['answered'] === "false") {
							templist.push({
								id: actionArray[item].payload.doc.id,
								...actionArray[item].payload.doc.data() as {}
							} as Patient);
						}
					}
				} else {
					let doctorType = JSON.parse(loggedInUser)['type'];
					for (let item in actionArray) {
						let patientRequires = actionArray[item].payload.doc.data()['type'];
						// patientRequires == doctorType
						if (patientRequires == doctorType && actionArray[item].payload.doc.data()['answered'] === "false") {
							templist.push({
								id: actionArray[item].payload.doc.id,
								...actionArray[item].payload.doc.data() as {}
							} as Patient);
						}
					}
				}

				this.setList(templist);

				// this.list = actionArray.map((item) => {
				// 	if (item.payload.doc.data()['type'] == JSON.parse(loggedInUser)['type']) {
				// 		return {
				// 			id: item.payload.doc.id,
				// 			...item.payload.doc.data() as {}
				// 		} as Patient;
				// 	}
				// });
				if (templist.length == 0) {
					this.ngOnInit();
				}
				console.log(templist);
				this.firebaseService.loading = false;
			});
		} else {
			this.isloggedin = false;
		}
	}

	toggleTab = (x : number) => {
		this.index = x
		this.service.viewPatients().subscribe((actionArray) => {
			let templist = [];
			for (let item in actionArray) {
				let patientRequires = actionArray[item].payload.doc.data()['type'];
				let fetchfor = ""
				if(x == 0){
					fetchfor = "false"
				} else{
					fetchfor = "true"
				}
				if (localStorage.getItem('admin') === 'true') {
					if (actionArray[item].payload.doc.data()['answered'] === fetchfor) {
						templist.push({
							id: actionArray[item].payload.doc.id,
							...actionArray[item].payload.doc.data() as {}
						} as Patient);
					}
				}else{
					let doctorType = JSON.parse(localStorage.getItem('user'))['type'];
					if (patientRequires == doctorType && actionArray[item].payload.doc.data()['answered'] === fetchfor) {
						templist.push({
							id: actionArray[item].payload.doc.id,
							...actionArray[item].payload.doc.data() as {}
						} as Patient);
					}
				}

				
			}
			this.setList(templist);
		});
	}

	createPrescription(patient: Patient) : void {
		this.router.navigate([ '/patients', patient.id ]);
	}

	logout() : void {
		this.firebaseService.logout();
		this.firebaseService.logout();
		localStorage.setItem('admin', 'false');
		this.router.navigate([ '/login' ]);
	}

	gotoProfile(): void {
		this.router.navigateByUrl('/profile', { state: { user : JSON.parse(localStorage.getItem('user')) } });
	}

}
