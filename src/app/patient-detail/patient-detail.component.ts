import { Component, OnInit, Injector, Inject, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { isPlatformServer } from '@angular/common';
import { TransferState, makeStateKey } from '@angular/platform-browser';

const configKey = makeStateKey('CONFIG');
declare var webkitSpeechRecognition: any;

import { FirebaseService } from '../shared/firebase.service';
import { AngularFirestore } from '@angular/fire/firestore';

import { PatientService } from '../shared/Patient.service';
import { ToastrService } from 'ngx-toastr';
import { Patient } from '../shared/patient.model';

@Component({
	selector: 'app-patient-detail',
	templateUrl: './patient-detail.component.html',
	styleUrls: [ './patient-detail.component.css' ]
})
export class PatientDetailComponent implements OnInit {
	public patientId;
	patientInfo: any;
	public doctor: any;
	public valueForButton = 'Give voice Prescription';
	@ViewChild('gSearch') formSearch;
	@ViewChild('searchKey') hiddenSearchHandler;
	constructor(
		private route: ActivatedRoute,
		private firestore: AngularFirestore,
		public service: PatientService,
		public fs: FirebaseService,
		private toastr: ToastrService,
		private router: Router,
		private injector: Injector,
		private state: TransferState,
		@Inject(PLATFORM_ID) private platformid: Object,
		private renderer: Renderer2
	) {
		if (isPlatformServer(this.platformid)) {
			const envJson = this.injector.get('CONFIG') ? this.injector.get('CONFIG') : {};
			this.state.set(configKey, envJson as any);
		}
	}

	ngOnInit() {
		if (localStorage.getItem('user') === null) {
			this.router.navigate([ '/login' ]);
		} else {
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
		// this.generatePDF();
		this.toastr.success('', 'Updated a Patient successfully');
		// this.router.navigate([ '/doctor' ]);
	};

	public voiceSearch = () => {
		if ('webkitSpeechRecognition' in window) {
			const vSearch = new webkitSpeechRecognition();
			vSearch.continuous = false;
			vSearch.interimresults = false;
			document.getElementById('mybtn').innerHTML = 'listening';
			vSearch.lang = 'en-US';
			vSearch.start();
			const voiceSearchForm = this.formSearch.nativeElement;
			const voiceHandler = this.hiddenSearchHandler.nativeElement;
			console.log(voiceSearchForm);
			vSearch.onresult = function(e) {
				console.log(voiceSearchForm);
				voiceHandler.value = e.results[0][0].transcript;
				vSearch.stop();
				console.log(voiceHandler['value']);
				document.getElementById('comment').innerHTML += voiceHandler['value'] + ' ';
				document.getElementById('mybtn').innerHTML = 'Start';
			};
			vSearch.onerror = function(e) {
				console.log(e);
				vSearch.stop();
				document.getElementById('mybtn').innerHTML = 'Start';
			};
		} else {
			console.log(this.state.get(configKey, undefined as any));
			document.getElementById('mybtn').innerHTML = 'Start';
		}
	};

	generatePDF = () => {
		print();
	};

	sendPDF = () => {};
}
