import { Component, OnInit, Injector, Inject, PLATFORM_ID, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';
import { ActivatedRoute, Router } from '@angular/router';

import { isPlatformServer } from '@angular/common';
import { TransferState, makeStateKey } from '@angular/platform-browser';

const configKey = makeStateKey('CONFIG');
declare var webkitSpeechRecognition: any;

import { FirebaseService } from '../shared/firebase.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';

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
	public personalData: any;
	public messagedAndDeleted = false;
	public isadmin = false;

	@ViewChild('gSearch') formSearch;
	@ViewChild('searchKey') hiddenSearchHandler;

	@ViewChild('presInput', {static: true}) myInput: ElementRef;

	constructor(
		private route: ActivatedRoute,
		private firestore: AngularFirestore,
		public service: PatientService,
		public fs: FirebaseService,
		private storage: AngularFireStorage,
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
		} else if (localStorage.getItem('admin') === 'true') {
			this.isadmin = true;
			console.log(this.isadmin);
		}
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
				this.firestore
					.collection('patients')
					.ref.doc(this.patientInfo.contact)
					.get()
					.then((doc) => {
						if (doc.exists) {
							this.personalData = doc.data();
							console.log('Document data:', this.personalData);
							this.fs.loading = false;
						} else {
							//edge case handling
							this.messagedAndDeleted = true;
							this.messageAndDelete(this.patientId);
							console.log('No such document!');
							this.fs.loading = false;
						}
					})
					.catch((err) => {
						console.log(err);
						this.fs.loading = false;
					});
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

	messageAndDelete = (id) => {
		this.firestore
			.collection('patient-data')
			.ref.doc(this.patientId)
			.get()
			.then((doc) => {
				if (doc.exists) {
					this.sendPDF(null);
					// doc.ref.delete();
					console.log('Document deleted');
				} else {
					console.log('No such document!');
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	editPrescription = (title: string, doctorname: string, message: string) => {
		if (title.length < 20) {
			this.toastr.error('', 'Prescription too Short\nMinimum 20 characters Required');
		} else {
			this.fs.loading = true;
			this.firestore
				.doc('patient-data/' + this.patientId)
				.update({ prescription: title, doctor: doctorname, answered: 'true' });
			this.fs.loading = false;
			// this.generatePDF();
			this.toastr.success('', message);
			// this.sendPDF(null);
		}
	};

	calculate_age(dateString: string) {
		var today = new Date();
		var birthDate = new Date(dateString.slice(0, 10));
		var age = today.getFullYear() - birthDate.getFullYear();
		var m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	}

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

	async generatePDF(title: string, doctorname: string, message: string) {
		if (title.length < 20) {
			this.toastr.error('', 'Prescription too Short');
		} else {
			await this.editPrescription(title, doctorname, message);
			var time = Date().replace('GMT+0530 (India Standard Time)', '').trim().replace(/\s/g, '_');
			console.log(time);
			this.hid = true;
			await this.delay(1000);
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

				// to save as Pdf
				let pdf = new jsPDF('p', 'mm', 'a4', true); // A4 size page of PDF
				pdf.addImage(contentDataURL, 0, 0, 208, imgHeight);

				const file = pdf.output('blob');

				const filePath = Date.now().toString();
				const fileRef = this.storage.ref('/Prescription/' + filePath + '.pdf');
				const task = this.storage.upload('/Prescription/' + filePath + '.pdf', file);
				task
					.snapshotChanges()
					.pipe(
						finalize(async () => {
							fileRef.getDownloadURL().subscribe((url) => {
								this.sendPDF(url).then(async () => {
									this.toastr.success(
										'',
										'Prescription sucessfully sent to ' + this.personalData.name
									);
									// await this.delay(1000);

									this.hid = false;
									await this.storage.storage
										.refFromURL(url)
										.delete()
										.then(function() {
											console.log('File deleted successfully');
										})
										.catch(function(error) {
											console.log('There was some error deleting the file');
										});
								});
							});
						})
					)
					.subscribe();
			});
		}
	}

	gotoProfile(): void {
		this.router.navigateByUrl('/profile', { state: { user: JSON.parse(localStorage.getItem('user')) } });
	}

	gotoHistory = (num) => {
		this.router.navigate([ '/history', num ]);
	};

	sendPDF = async (url) => {
		// const twilio = require('twilio');
		// const client = twilio('AC33fe860af7a379c7376ea66b03a0c511', '73ace3dba7c201e0182c2ebe4e5d5b53'); raj old
		// const client = twilio('AC90dc856cb90b7b1341b332ee04723879', '2bd8d5d04394c5ae86bc0bd4c81199b4'); afan old
		// const client = twilio('AC33fe860af7a379c7376ea66b03a0c511', '1f88e50fbed07d51124d3571b58aa5dc'); raj new 
		var sendTo = 'whatsapp:';
		let no = this.patientInfo.number;
		console.log(no);
		if (this.patientInfo.contact.length < 10) {
			window.alert('Invalid contact number detected!');
		} else {
			sendTo += '+91' + this.patientInfo.contact.substring(this.patientInfo.contact.length - 10);
		}

		console.log(sendTo);

		const client = twilio('AC90dc856cb90b7b1341b332ee04723879', '10e7becd629e9a5a1d4b6daf3a871dba');

		if (url == null) {
			await client.messages
				.create({
					from: 'whatsapp:+14155238886',
					to: sendTo,
					body:
						'This is *Dr. ' +
						this.doctor.name +
						'* from Vocal Clinic. We are unable to get your details. Please provide all the necessary details to the automated chatbot! .Make sure to select an option of new patient when you are asked for one'
				})
				.then((message) => {
					console.log(message.sid);
				})
				.catch((err) => {
					console.error(err);
				});
		} else {
			await client.messages
				.create({
					// from: 'whatsapp:+14155238886',
					from: 'whatsapp:+14155238886',
					to: sendTo,
					body: 'This is *Dr. ' + this.doctor.name + "* . Here's your prescription. Take care"
				})
				.then((message) => {
					console.log(message.sid);
				})
				.catch((err) => {
					console.error(err);
				});
			await client.messages
				.create({
					from: 'whatsapp:+14155238886',
					to: sendTo,
					body: 'Prescription_for_' + this.personalData.name.replace(' ', '_'), //showing as undefined in watsapp solve this
					mediaUrl: url
					// 'https://firebasestorage.googleapis.com/v0/b/vocal-clinic.appspot.com/o/Prescriptions%2Fprescription_Fri_Oct_16_2020_12_13_17.pdf?alt=media&token=a1fcd057-9ca6-4512-b1c9-6cd20d553014'
				})
				.then((message) => {
					console.log(message.sid);
				})
				.catch((err) => {
					console.error(err);
				});
		}
	};
}
