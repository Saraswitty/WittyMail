import { Injectable } from '@angular/core';
import { LoggerService } from './util/logger.service';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface VersionInfo {
  version: string;
}

export interface ColumnHeadersWithRowContent {
  headers: string[];
  extended_headers: string[];
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

export interface AttachmentRotation {
  filename: string;
  direction: string;
}

export interface EmailServerDetails {
  service: string;
  username: string;
  password: string;
}

export interface TestEmailDetails {
  to: string;
}

export interface SendEmailContent {
  from: string;
  to: string;
  cc: string;
  subject: string;
  attachment: any;
  body: string;
}

export interface TemplateInput {
  template: string;
}

export interface TemplateOutput {
  reality: string;
}

export interface CandidateAttachmentsInput {
  selected_row: any;
}

export interface CandidateAttachments {
  subject: string;
  pdfNames: string[];
}

export interface CandidateAttachmentSelection {
  selected_row: any;
  pdfName: string;  
}

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  emailMetadataInstance: EmailMetadata;
  attachmentMetadataInstance: AttachmentMetadata;

  urls = {
    version: 'api/version',  // GET
    sheet: {
      upload: 'api/sheet/upload', // POST
      get_file: 'api/sheet/file', // GET
      get_contents: 'api/sheet/contents', //GET
      get_headers: 'api/sheet/headers', // GET
      set_mapping: 'api/sheet/mapping' // POST
    },
    attachment: {
      upload: 'api/attachment/upload', // POST
      rotate: 'api/attachment/rotate', // POST
      get_file: 'api/attachment/file/', // GET with filename appended to URL
      candidate: 'api/attachment/candidate', // GET with selected_row
      candidate_select: 'api/attachment/candidate/select', // POST with selected_row and attachment name
    },
    email: {
      set_server: 'api/email/server', // POST
      convert_template_to_string: 'api/email/template_to_reality', // POST
      set_metadata_and_contents: 'api/email/metadata_contents', // POST
      send_test: 'api/email/send_test', // POST
      send: 'api/email/send' // POST
    }
    // fodder: 'api/fodder',    // POST, GET
    // regurgitate: 'api/fodder/regurgitate',    // POST
    // vomit: 'api/vomit', //POST
    // attachment: 'api/fodder/achar',  // POST
    // attachment_metadata: 'api/fodder/achar/mapping',  // POST
    // email: 'api/burp', // POST
    // email_server: 'api/burp/server', // POST
    // email_test: 'api/burp/test', // POST
    // email_send: 'api/burp/send', // POST
    // template_resolver: 'api/burp/template' // POST
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

    return throwError(error);
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
    return this.urls.sheet.upload;
  }

  getFodderDownloadUrl(): string {
    return this.urls.sheet.get_file;
  }

  getAttachmentUploadUrl(): string {
    return this.urls.attachment.upload;
  }

  getColumnHeadersWithSampleRows(): Observable<ColumnHeadersWithRowContent> {
    return this.http.get<ColumnHeadersWithRowContent>(this.urls.sheet.get_headers)
      .pipe(
        catchError(this.handleError('getColumnHeadersWithSampleRows'))
      );
  }

  getSheetContents(): Observable<ColumnHeadersWithRowContent> {
    return this.http.get<ColumnHeadersWithRowContent>(this.urls.sheet.get_contents)
      .pipe(
        catchError(this.handleError('getSheetContents'))
      );
  }

  postColumnMapping(mapping: ColumnMappings) {
    return this.http.post<TemplateOutput>(this.urls.sheet.set_mapping, mapping)
      .pipe(
        catchError(this.handleError('postColumnMapping'))
      );
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

  rotateAttachment(rotation: AttachmentRotation) {
    return this.http.post<TemplateOutput>(this.urls.attachment.rotate, rotation)
      .pipe(
        catchError(this.handleError('rotateAttachment'))
      );
  }

  getCandidateAttachments(selected_row: CandidateAttachmentsInput): Observable<CandidateAttachments> {
    return this.http.get<CandidateAttachments>(this.urls.attachment.candidate)
      .pipe(
        catchError(this.handleError('getCandidateAttachments'))
      );
  }

  selectAttachmentCandidate(selected: CandidateAttachmentSelection) {
    return this.http.post<CandidateAttachmentSelection>(this.urls.attachment.candidate_select, selected)
      .pipe(
        catchError(this.handleError('selectAttachmentCandidate'))
      );
  }

  resolveTemplate(input: TemplateInput): Observable<TemplateOutput> {
    this.log.info("POSTing template: ", input);
    return this.http.post<TemplateOutput>(this.urls.email.convert_template_to_string, input)
      .pipe(
        catchError(this.handleError('resolveTemplate'))
      );
  }

  postEmailMetadata(): Observable<string> {
    this.log.info("POSTing email metadata: ", this.emailMetadataInstance);
    return this.http.post<string>(this.urls.email.set_metadata_and_contents, this.emailMetadataInstance)
      .pipe(
        catchError(this.handleError('postEmailMetadata'))
      );
  }

  postAttachmentMetadata(): Observable<string> {
    this.log.info("POSTing attachment metadata: ", this.attachmentMetadataInstance);
    return this.http.post<string>(this.urls.sheet.set_mapping, this.attachmentMetadataInstance)
      .pipe(
        catchError(this.handleError('postAttachmentMetadata'))
      );
  }

  postEmailServerDetails(payload: EmailServerDetails): Observable<string> {
    this.log.info("POSTing email server details: ", payload);
    return this.http.post<string>(this.urls.email.set_server, payload)
      .pipe(
        catchError(this.handleError('postEmailServerDetails'))
      );
  }

  postTestEmail(payload: TestEmailDetails): Observable<string> {
    this.log.info("POSTing test email details: ", payload);
    return this.http.post<string>(this.urls.email.send_test, payload)
      .pipe(
        catchError(this.handleError('postTestEmail'))
      );
  }

  postSendEmail(payload: SendEmailContent): Observable<string> {
    this.log.info("POSTing email details: ", payload);
    return this.http.post<string>(this.urls.email.send, payload)
      .pipe(
        catchError(this.handleError('postSendEmail'))
      );
  }

}
