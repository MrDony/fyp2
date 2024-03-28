import { Component, OnInit } from '@angular/core';
import { BackendApiService } from '../backend-api.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  userChats:any;
  username_:any;
  chatsList:any=[];

  constructor(private backendService:BackendApiService, private router:Router){
    if(localStorage.getItem('username')){
      this.username_ = localStorage.getItem('username')
    }
    else{
      localStorage.clear()
      router.navigateByUrl('login')
    }
  }

  async ngOnInit(){
    const userChats$ = this.backendService.getChats(localStorage.getItem('username')!);


    forkJoin([userChats$]).subscribe((
      [userChatsResponse]
    )=>{
      console.log('user chats=>:',userChatsResponse)
      this.chatsList = userChatsResponse
    })
  }

  openChat(chat:any){
    
  }

  deleteChat(chat_id:any){
    console.log('deleting chat_id:',chat_id)
    const deleteChat$ = this.backendService.deleteChat(localStorage.getItem('username')!,chat_id);
    forkJoin([deleteChat$]).subscribe((
      [deleteChatResponse]
    )=>{
      console.log('delete chat response:',deleteChatResponse)
      this.ngOnInit()
    })
  }



}
