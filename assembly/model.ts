import { context, u128, PersistentVector, PersistentMap } from "near-sdk-as";

const initDate = 1640995200000000000;
const maxLength = 280;
/** 
 * Exporting a new class PostedMessage so it can be used outside of this file.
 */
@nearBindgen
export class PostedMessage {
  premium: boolean;
  sender: string;
  banned: boolean;
  created: u64;
  constructor(public text: string) {
    assert(text.length <= maxLength, "Message is too long, max length is " + maxLength.toString());
    this.premium = context.attachedDeposit >= u128.from('10000000000000000000000');
    this.sender = context.sender;
    this.created = (context.blockTimestamp - initDate) / 10 ** 9;
  }
}
/**
 * collections.vector is a persistent collection. Any changes to it will
 * be automatically saved in the storage.
 * The parameter to the constructor needs to be unique across a single contract.
 * It will be used as a prefix to all keys required to store data in the storage.
 */
export const comments = new PersistentMap<string, PersistentVector<PostedMessage>>("");