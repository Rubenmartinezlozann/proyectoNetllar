import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { enableProdMode } from '@angular/core';

enableProdMode();

@Component({
	selector: 'app-home-page',
	templateUrl: './home-page.component.html',
	styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
	data: any[] = [];
	dataByCp: any[] = [];

	provinceArray: any[] = [];
	townshipArray: any[] = [];
	typeRoadArray: any[] = [];
	streetArray: any[] = [];
	products: any;

	selectedCp: any = '';
	selectedProvince: string = '';
	selectedTownship: string = '';
	selectedTypeRoad: string = '';
	selectedStreet: string = '';
	selectedNumber: any;

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

	addressWirteCpElem: any;
	addressWirteAddressElem: any;
	addressWriteNumberElem: any;
	addressWriteAddressByCp: any

	addressRadioWrite: any;
	addressRadioSelect: any;

	loadingIcon: any;

	constructor(private http: HttpClient, private router: Router, private activatedRoute: ActivatedRoute) { }

	ngOnInit() {
		this.http.post(`http://127.0.0.1:8000/testLogin`, { 'token': sessionStorage.getItem('token') }).subscribe((res: any) => {
			if (res.ok) {
				if (res.role.some((value: any) => value === 'ROLE_ADMIN')) {
					this.createBtnAdmin();
				}
				this.provinceElem = document.getElementById('province') as HTMLSelectElement;
				this.cpElem = document.getElementById('cp') as HTMLInputElement;
				this.townshipElem = document.getElementById('township') as HTMLSelectElement;
				this.typeRoadElem = document.getElementById('typeRoad') as HTMLSelectElement;
				this.streetElem = document.getElementById('street') as HTMLSelectElement;
				this.numberElem = document.getElementById('number') as HTMLElement;

				this.addressWirteCpElem = document.getElementById('address-write-cp') as HTMLInputElement;
				this.addressWirteAddressElem = document.getElementById('address-write-address') as HTMLInputElement;
				this.addressWriteNumberElem = document.getElementById('address-write-number') as HTMLInputElement;

				this.addressWriteAddressByCp = document.getElementById('address-write-addressByCp') as HTMLInputElement;

				this.addressRadioWrite = document.getElementById('address-radio-write') as HTMLInputElement;
				this.addressRadioWrite.addEventListener('change', () => {
					const addresWriteContainer = document.getElementById('address-write-container') as HTMLDivElement;
					const addresSelectContainer = document.getElementById('address-select-container') as HTMLDivElement;

					addresWriteContainer.style.display = 'block';
					addresSelectContainer.style.display = 'none';

					this.addressRadioWrite.setAttribute('checked', '');
					this.addressRadioSelect.removeAttribute('checked');

					this.clearData();
				});

				this.addressRadioSelect = document.getElementById('address-radio-select') as HTMLInputElement;
				this.addressRadioSelect.addEventListener('change', () => {
					const addresWriteContainer = document.getElementById('address-write-container') as HTMLDivElement;
					const addresSelectContainer = document.getElementById('address-select-container') as HTMLDivElement;

					addresWriteContainer.style.display = 'none';
					addresSelectContainer.style.display = 'block';

					this.addressRadioWrite.removeAttribute('checked');
					this.addressRadioSelect.setAttribute('checked', '');

					this.clearData();
				});

				this.loadingIcon = document.getElementById('loading-page-icon') as HTMLDivElement;

				this.getData();

				this.cpElem.addEventListener('input', () => {
					this.count2++;
					const count = this.count2;
					this.switchIcon('cp', 'loading');
					setTimeout(() => {
						if (this.count2 === count) {
							this.selectedCp = this.cpElem.value;
							this.hideCpAlert('cp');
							this.showCpError('cp');
							this.getDataByCp();
							this.getProvinceData();
						}
					}, 1000);
				});

				this.provinceElem.addEventListener('change', this.getTownshipData);

				this.townshipElem.addEventListener('change', this.getTypeRoadData);

				this.typeRoadElem.addEventListener('change', this.getStreetData);

				this.streetElem.addEventListener('change', this.enableNum);

				this.numberElem.addEventListener('input', () => {
					this.selectedNumber = this.numberElem.value;
					this.enableButton();
				});

				this.addressWriteNumberElem.addEventListener('input', () => {
					this.selectedNumber = this.addressWriteNumberElem.value;
					this.enableButton();
				});

				this.addressWirteCpElem.addEventListener('input', () => {
					this.count2++;
					const count = this.count2;
					this.switchIcon('address-write-cp', 'edit');
					setTimeout(() => {
						if (this.count2 === count) {
							this.selectedCp = this.addressWirteCpElem.value;
							this.hideCpAlert('address-write-cp');
							this.showCpError('address-write-cp');
							this.getDataByCp();
							if (this.selectedCp !== '') {
								this.addressWriteAddressByCp.style.display = 'block';
								this.addressWirteAddressElem.style.display = 'none';
							}
							else {
								this.addressWriteAddressByCp.style.display = 'none';
								this.addressWirteAddressElem.style.display = 'block';
							}
						}
					}, 1000);
				});

				document.getElementById("btnConfirm")?.addEventListener('click', () => {
					if (this.addressRadioWrite.checked) this.findProductsByText();
					else this.findProducts();

				});
				document.getElementById("btnClear")?.addEventListener('click', this.clearData);

				document.getElementById('alert-button')?.addEventListener('click', this.hideAlert);

				document.getElementById('btn-logout')?.addEventListener('click', this.logout);
			} else {
				sessionStorage.setItem('error', '403');
				this.router.navigate(['/login']);
			}
		}, (err) => {
			sessionStorage.setItem('error', err.status);
			this.router.navigate(['/login']);
		})
	}

	getData = () => {
		this.loadingIcon.style.display = 'block';
		const progressBar = document.getElementById('progress-bar') as HTMLDivElement;
		this.http.get(`http://127.0.0.1:8000/getAllAddress/${sessionStorage.getItem('token')}/${this.getCp()}`).subscribe((res: any) => {
			// if (res.length === 0) {
			// 	if (this.addressRadioSelect.hasAttribute('checked')) this.showNotFoundCp('cp')
			// 	else this.showNotFoundCp('address-write-cp')
			// }
			this.loadingIcon.style.display = 'none';
			progressBar.setAttribute('aria-valuemax', `${res.length}`)
			res.forEach((elem: any) => {
				setTimeout(() => {
					progressBar.style.width = `${this.data.length * 100 / res.length}%`;
					this.data.push(elem);
					if (this.data.length === res.length) {
						const progressBarContainer = document.getElementById('loading-bar') as HTMLDivElement;
						progressBarContainer.style.display = 'none';
						this.getProvinceData();
					}
				}, 0.000000001)
			});
		});
	}

	getCp = () => this.selectedCp.length === 4 ? this.selectedCp : (this.selectedCp.substring(0, 1) == 0 ? this.selectedCp.substring(1) : this.selectedCp);

	getDataByCp = () => {
		if (this.selectedCp !== '') {
			this.dataByCp = this.data.filter((elem: any) => elem.cp == this.selectedCp)
			if (this.dataByCp.length === 0) {
				if (this.addressRadioSelect.hasAttribute('checked')) this.showNotFoundCp('cp')
				else this.showNotFoundCp('address-write-cp')
			} else {
				this.switchIcon('address-write-cp', 'ok');
				this.switchIcon('cp', 'ok');
			}
		}
	}

	getProvinceData = () => {
		this.clearProvince();
		this.switchIcon('province', 'loading');
		const cp = this.getCp();

		if (cp === '') {
			this.data.forEach((dataElem: any) => {
				if (this.provinceArray.every((value: any) => dataElem.provincia !== value.provincia)) this.provinceArray.push(dataElem);
			});
		} else {
			this.dataByCp.forEach((dataElem: any) => {
				if (this.provinceArray.every((value: any) => dataElem.provincia !== value.provincia)) this.provinceArray.push(dataElem);
			});
		}
		if (this.provinceArray.length === 0) {
			this.showNotFoundCp('cp');
			this.clearProvince();
		} else {
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
			if (cp === '') {
				this.data.forEach((dataElem: any) => {
					if (province == dataElem.provincia) {
						if (this.townshipArray.every((value: any) => dataElem.municipio !== value.municipio)) {
							this.townshipArray.push(dataElem);
						}
					}
				});
			} else {
				this.dataByCp.forEach((dataElem: any) => {
					if (/* cp == dataElem.cp && */ province == dataElem.provincia) {
						if (this.townshipArray.every((value: any) => dataElem.municipio !== value.municipio)) {
							this.townshipArray.push(dataElem);
						}
					}
				});
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
			if (cp === '') {
				this.data.forEach((dataElem: any) => {
					if (province == dataElem.provincia && township == dataElem.municipio) {
						if (this.typeRoadArray.every((value: any) => dataElem.tipovia !== value.tipovia)) {
							this.typeRoadArray.push(dataElem);
						}
					}
				});
			} else {
				this.dataByCp.forEach((dataElem: any) => {
					if (/* cp == dataElem.cp && */ province == dataElem.provincia && township == dataElem.municipio) {
						if (this.typeRoadArray.every((value: any) => dataElem.tipovia !== value.tipovia)) {
							this.typeRoadArray.push(dataElem);
						}
					}
				});
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
			if (cp === '') {
				this.data.forEach((dataElem: any) => {
					if (province == dataElem.provincia && township == dataElem.municipio && typeRoad == dataElem.tipovia) {
						if (this.streetArray.every((value: any) => dataElem.calle !== value.calle)) {
							this.streetArray.push(dataElem);
						}
					}
				});
			} else {
				this.dataByCp.forEach((dataElem: any) => {
					if (/* cp == dataElem.cp &&  */province == dataElem.provincia && township == dataElem.municipio && typeRoad == dataElem.tipovia) {
						if (this.streetArray.every((value: any) => dataElem.calle !== value.calle)) {
							this.streetArray.push(dataElem);
						}
					}
				});
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
		const button = document.getElementById('btnConfirm') as HTMLButtonElement;
		if (this.selectedNumber !== '') {
			button.removeAttribute('disabled');
		} else {
			button.setAttribute('disabled', '');
		}
	}

	findProductsByText = () => {
		console.log('si')
		this.http.get(`http://127.0.0.1:8000/getOneAddressByText/${this.getCp() === '' ? this.addressWirteAddressElem.value : this.addressWriteAddressByCp.value}/${this.selectedNumber}/${this.getCp()}`)
			.subscribe((res: any) => {
				console.log(res)
				console.log(`http://127.0.0.1:8000/getOneAddressByText/${this.getCp() === '' ? this.addressWirteAddressElem.value : this.addressWriteAddressByCp.value}/${this.selectedNumber}/${this.getCp()}`)
				if (res.length === 1) {
					console.log(res);
					this.selectedProvince = res[0][0].provincia;
					this.selectedTownship = res[0][0].municipio;
					this.selectedTypeRoad = res[0][0].tipovia;
					this.selectedStreet = res[0][0].calle;
					this.selectedCp = '' + res[0][0].cp;
					this.addressWirteAddressElem.style.display = 'none';
					this.addressWriteAddressByCp.style.display = 'block';
					this.addressWirteCpElem.value = this.selectedCp;
					if (this.getCp() === '') {
						this.addressWirteAddressElem.style.display = 'none';
						this.addressWriteAddressByCp.style.display = 'block';
						this.addressWriteAddressByCp.value = `${this.selectedTypeRoad} ${this.selectedStreet} ${this.selectedTownship} ${this.selectedProvince}`
					}

					this.cp = this.getCp();
					this.province = this.getSelectedProvince();
					this.township = this.getSelectedTownship();
					this.typeRoad = this.getSelectedTypeRoad();
					this.street = this.getSelectedStreet();
					this.number = this.selectedNumber.value;
				} else {
					this.selectedProvince = '';
					this.selectedTownship = '';
					this.selectedTypeRoad = '';
					this.selectedStreet = '';
				}
			}, (err) => {
				sessionStorage.setItem('error', err.status);
				this.router.navigate(['/login']);
			});
	}

	findProducts = () => {
		if (this.getCp() === '') {
			this.http.get(`http://127.0.0.1:8000/getCp/${sessionStorage.getItem('token')}/${this.getSelectedProvince()}/${this.getSelectedTownship()}/${this.getSelectedTypeRoad()}/${this.getSelectedStreet()}/${this.selectedNumber}`).subscribe((res: any) => {
				if (res.length === 1) {
					this.selectedCp = res[0].cp.length === 4 ? `0${res[0].cp}` : res[0].cp;
					this.cpElem.value = this.selectedCp;
					this.addressWirteCpElem.value = this.selectedCp;
					this.switchIcon('cp', 'ok');
					this.http.get(`http://127.0.0.1:8000/findProducts/${sessionStorage.getItem('token')}/${this.getSelectedTypeRoad()}/${this.getSelectedStreet()}/${this.getSelectedTownship()}/${this.getSelectedProvince()}/${this.selectedNumber}/${this.getCp()}`)
						.subscribe((res: any) => {
							if (res.length > 0) { this.hideAlert(); this.switchIcon('number', 'ok') } else { this.showAlert('No hay servicio para este número', 'warning'); this.switchIcon('number', 'warning') }
							console.log(res);
						}, (err) => {
							sessionStorage.setItem('error', err.status);
							this.router.navigate(['/login']);
						});
				}
			}, (err) => {
				sessionStorage.setItem('error', err.status);
				this.router.navigate(['/login']);
			});
		} else {
			this.http.get(`http://127.0.0.1:8000/findProducts/${sessionStorage.getItem('token')}/${this.getSelectedTypeRoad()}/${this.getSelectedStreet()}/${this.getSelectedTownship()}/${this.getSelectedProvince()}/${this.selectedNumber}/${this.getCp()}`)
				.subscribe((res: any) => {
					if (res.length > 0) { this.hideAlert(); this.switchIcon('number', 'ok') } else { this.showAlert('No hay servicio para este número', 'warning'); this.switchIcon('number', 'warning') }
					console.log(res);
				}, (err) => {
					sessionStorage.setItem('error', err.status);
					this.router.navigate(['/login']);
				});
		}
		this.cp = this.getCp();
		this.province = this.getSelectedProvince();
		this.township = this.getSelectedTownship();
		this.typeRoad = this.getSelectedTypeRoad();
		this.street = this.getSelectedStreet();
		this.number = this.selectedNumber.value;
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
				elem.removeAttribute('disabled');
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
		switch (action) {
			case 'ok':
				if (spinner !== undefined && spinner !== null) spinner.style.display = 'none';
				if (icon !== undefined && icon !== null) {
					icon.style.display = 'block';
					icon.className = 'bi bi-check';
					icon.style.color = 'white';
				}
				if (span !== undefined && span !== null) span.style.backgroundColor = 'darkgreen';
				if (control !== undefined && control !== null) control.style.borderColor = 'darkgreen';
				break;
			case 'warning':
				if (spinner !== undefined && spinner !== null) spinner.style.display = 'none';
				if (icon !== undefined && icon !== null) {
					icon.style.display = 'block';
					icon.className = 'bi bi-exclamation-triangle';
					icon.style.color = 'white';
				}
				if (span !== undefined && span !== null) span.style.backgroundColor = 'darkorange';
				if (control !== undefined && control !== null) control.style.borderColor = 'darkorange';
				break;
			case 'error':
				if (spinner !== undefined && spinner !== null) spinner.style.display = 'none';
				if (icon !== undefined && icon !== null) {
					icon.style.display = 'block';
					icon.className = 'bi bi-x-octagon';
					icon.style.color = 'white';
				}
				if (span !== undefined && span !== null) span.style.backgroundColor = 'red';
				if (control !== undefined && control !== null) control.style.borderColor = 'red';
				break;
			case 'edit':
				if (spinner !== undefined && spinner !== null) spinner.style.display = 'none';
				if (icon !== undefined && icon !== null) {
					icon.style.display = 'block';
					icon.className = 'bi bi-pencil-square';
					icon.style.color = 'white';
				}
				if (span !== undefined && span !== null) span.style.backgroundColor = 'rgb(0, 59, 135)';
				if (control !== undefined && control !== null) control.style.borderColor = 'rgb(0, 59, 135)';
				break;
			case 'loading':
				if (spinner !== undefined && spinner !== null) spinner.style.display = 'block';
				if (icon !== undefined && icon !== null) icon.style.display = 'none';
				if (span !== undefined && span !== null) span.style.backgroundColor = 'lightgrey';
				break;
			case 'disabled':
				if (spinner !== undefined && spinner !== null) spinner.style.display = 'none';
				if (icon !== undefined && icon !== null) {
					icon.style.display = 'block';
					icon.style.color = 'rgb(80, 80, 80)';
					icon.className = 'bi bi-pencil-square';
				}
				if (span !== undefined && span !== null) span.style.backgroundColor = 'lightgrey';
				if (control !== undefined && control !== null) {
					if (control.getAttribute('type') !== 'select') {
						control.style.borderColor = 'rgba(91, 125, 167, 0.7)';
					} else {
						control.style.borderColor = 'rgb(91, 125, 167)';
					}
				}
				break;
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

	showCpError = (idElem: any) => {
		const text = this.selectedCp.length;
		if ((text < 4 || text > 5) && text !== 0) {
			this.switchIcon(idElem, 'error');
			this.showAlert('El código postal debe tener una longitud de 5 carácteres', 'error');
		}
	}

	showNotFoundCp = (idElem: any) => {
		const text = this.selectedCp.length;
		if (text >= 4 && text <= 5) {
			this.switchIcon(idElem, 'warning');
			this.showAlert('No hay servicio para este código postal', 'warning');
		}
	}

	hideCpAlert = (idElem: any) => {
		this.cpElem.style.borderColor = 'rgb(0, 59, 135)';
		this.switchIcon(idElem, 'edit');
		this.hideAlert();
	}

	clearData = () => {
		this.clearCp();
		this.getProvinceData();
		this.clearAddressWriteSection();
		this.selectedCp = '';
		this.selectedNumber = '';
	}

	clearAddressWriteSection = () => {
		this.addressWirteAddressElem.value = '';
		this.addressWirteCpElem.value = '';
		console.log(this.addressWirteCpElem)
		this.addressWriteNumberElem.value = '';
		this.addressWriteAddressByCp.value = '';

		this.addressWirteAddressElem.style.display = 'block';
		this.addressWriteAddressByCp.style.display = 'none';

		this.switchIcon('address-write-cp', 'edit');
	}

	clearCp = () => {
		this.cpElem.value = null;
		this.hideCpAlert('cp');
		this.switchIcon('cp', 'edit');
		this.clearProvince();
	}

	clearProvince = () => {
		this.provinceArray = [];
		this.selectedProvince = '';
		this.provinceElem?.setAttribute('disabled', '');
		this.hideDefaultOption('defaultProvince', true);
		this.hideDefaultOption('defaultProvince', false);
		this.switchIcon('province', 'disabled');
		if (this.townshipArray.length !== 0) this.clearTownship();
	}

	clearTownship = () => {
		this.townshipArray = [];
		this.selectedTownship = '';
		this.townshipElem?.setAttribute('disabled', '');
		this.hideDefaultOption('defaultTownship', false);
		this.switchIcon('township', 'disabled');
		if (this.typeRoadArray.length !== 0) this.clearTypeRoad();
	}

	clearTypeRoad = () => {
		this.typeRoadArray = [];
		this.selectedTypeRoad = '';
		this.typeRoadElem?.setAttribute('disabled', '');
		this.hideDefaultOption('defaultTypeRoad', false);
		this.switchIcon('typeRoad', 'disabled');
		if (this.streetArray.length !== 0) this.clearStreet();
	}

	clearStreet = () => {
		this.streetArray = [];
		this.selectedStreet = '';
		this.streetElem?.setAttribute('disabled', '');
		this.hideDefaultOption('defaultStreet', false);
		this.switchIcon('street', 'disabled');
		if (this.selectedNumber !== '') this.clearNumber();
	}

	clearNumber = () => {
		this.selectedNumber !== '';
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