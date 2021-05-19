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
	products: any;

	selectedCp: any = '';
	selectedNumber: any;

	count2: number = 0;

	addressWirteCpElem: any;
	addressWirteAddressElem: any;
	addressWriteNumberElem: any;
	addressWriteAddressByCp: any

	loadingIcon: any;

	constructor(private http: HttpClient, private router: Router, private activatedRoute: ActivatedRoute) { }

	ngOnInit() {
		this.http.post(`http://127.0.0.1:8000/testLogin`, { 'token': sessionStorage.getItem('token') }).subscribe((res: any) => {
			if (res.ok) {
				if (res.role.some((value: any) => value === 'ROLE_ADMIN')) {
					this.createBtnAdmin();
				}

				this.addressWirteCpElem = document.getElementById('address-write-cp') as HTMLInputElement;
				this.addressWirteAddressElem = document.getElementById('address-write-address') as HTMLInputElement;
				this.addressWriteNumberElem = document.getElementById('address-write-number') as HTMLInputElement;

				this.loadingIcon = document.getElementById('loading-page-icon') as HTMLDivElement;
				this.loadingIcon.style.display='none';

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
							this.getData();
						}
					}, 1000);
				});

				document.getElementById("btnConfirm")?.addEventListener('click', this.findProductsByText);
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
		this.http.get(`http://127.0.0.1:8000/getAllAddress/${sessionStorage.getItem('token')}/${this.getCp()}`).subscribe((res: any) => {
			this.loadingIcon.style.display = 'none';
			this.data = res;
		});
	}

	getCp = () => this.selectedCp.length === 4 ? this.selectedCp : (this.selectedCp.substring(0, 1) == 0 ? this.selectedCp.substring(1) : this.selectedCp);

	enableButton = () => {
		const button = document.getElementById('btnConfirm') as HTMLButtonElement;
		if (this.selectedNumber !== '') {
			button.removeAttribute('disabled');
		} else {
			button.setAttribute('disabled', '');
		}
	}

	findProductsByText = () => {
		this.http.get(`http://127.0.0.1:8000/getOneAddressByText/${this.addressWirteAddressElem.value}/${this.selectedNumber}/${this.getCp()}`)
			.subscribe((res: any) => {
				console.log(res)
				if (res.length === 1) {
					this.selectedCp = '' + res[0][0].cp;
					this.addressWirteCpElem.value = this.selectedCp;
				}
			}, (err) => {
				sessionStorage.setItem('error', err.status);
				this.router.navigate(['/login']);
			});
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
		this.switchIcon(idElem, 'edit');
		this.hideAlert();
	}

	clearData = () => {
		this.clearAddressWriteSection();
		this.selectedCp = '';
		this.selectedNumber = '';
	}

	clearAddressWriteSection = () => {
		this.addressWirteAddressElem.value = '';
		this.addressWirteCpElem.value = '';
		this.addressWriteNumberElem.value = '';

		this.switchIcon('address-write-cp', 'edit');
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