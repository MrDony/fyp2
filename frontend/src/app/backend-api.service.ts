import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { _API_URL } from './constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendApiService {


  private baseUrl = 'http://127.0.0.1:5000/';

  // Define the endpoint URL for user authentication
  private authenticateUrl = 'api/users/authenticate';

  private createUserUrl = 'api/users';

  private getChatsUrl = 'api/get-chats';

  private getPromptUrl = 'api/prompts';

  private createChatUrl = 'api/chat'

  private getChatUrl = 'api/chat'

  private createPromptUrl = 'api/prompts'

  private resolvePromptUrl = 'api/resolve-prompt'

  constructor(private http: HttpClient) { }


  authenticateUser(username: string, password: string): Observable<{ result: boolean, user: any }> {
    const requestBody = { username, password };
    return this.http.post<{ result: boolean, user: any }>(`${this.baseUrl}${this.authenticateUrl}`, requestBody);
  }

  createUser(username: string, email: string, password: string): Observable<{ message: string, result: boolean }> {
    const requestBody = { username, email, password };
    return this.http.post<{ message: string, result: boolean }>(`${this.baseUrl}${this.createUserUrl}`, requestBody);
  }


  // Function to get chats for a user
  getChats(username: string):Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${this.getChatsUrl}?username=${username}`);
  }

  getPrompt(username: string, promptId: number):Observable<any> {
    // Make a GET request to the get-prompt endpoint with the username and prompt_id as route parameters
    return this.http.get<any>(`${this.baseUrl}${this.getPromptUrl}/${username}/${promptId}`);
  }

  // Function to create a chat
  createChat(username: string):Observable<{message:string, chat_id:any}> {
    const headers = new HttpHeaders();
    const body = {
      username: username
    };
    return this.http.post<any>(`${this.baseUrl}${this.createChatUrl}`, body, { headers });
  }

  // Function to get chat prompts
  getChatPrompts(username: string, chatId: number) {
    const headers = new HttpHeaders();
    return this.http.get<any>(`${this.baseUrl}${this.getChatUrl}?username=${username}&chat_id=${chatId}`, { headers });
  }

  // Function to create a prompt
  createPrompt(username: string, promptText: string, previousPromptId?: number) {
    // Prepare headers if needed
    const headers = new HttpHeaders();
    const body = {
      username: username,
      prompt_text: promptText,
      previous_prompt_id: previousPromptId
    };
    return this.http.post<any>(`${this.baseUrl}${this.createPromptUrl}`, body, { headers });
  }


  resolvePrompt(prompt: string, username:string, chatId: number):Observable<{response:any, prompt:any, result:boolean}> {
    const headers = new HttpHeaders();
    const body = {
      prompt: prompt,
      username:username,
      chat_id: chatId
    };
    return this.http.post<{response:any, prompt:any, result:boolean}>(`${this.baseUrl}${this.resolvePromptUrl}`, body, { headers });
  }

}
