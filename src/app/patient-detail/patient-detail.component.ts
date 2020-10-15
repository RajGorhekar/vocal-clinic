import { Component, OnInit, Injector, Inject, PLATFORM_ID, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';
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
import { element } from 'protractor';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import * as twilio from 'twilio';

@Component({
	selector: 'app-patient-detail',
	templateUrl: './patient-detail.component.html',
	styleUrls: [ './patient-detail.component.css' ]
})
export class PatientDetailComponent implements OnInit {
	exportAsConfig: ExportAsConfig = {
		type: 'png',
		elementIdOrContent: 'element'
	};

	public patientId;
	patientInfo: any;
	public doctor: any;
	public valueForButton = 'Use Voice';
	public hid = false;

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
		// console.log(title);
		this.firestore
			.doc('patient-data/' + this.patientId)
			.update({ prescription: title, doctor: doctorname, answered: 'true' });
		this.fs.loading = false;
		// this.generatePDF();
		this.toastr.success('', 'Updated a Patient successfully');
		// this.router.navigate([ '/doctor' ]);
	};

	public voiceSearch = () => {
		console.log('object');
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
				document.getElementById('mybtn').innerHTML = 'Use Voice';
			};
			vSearch.onerror = function(e) {
				console.log(e);
				vSearch.stop();
				document.getElementById('mybtn').innerHTML = 'Use Voice';
			};
		} else {
			console.log(this.state.get(configKey, undefined as any));
			document.getElementById('mybtn').innerHTML = 'Use Voice';
		}
	};

	delay(ms: number) {
		console.log('delay Called');
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async generatePDF() {
		var time = Date().replace('GMT+0530 (India Standard Time)', '').trim().replace(/\s/g, '_');
		console.log(time);
		this.hid = true;
		console.log(this.hid);
		await this.delay(1);
		var data = document.getElementById('content');
		html2canvas(data).then((canvas) => {
			console.log(canvas);
			// Few necessary setting options
			var imgHeight = canvas.height * 208 / canvas.width;
			const contentDataURL = canvas.toDataURL('image/png');

			// to save as Image
			// var a = document.createElement('a');
			// a.href = canvas.toDataURL('image/jpeg').replace('image/jpeg', 'image/octet-stream');
			// a.download = 'somefilename.jpg';
			// a.click();


			//to save as Pdf
			// let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
			// pdf.addImage(contentDataURL, 0, 0, 208, imgHeight);
			// pdf.save('prescription_' + time + '.pdf'); // Generated PDF

			this.hid = false;
		});
	}

	gotoProfile(): void {
		this.router.navigateByUrl('/profile', { state: { user: JSON.parse(localStorage.getItem('user')) } });
	}

	sendPDF = () => {
		// const twilio = require('twilio');
		const client = twilio('AC33fe860af7a379c7376ea66b03a0c511', '73ace3dba7c201e0182c2ebe4e5d5b53');
		client.messages
			.create({
				from: 'whatsapp:+14155238886',
				to: 'whatsapp:+918446417445',
				body: 'We have got a Prescription for You',
				// mediaUrl: "https://images.unsplash.com/photo-1602676081572-80c8f64defe5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1910&q=80"
				mediaUrl:
					'https://firebasestorage.googleapis.com/v0/b/vocal-clinic.appspot.com/o/Prescriptions%2Fprescription_Wed_Oct_14_2020_23_58_01.pdf?alt=media&token=53734259-8985-4b4f-a6a6-1ab2589e905f'
			})
			.then((message) => {
				console.log(message.sid);
			})
			.catch((err) => {
				console.error(err);
			});
		client.messages
			.create({
				from: 'whatsapp:+14155238886',
				to: 'whatsapp:+918446417445',
				body:
					'We have got a Prescription for You : https://firebasestorage.googleapis.com/v0/b/vocal-clinic.appspot.com/o/Prescriptions%2Fprescription_Wed_Oct_14_2020_23_58_01.pdf?alt=media&token=53734259-8985-4b4f-a6a6-1ab2589e905f'
			})
			.then((message) => {
				console.log(message.sid);
			})
			.catch((err) => {
				console.error(err);
			});
	};
}
