import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { User } from '../models/User';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  OAuthProvider,
  signOut,
  Auth,
  UserCredential
} from 'firebase/auth';
import { firebaseConfig } from '../config/firebase.config';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  theUser = new BehaviorSubject<User>(new User);
  private auth: Auth;

  constructor(private http: HttpClient) { 
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
    this.verifyActualSession();
  }

  /**
   * Login tradicional con email y password
   */
  login(user: User): Observable<any> {
    return this.http.post<any>(`${environment.url_ms_security}/login`, user);
  }

  /**
   * Login con Google usando Firebase OAuth
   */
  loginWithGoogle(): Observable<UserCredential> {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    return from(signInWithPopup(this.auth, provider));
  }

  /**
   * Login con GitHub usando Firebase OAuth
   */
  loginWithGitHub(): Observable<UserCredential> {
    const provider = new GithubAuthProvider();
    provider.addScope('user');
    return from(signInWithPopup(this.auth, provider));
  }

  /**
   * Login con Microsoft usando Firebase OAuth
   */
  loginWithMicrosoft(): Observable<UserCredential> {
    const provider = new OAuthProvider('microsoft.com');
    provider.addScope('user.read');
    return from(signInWithPopup(this.auth, provider));
  }

  /**
   * Procesar la respuesta de OAuth y guardar sesión
   * Obtiene el token de Firebase y lo guarda
   */
  async processOAuthLogin(credential: UserCredential, provider: string): Promise<void> {
    const firebaseUser = credential.user;
    
    // Obtener el token de ID de Firebase (este es el token que se enviará al backend)
    const token = await firebaseUser.getIdToken();
    
    const userData = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email || 'Usuario',
      email: firebaseUser.email || '',
      token: token,
      photoURL: firebaseUser.photoURL || '',
      provider: provider
    };
    
    this.saveSession(userData);
  }

  /**
   * Guardar la información de usuario en el local storage
   */
  saveSession(dataSesion: any) {
    let data: User = {
      id: dataSesion["id"],
      name: dataSesion["name"],
      email: dataSesion["email"],
      password: "",
      token: dataSesion["token"]
    };
    localStorage.setItem('sesion', JSON.stringify(data));
    this.setUser(data);
  }

  /**
   * Permite actualizar la información del usuario
   */
  setUser(user: User) {
    this.theUser.next(user);
  }

  /**
   * Permite obtener la información del usuario
   */
  getUser() {
    return this.theUser.asObservable();
  }

  /**
   * Usuario activo
   */
  public get activeUserSession(): User {
    return this.theUser.value;
  }

  /**
   * Permite cerrar la sesión del usuario
   */
  logout() {
    // Cerrar sesión en Firebase si existe
    if (this.auth.currentUser) {
      signOut(this.auth);
    }
    localStorage.removeItem('sesion');
    this.setUser(new User());
  }

  /**
   * Verificar si hay sesión activa
   */
  verifyActualSession() {
    let actualSesion = this.getSessionData();
    if (actualSesion) {
      this.setUser(JSON.parse(actualSesion));
    }
  }

  /**
   * Verifica si hay una sesion activa
   */
  existSession(): boolean {
    let sesionActual = this.getSessionData();
    return (sesionActual) ? true : false;
  }

  /**
   * Obtener datos de la sesión activa
   */
  getSessionData() {
    let sesionActual = localStorage.getItem('sesion');
    return sesionActual;
  }
}