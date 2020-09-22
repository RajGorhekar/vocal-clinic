import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../shared/firebase.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: [ './login.component.css' ]
})
export class LoginComponent implements OnInit {
	title = 'vocal-clinic';
	isSignedIn = false;
	isAdmin = false;
	constructor(public firebaseService: FirebaseService, private router: Router, private route: ActivatedRoute) {}
	ngOnInit() {
		if (localStorage.getItem('user') !== null) {
			this.isSignedIn = true;
			console.log('signed in');
			if (localStorage.getItem('admin') === 'true') {
				this.isAdmin = true;
				console.log('as admin');
			}
		} else this.isSignedIn = false;
	}

	async verifyLogin(email: string, password: string) {
		this.firebaseService.loading = true;
		await this.firebaseService.signin(email, password);
		if (this.firebaseService.isLoggedIn && email !== 'admin@admin.com') {
			this.isSignedIn = true;
			this.router.navigate([ '/doctor' ]);
		} else if (this.firebaseService.isLoggedIn && email == 'admin@admin.com') {
			this.isAdmin = true;
			localStorage.setItem('admin', 'true');
			this.router.navigate([ '/admin' ]);
		}
		this.firebaseService.loading = false;
	}
}
