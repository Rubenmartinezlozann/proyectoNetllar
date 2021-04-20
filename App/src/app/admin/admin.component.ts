import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, AfterViewInit {

    constructor(private http: HttpClient, private router: Router, private activatedRoute: ActivatedRoute) { }

    users: any[] = [];

    action: string = '';

    btnFind: any;
    txtFindUsername: any;
    dataTxtUsername: any;
    dataTxtPassword: any;
    dataButton: any;
    dataGoBackButton: any;
    tableUsers: any;

    ngAfterViewInit(): void {
        this.getUsers();
    }

    ngOnInit(): void {
        this.txtFindUsername = document.getElementById('find-username') as HTMLInputElement;
        this.btnFind = document.getElementById('btn-find') as HTMLInputElement;
        this.dataTxtUsername = document.getElementById('data-username') as HTMLInputElement;
        this.dataButton = document.getElementById('data-btn') as HTMLInputElement;
        this.dataTxtPassword = document.getElementById('data-password') as HTMLInputElement;
        const btnAddUser = document.getElementById('btnAddUser') as HTMLButtonElement;
        this.tableUsers = document.getElementById('tableUsers');
        this.dataGoBackButton = document.getElementById('data-goBack') as HTMLButtonElement;

        btnAddUser.addEventListener('click', () => {
            this.showCreateModifyForm();
            this.dataTxtUsername.removeAttribute('disabled');
            this.clear();
            this.action = 'create';
        })

        this.btnFind?.addEventListener('click', () => {
            if (this.txtFindUsername.value.length > 0) {
                this.findUser(this.txtFindUsername.value);
            } else {
                //alert txtFindUsername vacio
            }
        });

        this.dataButton?.addEventListener('click', () => {
            if (this.action === 'create') {
                this.http.post('http://127.0.0.1:8000/addUser', { "username": this.dataTxtUsername.value, "password": this.dataTxtPassword.value }).subscribe((res: any) => {
                    console.log(res);
                    this.clear();
                });
            } else {
                this.http.put('http://127.0.0.1:8000/updateUser', { "username": this.dataTxtUsername.value, "password": this.dataTxtPassword.value }).subscribe((res: any) => {
                    console.log(res);
                    this.clear();
                });
            }
        })

        this.dataGoBackButton.addEventListener('click', () => {
            this.clear();
            this.showTable();
        })
    }

    getUsers = () => {
        this.http.get('http://127.0.0.1:8000/getUsers').subscribe((res: any) => {
            this.users = res;
            console.log(res)
        });
    }

    findUser = (user: any) => {
        this.http.get(`http://127.0.0.1:8000/getUserByUsername/${user}`).subscribe((res: any) => {
            if (res !== null) {
                this.users = res;
            } else {
                //alert el usuario no existe y volver atras
            }
        });

    }

    clickBtnModify = (username: any) => {
        this.findUser(username);
        this.showCreateModifyForm();
        this.dataTxtUsername.setAttribute('disabled', '');
    }

    clickBtnDelete = (username: any) => {
        this.http.delete(`http://127.0.0.1:8000/deleteUserByUsername/${username}`).subscribe((res: any) => {
            if (res.deleted) {
                console.log('Usuario eliminado');
            } else {
                console.log('El usuario no existe');
            }
        });
    }

    clear = () => {
        this.txtFindUsername.value = null;
        this.dataTxtUsername.value = null;
        this.dataTxtPassword.value = null;
    }

    showCreateModifyForm = () => {
        const lblUsername = document.getElementById('lblUsername') as HTMLLabelElement;
        const lblPassword = document.getElementById('lblPassword') as HTMLLabelElement;

        this.tableUsers.style.display = 'none';
        this.txtFindUsername.setAttribute('disabled', '');
        this.btnFind.setAttribute('disabled', '');
        this.dataTxtUsername.style.display = 'block';
        this.dataTxtPassword.style.display = 'block';
        this.dataButton.style.display = 'block';
        lblUsername.style.display = 'block';
        lblPassword.style.display = 'block';
        this.action = 'modify';
    }

    showTable = () => {
        const lblUsername = document.getElementById('lblUsername') as HTMLLabelElement;
        const lblPassword = document.getElementById('lblPassword') as HTMLLabelElement;

        this.tableUsers.style.display = 'block';
        this.tableUsers.style.width = '75%';
        this.dataTxtUsername.style.display = 'none';
        this.dataTxtPassword.style.display = 'none';
        this.dataButton.style.display = 'none';
        lblUsername.style.display = 'none';
        lblPassword.style.display = 'none';
        this.txtFindUsername.removeAttribute('disabled');
        this.btnFind.removeAttribute('disabled');
    }
}