import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthfirebaseService } from '../services/services.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthfirebaseService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async login() {
    const { email, password } = this.loginForm.value;
    this.errorMessage = null;  // Reset error message
    try {
      await this.authService.login(email, password);
      if (email === 'rojasgarcia@gmail.com') {
        console.log("Inicio correcto de sesion por el admin rojas");
        this.router.navigate(["home"]);
      } else {
        console.log("Redirigiendo a cajero, no es el admin");
        this.router.navigate(["home"]);
      }
    } catch (error) {
      console.error('Error al iniciar sesión', error);
      this.handleError(error);
    }
  }

  handleError(error: any) {
    this.errorMessage = 'Correo electrónico o contraseña incorrectos. Por favor, inténtalo de nuevo.';
  }
}
