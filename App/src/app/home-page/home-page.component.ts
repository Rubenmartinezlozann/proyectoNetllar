import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { ThrowStmt } from '@angular/compiler';

@Component({
	selector: 'app-home-page',
	templateUrl: './home-page.component.html',
	styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
	data: any[] = [];
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
		this.http.post(`http://127.0.0.1:8000/testLogin`, { 'token': sessionStorage.getItem('token') }).subscribe((res: any) => {
			if (/* res.role !== null &&  */res.ok) {
				if (res.role.some((value: any) => value === 'ROLE_ADMIN')) {
					this.createBtnAdmin();
				}
				this.provinceElem = document.getElementById('province') as HTMLSelectElement;
				this.cpElem = document.getElementById('cp') as HTMLInputElement;
				this.townshipElem = document.getElementById('township') as HTMLSelectElement;
				this.typeRoadElem = document.getElementById('typeRoad') as HTMLSelectElement;
				this.streetElem = document.getElementById('street') as HTMLSelectElement;
				this.numberElem = document.getElementById('number') as HTMLElement;

				this.getData();

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

				this.provinceElem.addEventListener('change', this.getTownshipData);

				this.townshipElem.addEventListener('change', this.getTypeRoadData);

				this.typeRoadElem.addEventListener('change', this.getStreetData);

				this.streetElem.addEventListener('change', this.enableNum);

				this.numberElem.addEventListener('input', this.enableButton);

				document.getElementById("btnConfirm")?.addEventListener('click', this.findProducts);
				document.getElementById("btnClear")?.addEventListener('click', this.clearData);

				document.getElementById('alert-button')?.addEventListener('click', this.hideAlert);

				document.getElementById('btn-logout')?.addEventListener('click', this.logout)
			} else {
				this.router.navigate(['/login']);
			}
		}, () => {
			this.router.navigate(['/login']);
		})
	}

	getData = () => {
		this.switchIcon('province', 'loading');
		this.http.get(`http://127.0.0.1:8000/getAllAddress/${sessionStorage.getItem('token')}/${this.getCp()}`).subscribe((res: any) => {
			this.data = res;
			this.getProvinceData();
		})
	}

	getCp = () => this.cpElem.value.length === 4 ? this.cpElem.value : (this.cpElem.value.substring(0, 1) == 0 ? this.cpElem.value.substring(1) : this.cpElem.value);

	getProvinceData = () => {
		this.clearProvince();
		this.switchIcon('province', 'loading');
		const cp = this.getCp();

		if (cp === '') {
			this.provinceArray = this.data.sort((a: any, b: any) => a.provincia.localeCompare(b.provincia)).filter((dataElem: any, index: number) => index > 0 ? dataElem.provincia !== this.data[index - 1].provincia : true)
		} else {
			// let ok = true;
			// this.data.map((elem: any) => {
			// 	if (elem.cp == cp) {
			// 		ok = true;
			// 		this.provinceArray.map((province: any) => {
			// 			if (elem.provincia === province) {
			// 				ok = false;
			// 			}
			// 		})
			// 		if (ok) this.provinceArray.push(elem.provincia);
			// 	}
			// });
			this.provinceArray = this.data.sort((a: any, b: any) => a.provincia.localeCompare(b.provincia)).filter((dataElem: any, index: number) => index > 0 ? (dataElem.provincia !== this.data[index - 1].provincia && dataElem.cp == cp) : dataElem.cp == cp)
		}
		if (this.provinceArray.length === 0) {
			this.showNotFoundCp();
			this.clearProvince()
		} else {
			if (cp !== '') this.switchIcon('cp', 'ok');
			this.switchIcon('province', 'edit');
			this.provinceElem?.removeAttribute('disabled');
			if (this.hideDefaultOption('defaultProvince', this.provinceArray.length === 1)) {
				this.selectedProvince = this.provinceArray[0].provincia;
				this.getTownshipData();
			} else {
				this.selectedProvince = '';
			}
		}
	}

	getTownshipData = () => {
		this.clearTownship();
		const province = this.getSelectedProvince();
		if (province !== '') {
			this.switchIcon('province', 'ok');
			this.switchIcon('township', 'loading');
			const cp = this.getCp();
			// let ok = true;
			// if (cp === '') {
			// 	this.data.map((elem: any) => {
			// 		if (elem.provincia == province) {
			// 			ok = true;
			// 			this.townshipArray.map((township: any) => {
			// 				if (elem.municipio === township) {
			// 					ok = false;
			// 				}
			// 			})
			// 			if (ok) {
			// 				this.townshipArray.push(elem.municipio);
			// 			}
			// 		}
			// 	});
			// } else {
			// 	this.data.map((elem: any) => {
			// 		if (elem.cp == cp && elem.provincia == province) {
			// 			ok = true;
			// 			this.townshipArray.map((township: any) => {
			// 				if (elem.municipio === township) {
			// 					ok = false;
			// 				}
			// 			})
			// 			if (ok) this.townshipArray.push(elem.municipio);
			// 		}
			// 	});
			// }
			if (cp === '') {
				this.townshipArray = this.data.sort((a: any, b: any) => a.municipio.localeCompare(b.municipio)).filter((dataElem: any, index: number) => index > 0 ? (dataElem.municipio !== this.data[index - 1].municipio && dataElem.provincia == province) : dataElem.provincia == province)
			} else {
				this.townshipArray = this.data.sort((a: any, b: any) => a.municipio.localeCompare(b.municipio)).filter((dataElem: any, index: number) => index > 0 ? (dataElem.municipio !== this.data[index - 1].municipio && dataElem.cp == cp && dataElem.provincia == province) : dataElem.cp == cp && dataElem.provincia == province)
			}
			this.switchIcon('township', 'edit');
			this.townshipElem?.removeAttribute('disabled');
			if (this.hideDefaultOption('defaultTownship', this.townshipArray.length === 1)) {
				this.selectedTownship = this.townshipArray[0].municipio;
				this.getTypeRoadData();
			} else {
				this.selectedTownship = '';
			}
		} else {
			this.switchIcon('province', 'edit');
		}
	}

	getTypeRoadData = () => {
		this.clearTypeRoad();
		const township = this.getSelectedTownship();
		if (township !== '') {
			this.switchIcon('township', 'ok');
			this.switchIcon('typeRoad', 'loading');
			const province = this.getSelectedProvince();
			const cp = this.getCp();
			let ok = true;
			// if (cp === '') {
			// 	this.data.map((elem: any) => {
			// 		if (elem.municipio == township && elem.provincia == province) {
			// 			ok = true;
			// 			this.typeRoadArray.map((typeRoad: any) => {
			// 				if (elem.tipovia === typeRoad) {
			// 					ok = false;
			// 				}
			// 			})
			// 			if (ok) {
			// 				this.typeRoadArray.push(elem.tipovia);
			// 			}
			// 		}
			// 	});
			// } else {
			// 	this.data.map((elem: any) => {
			// 		if (elem.cp == cp && elem.municipio == township && elem.provincia == province) {
			// 			ok = true;
			// 			this.typeRoadArray.map((typeRoad: any) => {
			// 				if (elem.tipovia === typeRoad) {
			// 					ok = false;
			// 				}
			// 			})
			// 			if (ok) {
			// 				this.typeRoadArray.push(elem.tipovia);
			// 			}
			// 		}
			// 	});
			// }
			if (cp === '') {
				this.typeRoadArray = this.data.sort((a: any, b: any) => a.tipovia.localeCompare(b.tipovia)).filter((dataElem: any, index: number) => index > 0 ? (dataElem.tipovia !== this.data[index - 1].tipovia && dataElem.provincia == province) && dataElem.municipio == township : dataElem.provincia == province && dataElem.municipio == township)
			} else {
				this.typeRoadArray = this.data.sort((a: any, b: any) => a.tipovia.localeCompare(b.tipovia)).filter((dataElem: any, index: number) => index > 0 ? dataElem.tipovia != this.data[index - 1].tipovia && dataElem.cp == cp && dataElem.provincia == province && dataElem.municipio == township : dataElem.cp == cp && dataElem.provincia == province && dataElem.municipio == township)
			}
			this.switchIcon('typeRoad', 'edit');
			this.typeRoadElem.removeAttribute('disabled');
			if (this.hideDefaultOption('defaultTypeRoad', this.typeRoadArray.length === 1)) {
				this.selectedTypeRoad = this.typeRoadArray[0].tipovia;
				this.getStreetData();
			} else {
				this.selectedTypeRoad = '';
			}
		} else {
			this.switchIcon('township', 'edit');
		}
	}

	getStreetData = () => {
		this.clearStreet();
		const typeRoad = this.getSelectedTypeRoad();
		if (typeRoad !== '') {
			this.switchIcon('typeRoad', 'ok');
			this.switchIcon('street', 'loading');
			const province = this.getSelectedProvince();
			const township = this.getSelectedTownship();
			const cp = this.getCp();
			// let ok = true;
			// if (cp === '') {
			// 	this.data.map((elem: any) => {
			// 		if (elem.provincia == province && elem.municipio == township && elem.tipovia == typeRoad) {
			// 			ok = true;
			// 			this.streetArray.map((street: any) => {
			// 				if (elem.calle === street) {
			// 					ok = false;
			// 				}
			// 			})
			// 			if (ok) {
			// 				this.streetArray.push(elem.calle);
			// 			}
			// 		}
			// 	});
			// } else {
			// 	this.data.map((elem: any) => {
			// 		if (elem.cp == cp && elem.provincia == province) {
			// 			ok = true;
			// 			this.streetArray.map((street: any) => {
			// 				if (elem.calle === street) {
			// 					ok = false;
			// 				}
			// 			})
			// 			if (ok) {
			// 				this.streetArray.push(elem.calle);
			// 			}
			// 		}
			// 	});
			// }
			if (cp === '') {
				this.streetArray = this.data.sort((a: any, b: any) => a.calle.localeCompare(b.calle)).filter((dataElem: any, index: number) => index > 0 ? dataElem.calle !== this.data[index - 1].calle && dataElem.provincia == province && dataElem.municipio == township && dataElem.tipovia == typeRoad : dataElem.provincia == province && dataElem.municipio == township && dataElem.tipovia == typeRoad)
			} else {
				this.streetArray = this.data.sort((a: any, b: any) => a.calle.localeCompare(b.calle)).filter((dataElem: any, index: number) => index > 0 ? dataElem.calle !== this.data[index - 1].calle && dataElem.cp == cp && dataElem.provincia == province && dataElem.municipio == township && dataElem.tipovia == typeRoad : dataElem.cp == cp && dataElem.provincia == province && dataElem.municipio == township && dataElem.tipovia == typeRoad)
			}
			this.switchIcon('street', 'edit');
			this.streetElem.removeAttribute('disabled');
			if (this.hideDefaultOption('defaultStreet', this.streetArray.length === 1)) {
				this.selectedStreet = this.streetArray[0].calle;
				this.enableNum();
			} else {
				this.selectedStreet = '';
			}
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
					this.switchIcon('cp', 'ok');
					this.http.get(`http://127.0.0.1:8000/findProducts/${this.getSelectedTypeRoad()}/${this.getSelectedStreet()}/${this.getSelectedTownship()}/${this.getSelectedProvince()}/${this.numberElem.value}/${this.getCp()}`)
						.subscribe((res: any) => {
							if (res.length > 0) { this.hideAlert(); this.switchIcon('number', 'ok') } else { this.showAlert('No hay servicio para este número', 'warning'); this.switchIcon('number', 'warning') }
							console.log(res);
						}, () => {
							this.router.navigate(['/login']);
						});
				}
			}, () => {
				this.router.navigate(['/login']);
			});
		} else {
			this.http.get(`http://127.0.0.1:8000/findProducts/${this.getSelectedTypeRoad()}/${this.getSelectedStreet()}/${this.getSelectedTownship()}/${this.getSelectedProvince()}/${this.numberElem.value}/${this.getCp()}`)
				.subscribe((res: any) => {
					if (res.length > 0) { this.hideAlert(); this.switchIcon('number', 'ok') } else { this.showAlert('No hay servicio para este número', 'warning'); this.switchIcon('number', 'warning') }
					console.log(res);
				}, () => {
					this.router.navigate(['/login']);
				});
		}
		this.cp = this.getCp();
		this.province = this.getSelectedProvince();
		this.township = this.getSelectedTownship();
		this.typeRoad = this.getSelectedTypeRoad();
		this.street = this.getSelectedStreet();
		this.number = this.numberElem.value;
	}

	logout = () => {
		this.http.post(`http://127.0.0.1:8000/logout`, { 'token': sessionStorage.getItem('token') }).subscribe(() => { }, () => {
			this.router.navigate(['/login']);
		});
		this.router.navigate(['/login']);
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
					control.style.borderColor = 'darkorange';
					icon.style.color = 'white';
					break;
				case 'error':
					spinner.style.display = 'none';
					icon.style.display = 'block';
					icon.style.color = 'black';
					icon.className = 'bi bi-x-octagon';
					span.style.backgroundColor = 'red';
					control.style.borderColor = 'red';
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
		btnAdmin.style.textAlign = 'center'
		btnAdmin.style.height = '3em';
		btnAdmin.style.background = 'white';
		btnAdmin.style.fontFamily = 'Calibri';
		btnAdmin.style.fontSize = '1em';
		btnAdmin.style.borderRadius = '5px';
		btnAdmin.style.border = '2px solid black';
		btnAdmin.classList.add('col-sm-2');
		btnAdmin.style.margin = `-1em 0px 2em 0px`;
		btnAdmin.addEventListener('click', () => {
			this.router.navigate(['/admin']);
		})
		const adminContainer = document.getElementById('btn-admin-container');
		if (adminContainer !== null) {
			adminContainer.appendChild(btnAdmin);
			adminContainer.style.display = 'block';
		}


	}

	showCpError = () => {
		this.count++;
		const count = this.count;
		setTimeout(() => {
			const text = this.cpElem.value.length;
			if ((text < 4 || text > 5) && text !== 0 && this.count === count) {
				const cpAlert = document.getElementById('cpAlert');
				if (cpAlert !== null) {
					cpAlert.textContent = 'El código postal debe tener una longitud de cinco carácteres.';
					cpAlert.style.color = 'red';
				}
				this.switchIcon('cp', 'error');
				this.showAlert('El código postal debe tener una longitud de 5 carácteres', 'error');
			}
		}, 1000)
	}

	showNotFoundCp = () => {
		const text = this.cpElem.value.length;
		if (text >= 4 && text <= 5) {
			const cpAlert = document.getElementById('cpAlert');
			if (cpAlert !== null) {
				cpAlert.textContent = 'No hay servicio para este código postal';
				cpAlert.style.color = 'darkorange';
			}
			this.switchIcon('cp', 'warning');
			this.showAlert('No hay servicio para este código postal', 'warning');
		}
	}

	hideCpAlert = () => {
		this.cpElem.style.borderColor = 'rgb(0, 59, 135)';
		const cpAlert = document.getElementById('cpAlert');
		if (cpAlert !== null) {
			cpAlert.textContent = '';
		}
		this.switchIcon('cp', 'edit');
		this.hideAlert();
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
		this.townshipElem?.setAttribute('disabled', '');
		this.hideDefaultOption('defaultProvince', true);
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
		const button = document.getElementById('btnConfirm');
		button?.setAttribute('disabled', '');
	}

	hideAlert = () => {
		const alertContainer = document.getElementById('alert-container') as HTMLDivElement;

		if (alertContainer.classList.contains('show')) alertContainer.classList.remove('show');
	}

	showAlert = (text: string, type: string = 'error') => {
		const alertText = document.getElementById('alert-text') as HTMLParagraphElement;
		const alertContainer = document.getElementById('alert-container') as HTMLDivElement;

		alertText.textContent = text;
		if (type === 'error') {
			if (!alertContainer.classList.contains('alert-danger')) alertContainer.classList.add('alert-danger');
			if (alertContainer.classList.contains('alert-warning')) alertContainer.classList.remove('alert-warning');
		} else {
			if (alertContainer.classList.contains('alert-danger')) alertContainer.classList.remove('alert-danger');
			if (!alertContainer.classList.contains('alert-warning')) alertContainer.classList.add('alert-warning');
		}
		if (!alertContainer.classList.contains('show')) alertContainer.classList.add('show');
	}
}