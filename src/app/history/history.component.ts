import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../shared/firebase.service';
import { Patient } from '../shared/patient.model';

@Component({
	selector: 'app-history',
	templateUrl: './history.component.html',
	styleUrls: [ './history.component.css' ]
})
export class HistoryComponent implements OnInit {
  contact = '';
  list = []

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		public firebaseService: FirebaseService,
		private firestore: AngularFirestore
	) {
		if (localStorage.getItem('user') === null && localStorage.getItem('admin') === 'false') {
			this.router.navigate([ '/login' ]);
		}
	}

	ngOnInit(): void {
		this.contact = this.route.snapshot.paramMap.get('id');
    	this.getHistory();
	}

	getHistory = async () => {
		await this.firestore.collection('patient-data',ref => ref.where("contact","==",	this.contact).where("answered","==",	"true").where("doctor","==",JSON.parse(localStorage.getItem('user')).name)).snapshotChanges().subscribe((actionArray) => {
			for (let item in actionArray) {
        this.list.push({
          id: actionArray[item].payload.doc.id,
          ...actionArray[item].payload.doc.data() as {}
        } as Patient);
			}
    });
    console.log(this.list)
	};

	logout() : void {
		this.firebaseService.logout();
		this.firebaseService.logout();
		localStorage.setItem('admin', 'false');
		this.router.navigate([ '/login' ]);
	}

	gotoProfile(): void {
		this.router.navigateByUrl('/profile', { state: { user : JSON.parse(localStorage.getItem('user')) } });
	}

	goBack() {
		window.history.back();
	}

	createPrescription(patient: Patient) : void {
		this.router.navigate([ '/patients', patient.id ]);
	}

}
