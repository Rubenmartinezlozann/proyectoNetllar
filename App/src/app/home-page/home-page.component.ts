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
	products: any;

	selectedProvince: string = '';
	selectedTowship: string = '';
	selectedTypeRoad: string = '';
	selectedStreet: string = '';

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
		this.numberElem = document.getElementById('num') as HTMLElement;

		this.getProvinceData();

		this.provinceElem.addEventListener('change', this.getTownshipData);

		this.cpElem.addEventListener('input', this.getProvinceData)

		this.townshipElem.addEventListener('change', this.getTypeRoadData);
		this.townshipElem.addEventListener('change', this.getStreetData);

		this.typeRoadElem.addEventListener('change', this.getStreetData)

		this.streetElem.addEventListener('change', this.getTypeRoadData)

		this.streetElem.addEventListener('change', this.getTypeRoadData)

		document.getElementById("btnConfirm")?.addEventListener('click', this.findProducts);
		document.getElementById("btnClear")?.addEventListener('click', this.clearData);
	}

	getCp = () => /* this.cpElem?.value.length >= 4 ? ( */this.cpElem.value.length === 4 ? this.cpElem.value : (this.cpElem.value.substring(0, 1) == 0 ? this.cpElem.value.substring(1) : this.cpElem.value)/* ) : '' */;

	getProvinceData = () => {
		this.townshipElem?.setAttribute('disabled', '');
		this.typeRoadElem?.setAttribute('disabled', '');
		this.streetElem?.setAttribute('disabled', '');
		this.numberElem?.setAttribute('disabled', '');

		const cp = this.getCp();
		this.http.get(`http://127.0.0.1:8000/getProvinces/${cp}`).subscribe((res: any) => {
			this.provinceArray = [];
			if (this.hideDefaultOption('defaultProvince', res.length === 1)) {
				console.log(res)
				this.provinceArray[0] = res[0].provincia;
				this.selectedProvince = res[0].provincia
				this.getTownshipData();
			} else {
				res.map((elem: any) => this.provinceArray.push(elem.provincia));
				this.selectedProvince = '';
			}
		});
	}

	getTownshipData = () => {
		// const province = this.provinceElem.value === '' ? this.provinceElem.value : this.selectedProvince;
		this.typeRoadElem?.setAttribute('disabled', '');
		this.streetElem?.setAttribute('disabled', '');
		this.numberElem?.setAttribute('disabled', '');

		if (this.selectedProvince === '') {
			this.selectedProvince = this.provinceElem.value;
		}
		const cp = this.getCp();
		this.http.get(`http://127.0.0.1:8000/getTownship/${this.selectedProvince}/${cp}`).subscribe((res: any) => {
			this.townshipArray = [];
			if (this.hideDefaultOption('defaultTownship', res.length === 1)) {
				this.townshipArray[0] = res[0].municipio;
				this.selectedTowship = res[0].municipio
				this.getTypeRoadData();
				this.getStreetData();
			} else {
				res.map((elem: any) => this.townshipArray.push(elem.municipio));
				this.selectedTowship = '';
			}
			this.townshipElem.removeAttribute('disabled');
		});
	}

	getTypeRoadData = () => {
		this.typeRoadArray = [];
		if (this.streetElem.value === '' || this.typeRoadElem.value === '') {
			this.numberElem.setAttribute('disabled', '');
		} else {
			this.numberElem.removeAttribute('disabled');
		}
		const cp = this.getCp();
		this.http.get(`http://127.0.0.1:8000/getTypeRoad/${this.provinceElem.value}/${this.townshipElem.value}/${this.streetElem.value}/${cp}`).subscribe((res: any) => {
			res.map((elem: any) => this.typeRoadArray.push(elem.tipovia));
			this.typeRoadElem.removeAttribute('disabled');
		});
	}

	getStreetData = () => {
		this.streetArray = [];
		if (this.streetElem.value === '' || this.typeRoadElem.value === '') {
			this.numberElem.setAttribute('disabled', '');
		} else {
			this.numberElem.removeAttribute('disabled');
		}
		const cp = this.getCp();
		this.http.get(`http://127.0.0.1:8000/getStreet/${this.provinceElem.value}/${this.townshipElem.value}/${this.typeRoadElem.value}/${cp}`).subscribe((res: any) => {
			res.map((elem: any) => this.streetArray.push(elem.calle));
			this.streetElem.removeAttribute('disabled');
		});
	}

	findProducts = () => {
		this.http.get(`http://127.0.0.1:8000/findProducts/${this.typeRoadElem.value}/${this.streetElem.value}/${this.townshipElem.value}/${this.provinceElem.value}/${this.numberElem.value}/${this.getCp}`)
			.subscribe((res: any) => {
				console.log(res);
			});
	}

	hideDefaultOption = (id: string, hide: boolean = false) => {
		const elem = document.getElementById(id);
		if (elem !== null) {
			if (hide) {
				elem.style.display = 'none';
				elem.setAttribute('disabled', '');
				elem.removeAttribute('selected');
			} else {
				elem.style.display = 'block';
				elem.removeAttribute('disabled');
				elem.removeAttribute('selected');
				elem.setAttribute('selected', '');
			}
		}
		return hide;
	}


	clearData = () => {
		this.provinceArray = [];
		this.townshipArray = [];
		this.typeRoadArray = [];
		this.streetArray = [];
		this.cpElem.value = null;
		this.numberElem.value = null;

		this.townshipElem?.setAttribute('disabled', '');
		this.typeRoadElem?.setAttribute('disabled', '');
		this.streetElem?.setAttribute('disabled', '');
		this.numberElem?.setAttribute('disabled', '');

		this.getProvinceData();
	}
}
