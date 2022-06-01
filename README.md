<table>
<tr>
<th><img src="https://artx.ru/sites/default/files/telegram-support/user.jpg" /></th>
<th><img src="https://artx.ru/sites/default/files/telegram-support/staff.jpg" /></th>
</tr>
</table>


## Features

When a user sends a message to the support chat it will create a ticket which will be forwarded to the staff group. Any admin in the staff group may answer that ticket by just replying to it. Salutation is added automatically. Photos or stickers will be forwarded too.

Currently, the support chat offers these commands (staff commands):
* `/id` - returns your telegram id and the group chat id (1234567 -1234567890)
* `/close` - close a ticket manually (in case someone writes 'thank you')
* `/reopen` - reopen a ticket manually
* `/clear` - close all tickets in category or close all tickets in all categories when typed in staff chat

User commands:
* `/start` - prints all public support categories
* `/cat` - print current support categories

Features:
* File forwarding from and to user
* Database for handling open and closed tickets
* Simple anti spam system
* Send tickets to different staff groups
* Anonymize users

## Installation

```bash
$ npm v nestjs-telegram-helpdesk dist.tarball | xargs curl | tar -xz --strip-components=1
```

## Telegram token

To use the [Telegram Bot API](https://core.telegram.org/bots/api),
you first have to [get a bot account](https://core.telegram.org/bots)
by [chatting with BotFather](https://core.telegram.org/bots#6-botfather).

BotFather will give you a *token*, something like `123456789:AbCdfGhIJKlmNoQQRsTUVwxyZ`.

## Configuration

```bash
$ mv settings.example.yml settings.yml
```

### Settings

#### `db`
Database settings

- `host`
- `port`
- `username`
- `password`

#### `redis`
Redis for exchange with external process via Bull

_optional. Used for support categories update in runtime_  
- `host`
- `port`

#### `bull`
Bull queues for external process exchange;

_optional, required if "redis" is defined_

- `appQueue: "app-queue-name"` # sends a message when application starts
- `categoriesQueue: "cat-queue-name"` # listens to messages with support categories from external process

#### `botToken`
Support bot token

#### `staffChatId`
Admin's group. Accumulate messages from all categories

#### `ownerId`
Admin's telegram id

#### `spamTime`
time (in MS) in which user may send {spamCantMsg} messages

#### `spamCantMsg`
Maximum messages in {spamTime} MS

#### `autoCloseTickets`
Close tickets after answering

#### `anonymousTickets`
Include userid in tickets or not

#### `categories`
_optional_

Array of built-in support categories

- id: '100500' # category id
- name: 'Superchat' # category name
- groupId: '-100500' # telegram group id
- isPublic: true # public flag

## Support categories

Adding support categories allows you to have invitation links:

`https://t.me/{helpdesk_bot_name}?start={id}`

- `helpdesk_bot_name` is your bot's username
- `id` is category id from config. Unique string, e.g. UUID

## Running the app

### Docker
```bash
$ docker-compose up -d
```

### PM2

#### Once
```bash
$ npm i -g pm2
$ mv ecosystem.config.example.js ecosystem.config.js
```

#### Every time you update the app
```bash
$ npm i --only=prod
$ npm run migration:prod
$ pm2 start ecosystem.config.js
```


## License

[MIT](LICENSE)
