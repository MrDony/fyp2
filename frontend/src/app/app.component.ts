import { Component, OnInit } from '@angular/core';
import { BackendApiService } from './backend-api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  public static notification:any = {
    'showing':false,
    'type':'success',
    'title':'No Notifiactions Yet',
    'content':'No Notifications To Show'
  }

  title = 'LegalBot';
  data:any = null;
  constructor(private backend_service:BackendApiService) {}
  async ngOnInit() {
    //await this.test_ep()
  }
  async test_ep() {
  }

  public static notify(type:string,title:string,content:string){
    AppComponent.notification = {
     'showing':true,
      'type':type,
      'title':title,
      'content':content
    }
    setTimeout(()=>{
      AppComponent.notification = {
       'showing':false,
        'type':'',
        'title':'',
        'content':''
      }
    },3000)
  }

  getNotificationTitle(){
    return AppComponent.notification.title;
  }
  getNotificationContent(){
    return AppComponent.notification.content;
  }
  getNotificationType(){
    return AppComponent.notification.type;
  }
  getNotificationShowing(){
    return AppComponent.notification.showing;
  }

}
