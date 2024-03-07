import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendApiService } from '../backend-api.service';
import { forkJoin } from 'rxjs';




@Component({
  selector: 'app-chat-bot',
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.css']
})
export class ChatBotComponent implements OnInit, AfterViewInit {

  @ViewChildren('messageContainer') messageContainers!: QueryList<ElementRef>;
  messages: any=[];

  chat_id:any=null;

  prompt:string='';

  previous_prompt_id:any = null;

  constructor(private route: ActivatedRoute, private dataService:BackendApiService) {
  }
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const chatData = history.state.chatData;
  
      if (chatData) {
        // You can access chatData.chatID and chatData.createNewChat here
        console.log('Chat ID:', chatData.chatID);
        this.chat_id = chatData.chatID
        console.log('Create New Chat:', chatData.createNewChat);
  
        //const chat$ = this.dataService.getChat()
        if(chatData.createNewChat){
          this.createChatSession()
        }
        else{
          const getChat$ = this.dataService.getChatPrompts(localStorage.getItem('username')!,this.chat_id)
          forkJoin([getChat$]).subscribe((
            [getChatResponse]
          )=>{
            console.log('chat?:',getChatResponse)
            for(let prompt of getChatResponse.prompts){
              this.messages.push({
                'by':'user',
                'text':prompt.prompt_text
              })
              this.messages.push({
                'by':'bot',
                'text':prompt.response_text
              })
            }
          })
        }
      }
    });
    console.log('chat_id:',this.chat_id)
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    // Use setTimeout to ensure the view is updated before scrolling
    setTimeout(() => {
      const containers = this.messageContainers.toArray();
      if (containers.length > 0) {
        const lastContainer = containers[containers.length - 1];
        lastContainer.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        console.log(lastContainer)
      }
    }, 200);
  }

  createChatSession(){
    const chatCreation$ = this.dataService.createChat(localStorage.getItem('username')!)

    forkJoin([chatCreation$]).subscribe((
      [chatCreationResponse]
    )=>{
      console.log(chatCreationResponse)
      this.chat_id = chatCreationResponse.chat_id
    })
  }

  resolvePrompt(){
    if(this.prompt.length>0){
      const promptResolve$ = this.dataService.resolvePrompt(this.prompt,localStorage.getItem('username')!,this.chat_id);

      this.messages.push({'by':'user','text':[this.prompt]})
      forkJoin([promptResolve$]).subscribe((
        [promptResolveResponse]
      )=>{
        console.log('resolved prompt:',promptResolveResponse)
        // promptResolveResponse.response.response_text = promptResolveResponse.response.response_text.replace(/\n/g, '<br>');
        
        if(promptResolveResponse.result){
          this.messages.push({'by':'bot','text':promptResolveResponse.response.response_text})
          this.prompt = ''
        }
        
      })
    }
  }

}
