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
  messages: any = [];

  chat_id: any = null;

  prompt: string = '';

  previous_prompt_id: any = null;
  waitingForResponse: boolean = false;
  sendingMessage:any = '';

  constructor(private route: ActivatedRoute, private dataService: BackendApiService) {
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
        if (chatData.createNewChat) {
          this.createChatSession()
        }
        else {
          const getChat$ = this.dataService.getChatPrompts(localStorage.getItem('username')!, this.chat_id)
          forkJoin([getChat$]).subscribe((
            [getChatResponse]
          ) => {
            console.log('chat got from backend:', getChatResponse)
            for (let prompt of getChatResponse) {
              //console.log('message:',prompt)
              this.messages.push({
                'by': 'User',
                'text': prompt.prompt_text,
                'datetime': prompt.prompt_date,
              })
              this.messages.push({
                'by': 'Bot',
                'text': prompt.response_text,
                'datetime': prompt.response_date,
                'response_id':prompt.response_id,
                'rating': prompt.response_rating
              })
            }
            console.log('messages:', this.messages)
          })
        }
      }
    });
    console.log('chat_id:', this.chat_id)
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

  createChatSession() {
    const chatCreation$ = this.dataService.createChat(localStorage.getItem('username')!)

    forkJoin([chatCreation$]).subscribe((
      [chatCreationResponse]
    ) => {
      console.log(chatCreationResponse)
      this.chat_id = chatCreationResponse.chat_id
    })
  }


  convertToContextString(messages: any[]): string {
    let result: string[] = [];

    for (const message of messages) {
      if (message.by === 'User') {
        result.push(`User: ${message.text.join(' ')}`);
      } else if (message.by === 'Bot') {
        result.push(`Agent: ${message.text.join(' ')}`);
      }
      console.log(result)
    }

    return result.join('\n');
  }
  async resolvePrompt() {
    if (this.waitingForResponse) {
      return;
    }
    if (this.prompt.length > 0) {
      this.waitingForResponse = true;
      const context = this.convertToContextString(this.messages.slice(-2))

      console.log('previous_two_messages:', context)
      const promptResolve$ = await this.dataService.resolvePrompt(this.prompt, localStorage.getItem('username')!, this.chat_id, context);

      //
      this.sendingMessage = { 'by': 'User', 'text': this.prompt.split('\n'), 'datetime': new Date() }
      this.scrollToBottom()
      forkJoin([promptResolve$]).subscribe((
        [promptResolveResponse]
      ) => {
        console.log('resolved prompt:', promptResolveResponse)
        const prompt = promptResolveResponse.prompt;
        const response = promptResolveResponse.response;
        this.messages.push({ 'by': 'User', 'text': prompt.prompt_text.split('\n'), 'datetime': prompt.prompt_date })
        // promptResolveResponse.response.response_text = promptResolveResponse.response.response_text.replace(/\n/g, '<br>');

        if (promptResolveResponse.result) {
          this.messages.push({ 'by': 'Bot', 'text': response.response_text.split('\n'), 'datetime': response.response_date, 'rating': response.rating, 'response_id':response.response_id })
          this.scrollToBottom()
          this.prompt = ''
          this.waitingForResponse = false;
          return;
        }

      }).add(() => {
        if (this.waitingForResponse) {
          this.messages.push({ 'by': 'Bot', 'text': ['Some error occured'], 'datetime':'error', 'rating':0 })
          this.scrollToBottom()
          this.prompt = ''
          this.waitingForResponse = false;
        }
      })
    }
  }

  onRatingSelected(rating: number): void {
    console.log('Rating selected:', rating);
    // You can perform further actions here, such as updating the rating in the database
  }

}
