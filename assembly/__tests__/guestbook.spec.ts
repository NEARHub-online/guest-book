import { addMessageId, getMessagesId } from '../main';
import { PostedMessage, comments } from '../model';
import { VMContext, Context, u128 } from 'near-sdk-as';

function createMessage(text: string): PostedMessage {
  return new PostedMessage(text);
}

const message = createMessage('hello world');

describe('message tests', () => {
  afterEach(() => {
    comments.delete('test');
  });

  it('adds a message', () => {
    addMessageId('hello world', 'test');
    const messagesId = getMessagesId('test');
    expect(messagesId.length).toBe(
      1,
      'should only contain one message'
    );
    expect(messagesId[0]).toStrictEqual(
      message,
      'message should be "hello world"'
    );
    expect(messagesId[0].created).toBeGreaterThan(0);
  });

  it('adds a premium message', () => {
    VMContext.setAttached_deposit(u128.from('10000000000000000000000'));
    addMessageId('hello world', 'test');
    const messageAR = getMessagesId('test');
    expect(messageAR[0].premium).toStrictEqual(true,
      'should be premium'
    );
  });

  it('retrieves messages', () => {
    addMessageId('hello world', 'test');
    const messagesArr = getMessagesId('test');
    expect(messagesArr.length).toBe(
      1,
      'should be one message'
    );
    expect(messagesArr).toIncludeEqual(
      message,
      'messages should include:\n' + message.toJSON()
    );
  });

  it('only show the last 10 messages', () => {
    addMessageId('hello world', 'test');
    addMessageId('hello world 1', 'test');
    const newMessages: PostedMessage[] = [];
    for(let i: i32 = 0; i < 10; i++) {
      const text = 'message #' + i.toString();
      addMessageId(text, 'test');
      newMessages.push(createMessage(text));
    }
    const messagesId = getMessagesId('test');
    log(messagesId);
    expect(messagesId).toStrictEqual(
      newMessages,
      'should be the last ten messages'
    );
    expect(messagesId).not.toIncludeEqual(
      message,
      'shouldn\'t contain the first element'
    );
  });
});

describe('invalid message length', () => {
  throws("When message is too long", (): void => {
    createMessage('This is a super long message and it will make the smart contract to fail!!! This is a super long message and it will make the smart contract to fail!!! This is a super long message and it will make the smart contract to fail!!! This is a super long message and it will make the smart contract to fail!!!');
  }, "Sending messages longer than 280 should throw an error.");
});

describe('attached deposit tests', () => {
  beforeEach(() => {
    VMContext.setAttached_deposit(u128.fromString('0'));
    VMContext.setAccount_balance(u128.fromString('0'));
  });

  it('attaches a deposit to a contract call', () => {
    log('Initial account balance: ' + Context.accountBalance.toString());

    addMessageId('hello world', 'test');
    VMContext.setAttached_deposit(u128.from('10'));

    log('Attached deposit: 10');
    log('Account balance after deposit: ' + Context.accountBalance.toString());

    expect(Context.accountBalance.toString()).toStrictEqual(
      '10',
      'balance should be 10'
    );
  });
});
