import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DoctorService } from 'src/app/shared/doctor.service';
import { FirebaseService } from 'src/app/shared/firebase.service';
import { NgForm } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { ToastrService } from 'ngx-toastr';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: [ './register.component.css' ]
})
export class RegisterComponent implements OnInit {
	profileFilePath: String;
	signFilePath: String;
	@ViewChild('profilepicreal') profilepicreal: ElementRef;
	@ViewChild('signature') signature: ElementRef;

	DoctorType: ['pediatrician', 'Cardiologist', 'Psychiatrist', 'Neurologist', 'Ortopaedic surgeon', 'ENT specialist'];
	constructor(
		public service: DoctorService,
		public fireservice: FirebaseService,
		private firestore: AngularFirestore,
		private toastr: ToastrService,
		private storage: AngularFireStorage,
		public Auth: AngularFireAuth
	) {}

	ngOnInit(): void {
		this.resetForm();
		this.profileFilePath = '';
	}

	resetForm(form?: NgForm) {
		if (form != null) form.resetForm();
		this.service.formData = {
			id: null,
			name: '',
			email: '',
			address: '',
			contact: '',
			qualification: '',
			type: '',
			profilepic: '',
			signature: ''
		};
	}

	setProfileImage(event) {
		this.profileFilePath = event.target.files[0];
		console.log(this.profileFilePath['name']);
	}

	_handleReaderLoaded(e) {
		console.log('_handleReaderLoaded');
		var reader = e.target;
		console.log(reader.result.split(/,(.+)/)[1]);
		this.signFilePath = reader.result.split(/,(.+)/)[1];
	}

	setSignatureImage(event) {
		this.signFilePath = event.target.files[0];
		console.log(this.signFilePath['name']);
		var reader = new FileReader();
		reader.onload = this._handleReaderLoaded.bind(this);
		reader.readAsDataURL(event.target.files[0]);
	}

	async registerDoctor(form: NgForm) {
		this.fireservice.loading = true;
		if (form.value.id == null) {
			var result = await this.Auth.createUserWithEmailAndPassword(form.value['email'], 'Clinic@123');
			console.log(result.user.uid);

			var filePath = `ProfilePics/${this.profileFilePath['name']
				.split('.')
				.slice(0, -1)
				.join('.')}_${new Date().getTime()}`;
			const fileRef = this.storage.ref(filePath);
			this.storage
				.upload(filePath, this.profileFilePath)
				.snapshotChanges()
				.pipe(
					finalize(() => {
						fileRef.getDownloadURL().subscribe((profileurl) => {
							console.log(profileurl);

							let data = Object.assign({}, form.value);
							delete data.id;
							data['profilepic'] = profileurl;
							data['signature'] = 'data:image/jpg;base64,' + this.signFilePath;
							console.log(data);
							console.log(form.value.id == null);

							this.firestore.collection('doctors').doc(result.user.uid).set(data);
							this.fireservice.loading = false;
							this.resetForm(form);
							this.profilepicreal.nativeElement.value = null;
							this.signature.nativeElement.value = null;
							this.toastr.success('', 'Registered a Doctor successfully');
						});
					})
				)
				.subscribe();
		} else {
			let data = Object.assign({}, form.value);
			console.log(data);
			this.firestore.doc('doctors/' + form.value.id).update(data);
			this.fireservice.loading = false;
			this.toastr.success('', 'Updated a Doctor successfully');
		}
	}
}
