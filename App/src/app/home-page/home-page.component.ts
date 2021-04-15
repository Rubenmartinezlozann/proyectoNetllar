import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { threadId } from 'node:worker_threads';

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

		this.cpElem.addEventListener('change', this.getProvinceData)
		this.cpElem.addEventListener('change', this.showCpError)
		this.cpElem.addEventListener('input', this.hideCpAlert)

		this.townshipElem.addEventListener('change', this.getTypeRoadData);
		// this.townshipElem.addEventListener('change', this.getStreetData);

		this.typeRoadElem.addEventListener('change', this.getStreetData)

		this.streetElem.addEventListener('change', this.getTypeRoadData)

		this.numberElem.addEventListener('change', this.enableButton)

		document.getElementById("btnConfirm")?.addEventListener('click', this.findProducts);
		document.getElementById("btnClear")?.addEventListener('click', this.clearData);
	}

	getCp = () => this.cpElem.value.length === 4 ? this.cpElem.value : (this.cpElem.value.substring(0, 1) == 0 ? this.cpElem.value.substring(1) : this.cpElem.value);

	showCpError = () => {
		const text = this.cpElem.value.length;
		if ((text < 4 || text > 5) && (text !== 0)) {
			this.cpElem.style.border = '2px solid red';
			const cpAlert = document.getElementById('cpAlert');
			if (cpAlert !== null) {
				cpAlert.textContent = 'El código postal debe tener una longitud de cinco carácteres.';
				cpAlert.style.color = 'red';
				cpAlert.style.display = 'block';
			}
		}
	}

	hideCpAlert = () => {
		const text = this.cpElem.value.length;
		this.cpElem.style.border = '2px solid rgb(0, 59, 135)';
		const cpAlert = document.getElementById('cpAlert');
		if (cpAlert !== null) cpAlert.style.display = 'none';
	}

	getProvinceData = () => {
		this.clearProvince();
		const cp = this.getCp();
		this.http.get(`http://127.0.0.1:8000/getProvinces/${cp}`).subscribe((res: any) => {
			console.log(res)
			this.provinceArray = [];
			if (res.length !== 0) {
				res.map((elem: any) => this.provinceArray.push(elem.provincia));
				this.provinceElem?.removeAttribute('disabled');
				if (this.hideDefaultOption('defaultProvince', res.length === 1)) {
					this.selectedProvince = res[0].provincia;
					this.getTownshipData();
				} else {
					this.selectedProvince = '';
				}
			} else {
				const text = this.cpElem.value.length;
				if (text >= 4 && text <= 5) {
					this.cpElem.style.border = '2px solid darkorange';
					const cpAlert = document.getElementById('cpAlert');
					if (cpAlert !== null) {
						cpAlert.textContent = 'No hay servicio para este código postal';
						cpAlert.style.color = 'darkorange';
						cpAlert.style.display = 'block';
					}
				}
			}
		});
	}

	getTownshipData = () => {
		this.clearTownship();

		if (this.selectedProvince === '') this.selectedProvince = this.provinceElem.value;
		const cp = this.getCp();
		this.http.get(`http://127.0.0.1:8000/getTownship/${this.selectedProvince}/${cp}`).subscribe((res: any) => {
			console.log(res)
			this.townshipArray = [];
			res.map((elem: any) => this.townshipArray.push(elem.municipio));
			if (this.hideDefaultOption('defaultTownship', res.length === 1)) {
				this.selectedTowship = res[0].municipio;
				this.getTypeRoadData();
			} else {
				this.selectedTowship = '';
			}
			this.townshipElem.removeAttribute('disabled');
		});
	}

	getTypeRoadData = () => {
		console.log((this.selectedTypeRoad === '' && this.typeRoadElem.value === ''))
		if ((this.selectedTypeRoad === '' && this.typeRoadElem.value === '')) {
			this.typeRoadArray = [];
			console.log("dentro tipovia")
			if (this.selectedTowship === '') this.selectedTowship = this.townshipElem.value;
			if (this.selectedStreet === "") this.selectedStreet = this.streetElem.value;
			const cp = this.getCp();
			this.http.get(`http://127.0.0.1:8000/getTypeRoad/${this.selectedProvince}/${this.selectedTowship}/${this.selectedStreet === '' ? ' ' : this.selectedStreet}/${cp}`).subscribe((res: any) => {
				console.log(res)
				res.map((elem: any) => this.typeRoadArray.push(elem.tipovia));
				this.typeRoadElem.removeAttribute('disabled');
				if (this.hideDefaultOption('defaultTypeRoad', res.length === 1)) {
					this.selectedTypeRoad = res[0].tipovia;
				} else {
					this.selectedTypeRoad = '';
				}
				this.getStreetData();
			});
		} else {
			this.numberElem.removeAttribute('disabled');
		}
	}

	getStreetData = () => {
		console.log(this.selectedStreet)
		console.log(this.streetElem.value)
		console.log(this.selectedStreet === '' && this.streetElem.value === '')
		if (this.selectedStreet === '' && this.streetElem.value === '') {
			this.streetArray = [];
			console.log("dentro calle")
			if (this.selectedTowship === '') this.selectedTowship = this.townshipElem.value;
			if (this.selectedTypeRoad === "") this.selectedTypeRoad = this.typeRoadElem.value;
			const cp = this.getCp();
			this.http.get(`http://127.0.0.1:8000/getStreet/${this.selectedProvince}/${this.selectedTowship}/${this.selectedTypeRoad === '' ? ' ' : this.selectedTypeRoad}/${cp}`).subscribe((res: any) => {
				console.log(res)
				res.map((elem: any) => this.streetArray.push(elem.calle));
				this.streetElem.removeAttribute('disabled');
				if (this.hideDefaultOption('defaultStreet', res.length === 1)) {
					this.selectedStreet = res[0].calle;
					this.getTypeRoadData();
				} else {
					this.selectedStreet = '';
				}
			});
		} else {
			this.numberElem.removeAttribute('disabled');
		}
	}

	enableButton = () => {

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
				elem.removeAttribute('disabled')
				elem.setAttribute('selected', '');
			}
		}
		return hide;
	}


	clearData = () => {
		this.clearCp();
		this.hideCpAlert();
		this.getProvinceData();
	}

	clearCp = () => {
		this.cpElem.value = null;
		this.clearProvince();
	}

	clearProvince = () => {
		this.provinceArray = [];
		this.selectedProvince = '';
		this.hideDefaultOption('defaultProvince', false);
		this.clearTownship();
	}

	clearTownship = () => {
		this.townshipArray = [];
		this.selectedTowship = '';
		this.townshipElem?.setAttribute('disabled', '');
		this.hideDefaultOption('defaultTownship', false);
		this.clearTypeRoad();
	}

	clearTypeRoad = () => {
		this.typeRoadArray = [];
		this.selectedTypeRoad = '';
		this.typeRoadElem?.setAttribute('disabled', '');
		this.clearStreet();
	}

	clearStreet = () => {
		this.streetArray = [];
		this.streetElem?.setAttribute('disabled', '');
		this.selectedStreet = '';
		this.clearNumber();
	}

	clearNumber = () => {
		this.numberElem.value = null;
		this.numberElem?.setAttribute('disabled', '');
	}
}