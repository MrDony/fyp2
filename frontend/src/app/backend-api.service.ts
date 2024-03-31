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

  private getChatsUrl = 'api/chat';

  private getPromptUrl = 'api/prompts';

  private createChatUrl = 'api/chat'

  private getChatUrl = 'api/chat'

  private createPromptUrl = 'api/prompts'

  private resolvePromptUrl = 'api/chat'

  private updateResponseRatingUrl = 'api/chat/rating'

  constructor(private http: HttpClient) { }


  authenticateUser(username: string, password: string): Observable<{ result: boolean, user: any }> {
    const headers = new HttpHeaders()
    const requestBody = { username, password };
    console.log('authenticating user:', requestBody, ' at ', `${this.baseUrl}${this.authenticateUrl}`);
    const resp = this.http.post<{ result: boolean, user: any }>(`${this.baseUrl}${this.authenticateUrl}`, requestBody, { headers });
    console.log('resp:', resp)
    return resp;
  }

  createUser(username: string, email: string, password: string): Observable<{ message: string, result: boolean }> {
    const headers = new HttpHeaders()
    const requestBody = { username, email, password };
    console.log('creating user:', requestBody, `at ${this.baseUrl}${this.createUserUrl}`);
    const resp = this.http.post<{ message: string, result: boolean }>(`${this.baseUrl}${this.createUserUrl}`, requestBody, { headers });
    console.log('resp:', resp)
    return resp;
  }


  // Function to get chats for a user
  getChats(username: string):Observable<any> {
    const headers = new HttpHeaders()
    console.log('getting chats for:', username, `at ${this.baseUrl}${this.getChatsUrl}`, { headers });
    const resp = this.http.get<any>(`${this.baseUrl}${this.getChatsUrl}?username=${username}`, { headers });
    console.log('resp:', resp)
    return resp;
  }

  getPrompt(username: string, promptId: number):Observable<any> {
    // Make a GET request to the get-prompt endpoint with the username and prompt_id as route parameters
    console.log('getting prompt:', username, promptId, `at ${this.baseUrl}${this.getPromptUrl}`);
    const resp = this.http.get<any>(`${this.baseUrl}${this.getPromptUrl}/${username}/${promptId}`);
    console.log('resp:', resp)
    return resp;
  }

  // Function to create a chat
  createChat(username: string):Observable<{message:string, chat_id:any}> {
    const headers = new HttpHeaders();
    const body = {
      username: username
    };
    console.log('creating chat:', username, `at ${this.baseUrl}${this.createChatUrl}`);
    const resp = this.http.post<any>(`${this.baseUrl}${this.createChatUrl}`, body, { headers });
    console.log('resp:', resp)
    return resp;
  }

  // Function to delete a chat
  deleteChat(username: string, chatId: number):Observable<any> {
    const headers = new HttpHeaders();
    console.log('deleting chat:', username, chatId, `at ${this.baseUrl}${this.getChatUrl}/${chatId}?username=${username}`);
    const resp = this.http.delete<any>(`${this.baseUrl}${this.getChatUrl}/${chatId}?username=${username}`, { headers });
    console.log('resp:', resp)
    return resp;
  }

  // Function to get chat prompts
  getChatPrompts(username: string, chatId: number) {
    const headers = new HttpHeaders();
    console.log('getting chat prompts:', username, chatId, `at ${this.baseUrl}${this.getChatUrl}/${chatId}?username=${username}&chat_id=${chatId}`);
    const resp = this.http.get<any>(`${this.baseUrl}${this.getChatUrl}/${chatId}?username=${username}&chat_id=${chatId}`, { headers });
    console.log('resp:', resp)
    return resp;
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
    console.log('creating prompt:', username, promptText, previousPromptId, `at ${this.baseUrl}${this.createPromptUrl}`);
    const resp = this.http.post<any>(`${this.baseUrl}${this.createPromptUrl}`, body, { headers });
    console.log('resp:', resp)
    return resp;
  }


  resolvePrompt(prompt: string, username:string, chatId: number, context: string):Observable<{response:any, prompt:any, result:boolean}> {
    const headers = new HttpHeaders();
    const body = {
      prompt_text: prompt,
      username:username,
      chat_id: chatId,
      context: context
    };
    console.log('add prompt and response:', prompt, username, chatId, `at ${this.baseUrl}${this.resolvePromptUrl}/${chatId}`);
    const resp = this.http.post<{response:any, prompt:any, result:boolean}>(`${this.baseUrl}${this.resolvePromptUrl}/${chatId}`, body, { headers });
    console.log('resp:', resp)
    return resp;
  }

  // Function to give rating to a response given the response_id and rating
  updateResponseRating(responseId: number, rating: number):Observable<{message:string, result:boolean}> {
    const headers = new HttpHeaders();
    const body = {
      response_id: responseId,
      rating: rating
    };
    console.log('updating response rating:', responseId, rating, `at ${this.baseUrl}${this.updateResponseRatingUrl}`);
    const resp = this.http.post<{message:string, result:boolean}>(`${this.baseUrl}${this.updateResponseRatingUrl}`, body, { headers });
    console.log('resp:', resp)
    return resp
  }

}
