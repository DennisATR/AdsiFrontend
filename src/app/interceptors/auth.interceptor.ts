import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SeguridadService } from "../servicios/seguridad.service";
import { Router } from "@angular/router";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private servicioSeguridad: SeguridadService,
        private router: Router
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.servicioSeguridad.ObtenerTokenLocalStorage();
        let clonedRequest = request;

        const esPeticionImpresora = request.url.includes('localhost:4000') || request.url.includes(':4000') || request.url.includes('/imprimir');

        if (token && !esPeticionImpresora) {
            clonedRequest = request.clone({
                setHeaders: { Authorization: `Bearer ${token}` }
            });
        }

        return next.handle(clonedRequest).pipe(
            catchError((error: any) => {
                if (error instanceof HttpErrorResponse) {
                    if (esPeticionImpresora) {
                        return throwError(() => error);
                    }

                    if (error.status === 401) {
                        this.servicioSeguridad.RemoverDatosUsuarioValidado();
                        this.router.navigate(["/seguridad/identificar-usuario"]);
                    }
                }
                return throwError(() => error);
            })
        );
    }
}