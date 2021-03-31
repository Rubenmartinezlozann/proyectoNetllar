import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
	selector: 'app-home-page',
	templateUrl: './home-page.component.html',
	styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
	provinceArray: any = [];
	province: string = '';

	constructor(private http: HttpClient, private router: Router) { }

	ngOnInit() {
		this.provinceArray = this.getData(`http://127.0.0.1:8000/getProvinces`);
	}

	selectProvince = (value: any) => {
		this.province = value
	}

	getData = (url: string) => {
		this.http.get(url).subscribe((res: any) => {
			console.log(res);
			return res;
		});
	}

	findProducts = () => {

	}

}
