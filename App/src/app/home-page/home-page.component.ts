import { Component, AfterViewInit, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
	selector: 'app-home-page',
	templateUrl: './home-page.component.html',
	styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements AfterViewInit {
	data: any = [];
	products: any = [];
	selectedData: any = undefined;

	countRequest: number = 0;

	number: any = 0
	cp: any;

	txtAddress: any;
	txtCp: any;
	txtNumber: any;
	divSuggestedAddress: any;

	spinner: any;

	isAddressFocused: boolean = false;

	constructor(private http: HttpClient, private router: Router) { }

	ngAfterViewInit() {
		this.txtAddress = document.getElementById('txtAddress');
		this.txtCp = document.getElementById('txtCp');
		this.txtNumber = document.getElementById('txtNumber');
		this.divSuggestedAddress = document.getElementById('suggestedAddressContainer');

		this.txtAddress.addEventListener('focus', () => {
			if (this.data.length > 0) this.divSuggestedAddress.style.display = 'block';
		});

		this.txtAddress.addEventListener('blur', () => {
			if (!this.isAddressFocused) this.divSuggestedAddress.style.display = 'none';
		});

		this.divSuggestedAddress.addEventListener('mouseover', () => {
			this.isAddressFocused = true;
		});

		this.divSuggestedAddress.addEventListener('mouseout', () => {
			this.isAddressFocused = false;
		});

		this.spinner = document.getElementById('spinnerContainer');
		this.spinner.style.display = 'none';
	}

	clearAddressData = () => {
		this.txtAddress.value = '';
		this.selectedData = undefined;
		this.data = [];
		this.countRequest++;
		this.spinner.style.display = 'none';
	}

	getCpText = (value: any) => {
		this.cp = value.currentTarget.value;
		this.clearAddressData();
	};

	getAddressText = (value: any) => {
		return value.currentTarget.value;
	};

	getNumberText = (value: any) => this.number = value.currentTarget.value;

	getAddressData = (event: any) => {
		this.countRequest++;
		const num = this.countRequest;
		const addressText = this.getAddressText(event);
		if (addressText !== '') {
			setTimeout(() => {
				if (this.countRequest === num) {
					this.divSuggestedAddress.style.display = 'none';
					this.data = [];
					this.spinner.style.display = 'block';
					let url = `http://127.0.0.1:8000/suggestAddress/${addressText}`;
					if (this.cp !== undefined && this.cp !== '') url += `/${this.cp}`;
					this.http.get(url).subscribe((res: any = []) => {
						this.spinner.style.display = 'none';
						if (this.countRequest === num && res.length > 0) {
							this.divSuggestedAddress.style.display = 'block	';
							this.divSuggestedAddress.style.overflow = res.length > 4 ? 'auto' : 'initial';
							this.data = res;
							if (this.selectedData !== undefined) this.selectedData = undefined;
						}
					});
				}
			}, 1000);
		} else {
			this.data = [];
			this.divSuggestedAddress.style.display = 'none';
			this.spinner.style.display = 'none';
		}
	}

	writeAddress = (value: any) => {
		this.txtAddress.value = `${value.typeRoad} ${value.street} ${value.township} ${value.province}`;
		this.txtCp.value = value.cp;
		this.selectedData = {
			'typeRoad': value.typeRoad,
			'street': value.street,
			'township': value.township,
			'province': value.province,
		};
		this.data = [];
		this.divSuggestedAddress.style.display = 'none';
	}

	clear = () => {
		this.txtCp.value = '';
		this.cp = undefined;
		this.clearAddressData();
		this.txtNumber.value = '';
		this.number = undefined;
	}

	findProducts = () => {
		if ((this.data.length <= 1 || this.selectedData !== undefined) && this.number > 0) {
			let typeRoad: any;
			let street: any;
			let township: any;
			let province: any;
			if (this.selectedData !== undefined) {
				typeRoad = this.selectedData.typeRoad;
				street = this.selectedData.street;
				township = this.selectedData.township;
				province = this.selectedData.province;
			} else {
				typeRoad = this.data[0].typeRoad;
				street = this.data[0].street;
				township = this.data[0].township;
				province = this.data[0].province;
			}
			this.http.get(`http://127.0.0.1:8000/findProducts/${typeRoad}/${street}/${township}/${province}/${this.number}`)
				.subscribe((res: any) => {
					this.products = res;
				});
		}
	}
}
