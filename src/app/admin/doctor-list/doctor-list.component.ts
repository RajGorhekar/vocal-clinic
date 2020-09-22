import { AngularFirestore } from '@angular/fire/firestore';
import { Component, OnInit } from '@angular/core';
import { DoctorService } from 'src/app/shared/doctor.service';
import { Doctor } from 'src/app/shared/doctor.model';
import { ToastrService } from 'ngx-toastr';

@Component({
	selector: 'app-doctor-list',
	templateUrl: './doctor-list.component.html',
	styleUrls: [ './doctor-list.component.css' ]
})
export class DoctorListComponent implements OnInit {
	list: Doctor[];
	constructor(public service: DoctorService, private firestore: AngularFirestore, private toastr: ToastrService) {}

	ngOnInit() {
		this.service.getDoctors().subscribe((actionArray) => {
			this.list = actionArray.map((item) => {
				return {
					id: item.payload.doc.id,
					...item.payload.doc.data() as {}
				} as Doctor;
			});
		});
	}

	onEdit(doc: Doctor) {
		this.service.formData = Object.assign({}, doc);
		
	}

	onDelete(id: string) {
		if (confirm('Are you sure to delete this record?')) {
			this.firestore.doc('doctors/' + id).delete();
			this.toastr.warning('', 'Deleted successfully');
		}
	}
}
