import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { User } from '../models/User';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    provider.addScope('User.ReadBasic.All'); // Para obtener foto de perfil
    return from(signInWithPopup(this.auth, provider));
  }

  /**
   * Obtener foto de perfil de Microsoft Graph API
   */
  private async getMicrosoftPhotoURL(accessToken: string): Promise<string> {
    try {
      console.log('🔍 Obteniendo foto de perfil de Microsoft Graph...');
      
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      });

      // Primero intentar obtener la foto directamente
      const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (photoResponse.ok) {
        // Convertir blob a base64
        const blob = await photoResponse.blob();
        return await this.blobToBase64(blob);
      } else {
        console.warn('⚠️ No se pudo obtener foto de Microsoft, usando default');
        return '';
      }
    } catch (error) {
      console.error('❌ Error obteniendo foto de Microsoft:', error);
      return '';
    }
  }

  /**
   * Convertir Blob a Base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Procesar la respuesta de OAuth y guardar sesión
   * Obtiene el token de Firebase y lo guarda
   */
  async processOAuthLogin(credential: UserCredential, provider: string): Promise<void> {
    const firebaseUser = credential.user;
    
    // Obtener el token de ID de Firebase (este es el token que se enviará al backend)
    const token = await firebaseUser.getIdToken();
    
    let photoURL = firebaseUser.photoURL || '';

    // Si es Microsoft, obtener la foto desde Microsoft Graph API
    if (provider === 'microsoft') {
      console.log('🔑 Login con Microsoft detectado, obteniendo foto...');
      
      // Obtener el access token de Microsoft desde las credenciales
      const oauthCredential = OAuthProvider.credentialFromResult(credential);
      const microsoftAccessToken = oauthCredential?.accessToken;
      
      if (microsoftAccessToken) {
        console.log('✅ Access token de Microsoft obtenido');
        photoURL = await this.getMicrosoftPhotoURL(microsoftAccessToken);
        
        if (photoURL) {
          console.log('✅ Foto de Microsoft obtenida exitosamente');
        }
      } else {
        console.warn('⚠️ No se pudo obtener access token de Microsoft');
      }
    }
    
    const userData = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email || 'Usuario',
      email: firebaseUser.email || '',
      token: token,
      photoURL: photoURL,
      provider: provider
    };
    
    console.log('💾 Guardando sesión con datos:', {
      ...userData,
      photoURL: photoURL ? 'Base64 image...' : 'Sin foto'
    });
    
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
      token: dataSesion["token"],
      photoURL: dataSesion["photoURL"] || '',
      provider: dataSesion["provider"] || 'email'
    };
    
    console.log('💾 Guardando en localStorage:', {
      ...data,
      photoURL: data.photoURL ? 'Tiene foto' : 'Sin foto'
    });
    
    localStorage.setItem('sesion', JSON.stringify(data));
    this.setUser(data);
  }

  /**
   * Permite actualizar la información del usuario
   */
  setUser(user: User) {
    console.log('👤 Actualizando usuario en BehaviorSubject:', user.name);
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