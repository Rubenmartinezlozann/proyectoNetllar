import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-inf-page',
  templateUrl: './inf-page.component.html',
  styleUrls: ['./inf-page.component.css']
})
export class InfPageComponent implements OnInit, AfterViewInit {
  username: any;

  constructor(private http: HttpClient, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    const txtUsername = document.getElementById('username') as HTMLInputElement;
    this.http.get(`http://127.0.0.1:8000/getUserByUsername/${this.activatedRoute.snapshot.params.username}`).subscribe((res: any) => {
      this.username = res[0].username;
      txtUsername.value = res[0].username;
    })

    txtUsername.addEventListener('input', this.showButtons)

    document.getElementById('password')?.addEventListener('input', this.showButtons)
  }

  showButtons = () => {
    const txtUsername = document.getElementById('username') as HTMLInputElement;
    const txtPassword = document.getElementById('password') as HTMLInputElement;
    const btnSave = document.getElementById('btn-save') as HTMLButtonElement;
    const btndiscard = document.getElementById('btn-discard') as HTMLButtonElement;
    if (this.username !== txtUsername.value || txtPassword.value.length > 0) {
      console.log('si')
      btnSave.style.display = 'block';
      btndiscard.style.display = 'block';
    } else {
      console.log('no')
      btnSave.style.display = 'none';
      btndiscard.style.display = 'none';
    }
  }

}
