import { Injectable } from '@angular/core';
import { LoggerService } from './util/logger.service';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface VersionInfo {
  version: string;
}

export interface ColumnHeadersWithRowContent {
  headers: string[];
  contents: any[];
}

export interface ColumnMappings {
  to_column: string;
  cc_column: string;
  attachment_column: string;
}

export interface EmailMetadata {
  to_column: string;
  cc_column: string;
  subject_template: string;
  body_template: string;
}

export interface AttachmentMetadata {
  attachment_column: string;
}

export interface EmailServerDetails {
  service: string;
  username: string;
  password: string;
}

export interface TestEmailDetails {
  to: string;
}

export interface TemplateInput {
  template: string;
}

export interface TemplateOutput {
  reality: string;
}

@Injectable({
  providedIn: 'root'
})
export class WittymailService {

  emailMetadataInstance: EmailMetadata;
  attachmentMetadataInstance: AttachmentMetadata;

  urls = {
    version: 'api/version',  // GET
    fodder: 'api/fodder',    // POST
    regurgitate: 'api/fodder/regurgitate',    // POST
    vomit: 'api/vomit', //POST
    attachment: 'api/attachment',  // POST
    attachment_metadata: 'api/attachment/mapping',  // POST
    email: 'api/email', // POST
    email_server: 'api/email_server', // POST
    email_test: 'api/email/test', // POST
    template_resolver: 'api/email/template' // POST
  }

  constructor(private log: LoggerService, private http: HttpClient) {
    this.log.info("Created: ", this);
    this.emailMetadataInstance = <EmailMetadata>{};
    this.attachmentMetadataInstance = <AttachmentMetadata>{};
  }

