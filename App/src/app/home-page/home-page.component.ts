import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
	selector: 'app-home-page',
	templateUrl: './home-page.component.html',
	styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
	provinceArray: any[] = [];
	townshipArray: any[] = [];
	typeRoadArray: any[] = [];
	streetArray: any[] = [];

	provinceElem: any;
	cpElem: any;
	townshipElem: any;
	typeRoadElem: any;
	streetElem: any;
	numberElem: any;

	constructor(private http: HttpClient, private router: Router) { }

	ngOnInit() {
		this.provinceElem = document.getElementById('province') as HTMLSelectElement;
		this.cpElem = document.getElementById('cp') as HTMLInputElement;
		this.townshipElem = document.getElementById('township') as HTMLSelectElement;
		this.typeRoadElem = document.getElementById('typeRoad') as HTMLSelectElement;
		this.streetElem = document.getElementById('street') as HTMLSelectElement;
		this.numberElem = document.getElementById('number');

		this.getProvinceData();

		this.provinceElem.addEventListener('change', this.getTownshipData);

		this.cpElem.addEventListener('input', this.getProvinceData)

		this.townshipElem.addEventListener('change', this.getTypeRoadData);
		this.townshipElem.addEventListener('change', this.getStreetData);

		this.typeRoadElem.addEventListener('change', this.enableNumber)
		this.typeRoadElem.addEventListener('change', this.getStreetData)

		this.streetElem.addEventListener('change', this.enableNumber)
		this.streetElem.addEventListener('change', this.getTypeRoadData)
	}

	getCp = () => this.cpElem?.value.length >= 4 ? (this.cpElem.value.length === 4 ? this.cpElem.value : (this.cpElem.value.substring(0, 1) == '0' ? this.cpElem.value.substring(1) : this.cpElem.value)) : '';

	getProvinceData = () => {
		this.townshipElem?.setAttribute('disabled', '');
		this.typeRoadElem?.setAttribute('disabled', '');
		this.streetElem?.setAttribute('disabled', '');
		this.numberElem?.setAttribute('disabled', '');

		const cp = this.getCp();
		this.http.get(`http://127.0.0.1:8000/getProvinces/${cp}`).subscribe((res: any) => {
			this.provinceArray = [];
			res.map((elem: any) => this.provinceArray.push(elem.provincia));
		});
	}

	getTownshipData = () => {
		this.typeRoadElem?.setAttribute('disabled', '');
		this.streetElem?.setAttribute('disabled', '');
		this.numberElem?.setAttribute('disabled', '');

		const cp = this.getCp();
		this.http.get(`http://127.0.0.1:8000/getTownship/${this.provinceElem.value}/${cp}`).subscribe((res: any) => {
			this.townshipArray = [];
			res.map((elem: any) => this.townshipArray.push(elem.municipio))
			this.townshipElem.removeAttribute('disabled');
		});
	}

	getTypeRoadData = () => {
		this.numberElem?.setAttribute('disabled', '');

		const cp = this.getCp();
		this.http.get(`http://127.0.0.1:8000/getTypeRoad/${this.provinceElem.value}/${this.townshipElem.value}/${this.streetElem.value}/${cp}`).subscribe((res: any) => {
			this.typeRoadArray = [];
			res.map((elem: any) => this.typeRoadArray.push(elem.tipovia))
			this.typeRoadElem.removeAttribute('disabled');
		});
	}

	getStreetData = () => {
		this.numberElem?.setAttribute('disabled', '');

		const cp = this.getCp();
		this.http.get(`http://127.0.0.1:8000/getStreet/${this.provinceElem.value}/${this.townshipElem.value}/${this.typeRoadElem.value}/${cp}`).subscribe((res: any) => {
			this.streetArray = [];
			res.map((elem: any) => this.streetArray.push(elem.calle))
			this.streetElem.removeAttribute('disabled');
		});
	}

	enableNumber = () => {
		if (this.typeRoadElem.value !== '' && this.streetElem.value !== '') {
			this.numberElem.removeAttribute('disabled');
			console.log(this.numberElem);
		}
	}

	findProducts = () => {

	}
}
