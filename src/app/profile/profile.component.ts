import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Doctor } from '../shared/doctor.model';
import { FirebaseService } from '../shared/firebase.service';
@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: [ './profile.component.css' ]
})
export class ProfileComponent implements OnInit {
	user: Doctor;
	address = [];
	qualification = [];
	
	constructor(private route: ActivatedRoute, private router: Router, public firebaseService: FirebaseService) {
		if (localStorage.getItem('user') === null && localStorage.getItem('admin') === 'false') {
			this.router.navigate([ '/login' ]);
		}
		this.user = this.router.getCurrentNavigation().extras.state.user as Doctor;
	}

	ngOnInit(): void {
		if (localStorage.getItem('user') === null && localStorage.getItem('admin') === 'false') {
			this.router.navigate([ '/login' ]);
		} else {
			this.address = this.user['address'].toString().split(',');
			let a = this.user['qualification'].toString().split(',,');
			let i = 0;

			for (i = 0; i < a.length; i++) {
				this.qualification.push(a[i].split(','));
			}

			console.log(this.address, this.qualification);
		}
	}

	logout(): void {
		this.firebaseService.logout();
		this.firebaseService.logout();
		localStorage.setItem('admin', 'false');
		this.router.navigate([ '/login' ]);
	}

	goBack() {
		// this.router.navigate([ '/doctor' ]);
		window.history.back();
	}
}