  /**
   * Common handler for all REST API call failures
   * 
   * @param error HTTP error from REST API response
   */
  private handleApiResponseError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred.
      console.log("Client-side failure for REST API call: " + error.error.message);
    } else {
      // The server returned an error HTTP status code
      console.log("REST API failed, response: " + error);
    }

    return new ErrorObservable();
  }

  private handleError(operation = 'operation') {
    return (error: any) => {
      let errorMessage = error.message;
      
      if (error instanceof HttpErrorResponse) {
        // Sample: {operation} failed with HTTP 400 (BAD REQUEST): {custom error msg string from server} 
        this.log.error(`${operation} failed with HTTP ${error.status} (${error.statusText}): `, error.error);
        errorMessage = error.error;
      } else {
        this.log.error(`${operation} failed: `, error.message);
      }

      return throwError(errorMessage);
    };
  }

  getVersion(): Observable<VersionInfo> {
    let version: VersionInfo = { version: '' }
    return this.http.get<VersionInfo>(this.urls.version)
      .pipe(
        catchError(this.handleError('getVersion'))
      );
  }

  getFodderUploadUrl(): string {
    return this.urls.fodder;
  }

  getAttachmentUploadUrl(): string {
    return this.urls.attachment;
  }

  getColumnHeadersWithSampleRows(): Observable<ColumnHeadersWithRowContent> {
    return this.http.get<ColumnHeadersWithRowContent>(this.urls.regurgitate)
      .pipe(
        catchError(this.handleError('getColumnHeadersWithSampleRows'))
      );
  }

  getVomit(): Observable<ColumnHeadersWithRowContent> {
    return this.http.get<ColumnHeadersWithRowContent>(this.urls.vomit)
      .pipe(
        catchError(this.handleError('getVomit'))
      );

    // let res: ColumnHeadersWithRowContent = {
    //   headers: [
    //     'Name of Child', 'Class', 'Sponsor', 'Mail ID', 'Reference', 'Reference mail ID'
    //   ],
    //   contents: [
    //     {
    //       'Name of Child': 'Aradhya Karche',
    //       'Class': 'Nursery- kalewadi',
    //       'Sponsor': 'Kalubai pratishthan',
    //       'Mail ID': 'Sanjaysandhu8090@gmail.com',
    //       'Reference': 'Ravi',
    //       'Reference mail ID': 'amboreravi@gmail.com',
    //       'status': 'Pending',
    //       'email': {
    //         'from': 'wittymail@acme.com',
    //         'to': 'Sanjaysandhu8090@gmail.com',
    //         'cc': 'amboreravi@gmail.com',
    //         'attachment': {
    //           'name': 'Aradhya Karche.pdf',
    //           'url': 'api/attachment/Aradhya%20Karche.pdf'
    //         },
    //         'subject': 'First term progress report for Aradhya Karche',
    //         'body': 'Dear Kalubai pratishthan,'
    //       }
    //     },
    //     {
    //       'Name of Child': 'Vedika Shirgire',
    //       'Class': 'Nursery- kalewadi',
    //       'Sponsor': 'Apurva kumar',
    //       'Mail ID': 'apurv07vit@gmail.com',
    //       'Reference': 'Anish',
    //       'Reference mail ID': 'anishgarg07@gmail.com',
    //       'status': 'Pending',
    //       'email': {
    //         'from': 'wittymail@acme.com',
    //         'to': 'apurv07vit@gmail.com',
    //         'cc': 'anishgarg07@gmail.com',
    //         'attachment': {
    //           'name': 'Vedika Shirgire.pdf',
    //           'url': 'api/attachment/Vedika%20Shirgire.pdf'
    //         },
    //         'subject': 'First term progress report for Vedika Shirgire',
    //         'body': 'Dear Apurva kumar,'
    //       }
    //     }
    //   ]
    // };

    // return res;
  }

  saveEmailToCCColumns(to_column: string, cc_column: string) {
    this.emailMetadataInstance.to_column = to_column;
    this.emailMetadataInstance.cc_column = cc_column;

    this.log.info("emailMetadataInstance: ", this.emailMetadataInstance);
  }

  saveEmailSubjectBodyTemplate(subject_template: string, body_template: string) {
    this.emailMetadataInstance.subject_template = subject_template;
    this.emailMetadataInstance.body_template = body_template;

    this.log.info("emailMetadataInstance: ", this.emailMetadataInstance);
  }

  saveAttachmentMetadata(attachment_column: string) {
    this.attachmentMetadataInstance.attachment_column = attachment_column;

    this.log.info("attachmentMetadataInstance: ", this.attachmentMetadataInstance);
  }

  resolveTemplate(input: TemplateInput): Observable<TemplateOutput> {
    this.log.info("POSTing template: ", input);
    return this.http.post<TemplateOutput>(this.urls.template_resolver, input)
      .pipe(
        catchError(this.handleError('resolveTemplate'))
      );
  }

  postEmailMetadata(): Observable<string> {
    this.log.info("POSTing email metadata: ", this.emailMetadataInstance);
    return this.http.post<string>(this.urls.email, this.emailMetadataInstance)
      .pipe(
        catchError(this.handleError('postEmailMetadata'))
      );
  }

  postAttachmentMetadata(): Observable<string> {
    this.log.info("POSTing attachment metadata: ", this.attachmentMetadataInstance);
    return this.http.post<string>(this.urls.attachment_metadata, this.attachmentMetadataInstance)
      .pipe(
        catchError(this.handleError('postAttachmentMetadata'))
      );
  }

  postEmailServerDetails(payload: EmailServerDetails): Observable<string> {
    this.log.info("POSTing email server details: ", payload);
    return this.http.post<string>(this.urls.email_server, payload)
      .pipe(
        catchError(this.handleError('postEmailServerDetails'))
      );
  }

  postTestEmail(payload: TestEmailDetails): Observable<string> {
    this.log.info("POSTing test email details: ", payload);
    return this.http.post<string>(this.urls.email_test, payload)
      .pipe(
        catchError(this.handleError('postTestEmail'))
      );
  }

}
