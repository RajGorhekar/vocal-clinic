import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { ToastrService } from 'ngx-toastr';
@Injectable({
	providedIn: 'root'
})
export class FirebaseService {
	isLoggedIn = false;
	loading = false;
	constructor(
		public firebaseAuth: AngularFireAuth,
		private toastr: ToastrService,
		private firestore: AngularFirestore
	) {}
	async signin(email: string, password: string) {
		await this.firebaseAuth
			.signInWithEmailAndPassword(email, password)
			.then((res) => {
				this.isLoggedIn = true;
				this.firestore
					.collection('doctors')
					.ref.doc(res.user.uid)
					.get()
					.then((doc) => {
						localStorage.setItem('user', JSON.stringify(doc.data()));
					})
					.catch((err) => {
						console.log(err);
						this.loading = false;
					});
				localStorage.setItem('user', JSON.stringify(res.user));
			})
			.catch((error) => {
				console.log(error);
				this.toastr.error('', error.message);
				this.loading = false;
			});
	}

	logout() {
		this.firebaseAuth.signOut();
		localStorage.removeItem('user');
		localStorage.setItem('admin', 'false');
	}
}
