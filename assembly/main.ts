import { PostedMessage, messages, comments } from './model';
import { context, PersistentVector } from "near-sdk-as";

// --- contract code goes below

// The maximum number of latest messages the contract returns.
const MESSAGE_LIMIT = 10;

/**
 * Adds a new message under the name of the sender's account id.\
 * NOTE: This is a change method. Which means it will modify the state.\
 * But right now we don't distinguish them with annotations yet.
 */
export function addMessage(text: string): void {
  // Creating a new message and populating fields with our data
  const message = new PostedMessage(text);
  // Adding the message to end of the persistent collection
  messages.push(message);
}

export function addMessageId(text: string, id: string): void {
  const message = new PostedMessage(text);
  const idMessages = comments.get(id);
  if(idMessages != null){
    idMessages.push(message);
  }
  else{
    const newMessages = new PersistentVector<PostedMessage>(id);
    newMessages.push(message);
    comments.set(id, newMessages);
  }

}

/**
 * Returns an array of last N messages.\
 * NOTE: This is a view method. Which means it should NOT modify the state.
 */
export function getMessages(): PostedMessage[] {
  const numMessages = min(MESSAGE_LIMIT, messages.length);
  const startIndex = messages.length - numMessages;
  const result = new Array<PostedMessage>(numMessages);
  for(let i = 0; i < numMessages; i++) {
    result[i] = messages[i + startIndex];
  }
  return result;
}

export function getMessagesId(id: string): PostedMessage[] {
  // get message for id
  let idMessages = comments.get(id);

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

export function banComment(id: string, text: string): bool{
  assert(context.predecessor == context.contractName, "Only the contractowner can ban a comment");

  let idMessages = comments.get(id);

  if(idMessages == null){
    return false;
  }

  for(let i = 0; i < idMessages.length; i++) {
    if (idMessages[i].text == text){
      idMessages[i].banned = true;
      return true;
    }
  }

  return false;
}