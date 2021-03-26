import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
	selector: 'app-home-page',
	templateUrl: './home-page.component.html',
	styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
	data: any = [];
	selectedData: any;
	countRequest: number = 0;
	number: number = 0
	txtAddress: any;
	products: any = [];

	constructor(private http: HttpClient, private router: Router) { }

	ngOnInit = () => {
		this.txtAddress = document.getElementById('txtAddress');
		console.log("ng on init ok");
	}

	getAddressText = (value: any) => value.currentTarget.value;

	getNumberText = (value: any) => this.number = value.currentTarget.value;

	getAddressData = (text: any) => {
		this.countRequest++;
		const num = this.countRequest;
		const addressText = this.getAddressText(text);
		setTimeout(() => {
			if (this.countRequest === num) {
				if (addressText !== '') {
					this.http.get(`http://127.0.0.1:8000/suggestAddress/${addressText}`).subscribe((res: any = []) => {
						this.data = res;
						if (this.selectedData !== undefined) this.selectedData = undefined;
					});
				}
			}
		}, 750);
	}

	writeAddress = (value: any) => {
		this.txtAddress = document.getElementById('txtAddress');
		this.txtAddress.value = `${value.typeRoad} ${value.street} ${value.township} ${value.province}`;
		this.selectedData = {
			'typeRoad': value.typeRoad,
			'street': value.street,
			'township': value.township,
			'province': value.province,
		};
		this.data = [];
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
