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
	countRequest: number = 0;
	number: number = 0
	txtAddress: any;

	constructor(private http: HttpClient, private router: Router) { }

	ngOnInit = () => { this.txtAddress = document.getElementById('txtAddress'); }

	getAddressText = (value: any) => value.currentTarget.value

	getNumberText = (value: any) => this.number = value.currentTarget.value

	getAddressData = (text: any) => {
		this.countRequest++;
		const num = this.countRequest;
		const addressText = this.getAddressText(text);
		if (addressText !== '') {
			this.http.get(`http://127.0.0.1:8000/suggestAddress/${addressText}`).subscribe((res: any = []) => {
				if (this.countRequest === num) this.data = res;
			});
		}
	}

	writeAddress = (value: any) => {
		this.txtAddress = document.getElementById('txtAddress');
		this.txtAddress.value = `${value.typeRoad} ${value.street} ${value.township} ${value.province}`;
	}

	findProducts = () => {
		console.log(this.data.length)
		if (this.data.length === 1 && this.number > 0) {
			this.http.get(`http://127.0.0.1:8000/findProducts/'${this.data[0].typeRoad}/${this.data[0].street}/${this.data[0].township}/${this.data[0].province}/${this.number}`)
				.subscribe((res: any = null) => {
					console.log("dentro");
					if (res !== null) console.log(res); else console.log('mal');
				});
		} else {
			console.log("fuera");
		}
	}
}
