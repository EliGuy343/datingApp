import { Component, Input, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { Member } from 'src/app/models/member';
import { Photo } from 'src/app/models/Photo';
import { User } from 'src/app/models/user';
import { AccountService } from 'src/app/services/account.service';
import { MembersService } from 'src/app/services/members.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  @Input() member?:Member;
  uploader!: FileUploader;
  hasBaseDropZoneOver = false;
  hasAnotherDropZoneOver = false;
  baseUrl = environment.apiUrl;
  user: User | null = null;  
  constructor(private accountService:AccountService,
    private toastr:ToastrService, private memberService: MembersService) {
      this.accountService.currentUser$.pipe(take(1)).subscribe(
        res => this.user = res)
    }

  ngOnInit(): void {
    this.initializeUploader();
  }

  fileOverBase(e: any) {
    this.hasBaseDropZoneOver = e;
  }

  setMainPhoto(photo: Photo) {
    this.memberService.setMainPhoto(photo.id).subscribe(()=>{
      if(this.user == null) {
        this.toastr.error("error: User is null");
        return;
      }
      this.user.photoUrl = photo.url
      this.accountService.setCurrentUser(this.user);
      this.member!.photoUrl = photo.url;
      this.member?.photos.forEach(p =>{
        if(p.isMain) 
          p.isMain = false;
        
        if(p.id == photo.id)
          p.isMain = true;
      })
      }
    );
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrl + 'users/add-photo',
      authToken:'Bearer ' + this.user?.token,
      isHTML5: true,
      allowedFileType:['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    });

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    }

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if(response) {
        const photo = JSON.parse(response);
        this.member?.photos.push(photo);
      }
    }
  }

}
