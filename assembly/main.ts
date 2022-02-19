import { PostedMessage, comments } from './model';
import { context, PersistentVector } from "near-sdk-as";

// --- contract code goes below

// The maximum number of latest messages the contract returns.
const MESSAGE_LIMIT = 10;
const MAX_LENGTH = 280;

export function addMessageId(text: string, id: string): void {
  assert(text.length <= MAX_LENGTH, "Message is too long, max length is " + MAX_LENGTH);
  const message = new PostedMessage(text);
  let idMessages = comments.get(id);
  if(idMessages == null){
    idMessages = new PersistentVector<PostedMessage>(id);
  }
  idMessages.push(message);
  comments.set(id, idMessages);

}

export function getMessagesId(id: string): PostedMessage[] {
  // get message for id
  const idMessages = comments.get(id);

  if(idMessages == null){
    return new Array<PostedMessage>(0);
  }

  const numMessages = min(MESSAGE_LIMIT, idMessages.length);
  const startIndex = idMessages.length - numMessages;
  const result = new Array<PostedMessage>(numMessages);
  for(let i = 0; i < numMessages; i++) {
    result[i] = idMessages[i + startIndex];
  }
  return result;
} 

export function banMessage(id: string, text: string, ban: boolean): boolean{
  assert(context.predecessor == context.contractName, "Only the contractowner can ban a comment");

  let idMessages = comments.get(id);

  if(idMessages == null){
    return false;
  }

  for(let i = 0; i < idMessages.length; i++) {
    if (idMessages[i].text == text){
      let message = new PostedMessage(text);
      message.banned = ban;
      message.sender = idMessages[i].sender;
      idMessages.replace(i, message);
      return true;
    }
  }

  return false;
}