import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
	selector: 'app-home-page',
	templateUrl: './home-page.component.html',
	styleUrls: ['./home-page.component.css']
})
export class HomePageComponent {
	data: any = [];
	countRequest = 0;
	constructor(private http: HttpClient) { }

	getText = (value: any) => value.currentTarget.value

	getAddressData = (text: any) => {
		this.countRequest++;
		const num = this.countRequest;
		const addressText = this.getText(text);
		let textArray: any = [];
		this.http.get('http://127.0.0.1:8000/suggestAddress/' + addressText).subscribe((res: any = []) => {
			res.forEach((element: any) => {
				let text: string = '';
				element.forEach((elem: any) => {
					text += elem + ' ';
				});
				textArray.push(text);
			});
			if (this.countRequest===num) this.data = textArray;
		});
	}
}
