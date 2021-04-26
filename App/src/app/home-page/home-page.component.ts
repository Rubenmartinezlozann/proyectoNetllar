import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

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
	selectedTownship: string = '';
	selectedTypeRoad: string = '';
	selectedStreet: string = '';

	cp: any;
	province: any;
	township: any;
	typeRoad: any;
	street: any;
	number: any;

	count: number = 0;
	count2: number = 0;

	provinceElem: any;
	cpElem: any;
	townshipElem: any;
	typeRoadElem: any;
	streetElem: any;
	numberElem: any;

	constructor(private http: HttpClient, private router: Router, private activatedRoute: ActivatedRoute) { }

	ngOnInit() {
		this.http.get(`http://127.0.0.1:8000/getUserByToken/${this.activatedRoute.snapshot.params.token}`).subscribe((res: any) => {
			if (res.role !== null) {
				if (res.role.some((value: any) => value === 'ROLE_ADMIN')) {
					this.createBtnAdmin();
				}
				this.provinceElem = document.getElementById('province') as HTMLSelectElement;
				this.cpElem = document.getElementById('cp') as HTMLInputElement;
				this.townshipElem = document.getElementById('township') as HTMLSelectElement;
				this.typeRoadElem = document.getElementById('typeRoad') as HTMLSelectElement;
				this.streetElem = document.getElementById('street') as HTMLSelectElement;
				this.numberElem = document.getElementById('number') as HTMLElement;

				this.getProvinceData();

				this.provinceElem.addEventListener('change', this.getTownshipData);

				this.cpElem.addEventListener('input', () => {
					this.count2++;
					const count = this.count2;
					this.switchIcon('cp', 'loading');
					setTimeout(() => {
						if (this.count === count) {
							this.getProvinceData();
						}
					}, 1000)
				});
				this.cpElem.addEventListener('input', this.hideCpAlert);
				this.cpElem.addEventListener('input', this.showCpError);

				this.townshipElem.addEventListener('change', this.getTypeRoadData);

				this.typeRoadElem.addEventListener('change', this.getStreetData);

				this.streetElem.addEventListener('change', this.enableNum);

				this.numberElem.addEventListener('input', this.enableButton);
				this.numberElem, addEventListener('input', () => {
					if (this.selectedStreet !== '') {
						const numAlert = document.getElementById('numAlert');
						if (numAlert !== null) numAlert.style.display = 'none';
					}
				})

				document.getElementById("btnConfirm")?.addEventListener('click', this.findProducts);
				document.getElementById("btnClear")?.addEventListener('click', this.clearData);

				document.getElementById('cp-span')?.addEventListener('click', () => {
				})
			} else {
				this.router.navigate(['/login']);
			}
		})
	}

	getCp = () => this.cpElem.value.length === 4 ? this.cpElem.value : (this.cpElem.value.substring(0, 1) == 0 ? this.cpElem.value.substring(1) : this.cpElem.value);

	getProvinceData = () => {
		this.clearProvince();
		this.switchIcon('province', 'loading');
		const cp = this.getCp();
		this.http.get(`http://127.0.0.1:8000/getProvinces/${cp}`).subscribe((res: any) => {
			this.provinceArray = [];
			this.switchIcon('province', 'edit')
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
				this.showNotFoundCp();
			}
		});
	}

	getTownshipData = () => {
		this.clearTownship();
		this.switchIcon('province', 'ok');
		this.switchIcon('township', 'loading');
		const province = this.getSelectedProvince();
		const cp = this.getCp();
		if (province !== '') {
			this.http.get(`http://127.0.0.1:8000/getTownship/${province}/${cp}`).subscribe((res: any) => {
				this.townshipArray = [];
				this.switchIcon('township', 'edit');
				res.map((elem: any) => this.townshipArray.push(elem.municipio));
				if (this.hideDefaultOption('defaultTownship', res.length === 1)) {
					this.selectedTownship = res[0].municipio;
					this.getTypeRoadData();
				} else {
					this.selectedTownship = '';
				}
				this.townshipElem.removeAttribute('disabled');
			});
		} else {
			this.provinceElem.addEventListener('change', this.switchIcon('province', 'edit'));
		}
	}

	getTypeRoadData = () => {
		this.clearTypeRoad();
		this.switchIcon('typeRoad', 'loading');
		this.switchIcon('township', 'ok');
		const province = this.getSelectedProvince();
		const township = this.getSelectedTownship();
		const cp = this.getCp();
		if (township !== '') {
			this.http.get(`http://127.0.0.1:8000/getTypeRoad/${province}/${township}/ /${cp}`).subscribe((res: any) => {
				this.typeRoadArray = [];
				this.switchIcon('typeRoad', 'edit');
				res.map((elem: any) => this.typeRoadArray.push(elem.tipovia));
				this.typeRoadElem.removeAttribute('disabled');
				if (this.hideDefaultOption('defaultTypeRoad', res.length === 1)) {
					this.selectedTypeRoad = res[0].tipovia;
					this.getStreetData();
				} else {
					this.selectedTypeRoad = '';
				}
			});
		} else {
			this.switchIcon('township', 'edit');
		}
	}

	getStreetData = () => {
		this.clearStreet();
		this.switchIcon('typeRoad', 'ok');
		this.switchIcon('street', 'loading');
		const province = this.getSelectedProvince();
		const township = this.getSelectedTownship();
		const typeRoad = this.getSelectedTypeRoad();
		const cp = this.getCp();
		if (typeRoad !== '') {
			this.http.get(`http://127.0.0.1:8000/getStreet/${province}/${township}/${typeRoad === '' ? ' ' : typeRoad}/${cp}`).subscribe((res: any) => {
				this.streetArray = [];
				this.switchIcon('street', 'edit');
				res.map((elem: any) => this.streetArray.push(elem.calle));
				this.streetElem.removeAttribute('disabled');
				if (this.hideDefaultOption('defaultStreet', res.length === 1)) {
					this.selectedStreet = res[0].calle;
					this.enableNum();
				} else {
					this.selectedStreet = '';
				}
			});
		} else {
			this.switchIcon('typeRoad', 'edit');
		}
	}

	enableNum = () => {
		this.switchIcon('street', 'ok');
		this.switchIcon('number', 'edit');
		this.numberElem.removeAttribute('disabled');
	}

	enableButton = () => {
		const button = document.getElementById('btnConfirm');
		if (button !== null && this.getSelectedStreet() !== '') {
			if (this.numberElem.value !== '') {
				button.removeAttribute('disabled');
				this.switchIcon('number', 'ok');
			} else {
				button.setAttribute('disabled', '');
				this.switchIcon('number', 'edit');
			}
		}
	}

	findProducts = () => {
		if (this.getCp() === '') {
			this.http.get(`http://127.0.0.1:8000/getCp/${this.getSelectedProvince()}/${this.getSelectedTownship()}/${this.getSelectedTypeRoad()}/${this.getSelectedStreet()}/${this.numberElem.value}/${this.getCp()}`).subscribe((res: any) => {
				if (res.length === 1) {
					this.cpElem.value = res[0].cp.length === 4 ? `0${res[0].cp}` : res[0].cp;
					this.http.get(`http://127.0.0.1:8000/findProducts/${this.getSelectedTypeRoad()}/${this.getSelectedStreet()}/${this.getSelectedTownship()}/${this.getSelectedProvince()}/${this.numberElem.value}/${this.getCp()}`)
						.subscribe((res: any) => {
							this.numAlert(res.length > 0);
							console.log(res);
						});
				}
			});
		} else {
			this.http.get(`http://127.0.0.1:8000/findProducts/${this.getSelectedTypeRoad()}/${this.getSelectedStreet()}/${this.getSelectedTownship()}/${this.getSelectedProvince()}/${this.numberElem.value}/${this.getCp()}`)
				.subscribe((res: any) => {
					this.numAlert(res.length > 0);
					console.log(res);
				});
		}
		this.cp = this.getCp();
		this.province = this.getSelectedProvince();
		this.township = this.getSelectedTownship();
		this.typeRoad = this.getSelectedTypeRoad();
		this.street = this.getSelectedStreet();
		this.number = this.numberElem.value;
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

	getSelectedProvince = () => this.selectedProvince === '' ? this.provinceElem.value : this.selectedProvince;

	getSelectedTownship = () => this.selectedTownship === '' ? this.townshipElem.value : this.selectedTownship;

	getSelectedTypeRoad = () => this.selectedTypeRoad === '' ? this.typeRoadElem.value : this.selectedTypeRoad;

	getSelectedStreet = () => this.selectedStreet === '' ? this.streetElem.value : this.selectedStreet;

	switchIcon = (elemdataName: string, action: string) => {
		const span = document.getElementById(`${elemdataName}-span`) as HTMLSpanElement;
		const icon = document.getElementById(`${elemdataName}-icon`) as HTMLDivElement;
		const spinner = document.getElementById(`${elemdataName}-spinner`) as HTMLDivElement;
		const control = document.getElementById(elemdataName) as HTMLSelectElement;
		if (icon !== undefined && icon !== null) {
			switch (action) {
				case 'ok':
					spinner.style.display = 'none';
					icon.style.display = 'block';
					icon.className = 'bi bi-check';
					icon.style.color = 'white';
					span.style.backgroundColor = 'darkgreen';
					control.style.borderColor = 'darkgreen'
					break;
				case 'warning':
					spinner.style.display = 'none';
					icon.style.display = 'block';
					icon.style.color = 'black';
					icon.className = 'bi bi-exclamation-triangle';
					span.style.backgroundColor = 'darkorange';
					icon.style.color = 'white';
					break;
				case 'error':
					spinner.style.display = 'none';
					icon.style.display = 'block';
					icon.style.color = 'black';
					icon.className = 'bi bi-x-octagon';
					span.style.backgroundColor = 'red';
					icon.style.color = 'white';
					break;
				case 'edit':
					spinner.style.display = 'none';
					icon.style.display = 'block';
					icon.style.color = 'black';
					icon.className = 'bi bi-pencil-square';
					icon.style.color = 'white';
					control.style.borderColor = 'rgb(0, 59, 135)';
					span.style.backgroundColor = 'rgb(0, 59, 135)';
					break;
				case 'loading':
					spinner.style.display = 'block';
					icon.style.display = 'none';
					span.style.backgroundColor = 'lightgrey';
					break;
				case 'disabled':
					spinner.style.display = 'none';
					icon.style.display = 'block';
					icon.style.color = 'rgb(80, 80, 80)';
					span.style.backgroundColor = 'lightgrey';
					if (elemdataName === 'cp' || elemdataName === 'number') {
						control.style.borderColor = 'rgba(91, 125, 167, 0.7)';
					} else {
						control.style.borderColor = 'rgb(91, 125, 167)';
					}
					icon.className = 'bi bi-pencil-square';
					break;
			}
		}
	}

	createBtnAdmin = () => {
		const btnAdmin = document.createElement('button');
		btnAdmin.type = 'button';
		btnAdmin.innerText = 'Admin';
		btnAdmin.style.float = 'right';
		btnAdmin.style.height = '3em';
		btnAdmin.style.background = 'white';
		btnAdmin.style.fontFamily = 'Calibri';
		btnAdmin.style.fontSize = '1em';
		btnAdmin.style.borderRadius = '5px';
		btnAdmin.style.border = '2px solid black';
		btnAdmin.classList.add('col-md-2');
		btnAdmin.classList.add('col-4');
		btnAdmin.style.margin = `0px 20px 0px 0px`;
		btnAdmin.addEventListener('click', () => {
			this.router.navigate(['/admin']);
		})
		document.getElementsByTagName('header')[0].appendChild(btnAdmin);
	}

	showCpError = () => {
		this.count++;
		const count = this.count;
		setTimeout(() => {
			const text = this.cpElem.value.length;
			if ((text < 4 || text > 5) && text !== 0 && this.count === count) {
				this.cpElem.style.borderColor = 'red';
				const cpAlert = document.getElementById('cpAlert');
				if (cpAlert !== null) {
					cpAlert.textContent = 'El código postal debe tener una longitud de cinco carácteres.';
					cpAlert.style.color = 'red';
					this.switchIcon('cp', 'error');
				}
			}
		}, 1000)
	}

	showNotFoundCp = () => {
		const text = this.cpElem.value.length;
		if (text >= 4 && text <= 5) {
			this.cpElem.style.borderColor = 'darkorange';
			const cpAlert = document.getElementById('cpAlert');
			if (cpAlert !== null) {
				cpAlert.textContent = 'No hay servicio para este código postal';
				cpAlert.style.color = 'darkorange';
				this.switchIcon('cp', 'warning');
			}
		}
	}

	hideCpAlert = () => {
		this.cpElem.style.borderColor = 'rgb(0, 59, 135)';
		const cpAlert = document.getElementById('cpAlert');
		if (cpAlert !== null) {
			cpAlert.textContent = '';
			this.switchIcon('cp', 'edit');
		}
	}

	numAlert = (showAlert: boolean) => {
		const numAlert = document.getElementById('numAlert');
		if (showAlert) {
			if (numAlert !== null) numAlert.textContent = 'No hay servicio para este número';
		} else {
			if (numAlert !== null) numAlert.textContent = '';
		}
	}

	clearData = () => {
		this.clearCp();
		this.hideCpAlert();
		this.getProvinceData();
	}

	clearCp = () => {
		this.cpElem.value = null;
		this.switchIcon('cp', 'edit');
		this.clearProvince();
	}

	clearProvince = () => {
		this.provinceArray = [];
		this.selectedProvince = '';
		this.hideDefaultOption('defaultProvince', false);
		this.switchIcon('province', 'disabled');
		this.clearTownship();
	}

	clearTownship = () => {
		this.townshipArray = [];
		this.selectedTownship = '';
		this.townshipElem?.setAttribute('disabled', '');
		this.hideDefaultOption('defaultTownship', false);
		this.switchIcon('township', 'disabled');
		this.clearTypeRoad();
	}

	clearTypeRoad = () => {
		this.typeRoadArray = [];
		this.selectedTypeRoad = '';
		this.typeRoadElem?.setAttribute('disabled', '');
		this.hideDefaultOption('defaultTypeRoad', false);
		this.switchIcon('typeRoad', 'disabled');
		this.clearStreet();
	}

	clearStreet = () => {
		this.streetArray = [];
		this.selectedStreet = '';
		this.streetElem?.setAttribute('disabled', '');
		this.hideDefaultOption('defaultStreet', false);
		this.switchIcon('street', 'disabled');
		this.clearNumber();
	}

	clearNumber = () => {
		this.numberElem.value = null;
		this.numberElem?.setAttribute('disabled', '');
		this.switchIcon('number', 'disabled');
		this.enableButton();
	}
}