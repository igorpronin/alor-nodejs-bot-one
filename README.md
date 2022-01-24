# Бот для торговли на срочном рынке Мосбирже (фьючерсы и опционы) через брокера Алор

#### Version 0.1.3

## Внимание! Проект в стадии разработки. Пользоваться нельзя!

### Алгоритм обновления списка инструментов

Список доступных контрактов на FORTS-площадке Мосбиржи при работе приложения обновляется по расписанию, ежедневно в 9:00 МСК.
При обновлении списка контрактов в таблице `settings` обновляется значение `forts_instruments_list_update_date`.
При запуске приложения в случае если в таблице `settings` значение `forts_instruments_list_update_date` отсутствует, 
или если в момент запуска приложения дата, указанная в значении `forts_instruments_list_update_date`
отличается от даты запуска приложения, обновление списка инструментов происходит в момент запуска приложения.

### Бэклог

_(!) - приоритет._

- Build-скрипт.
- Проверить корректность работы обновления списка инструментов с учетом разных часовых поясов.
- Выбрать и установать оптимальное время обновления списка инструментов.
- Проверить как работает функция крона с учетом timezone.
- Причесать вывод статистики по инструментам.
- Реализовать выбор портфолио для работы скрипта, сохранение в настройках.
- Реализовать сохранение хедера авторизации в инстанс axios.

### Разработчику

##### Работа интерфейса при использовании nodemon

Чтобы событие нажатия клавиш работало корректно, необходимо отключить прослушивание клавиатурных событий самим nodemon.
Параметр регулируется параметром `restartable` в файле `nodemon.json`, значение которого необходимо установить в `false`. Решение [отсюда](https://github.com/remy/nodemon/issues/1041#issuecomment-558007850). Другие настройки nodemon [тут](https://github.com/remy/nodemon/blob/master/doc/sample-nodemon.md).

##### Документация API Алора

https://alor.dev/docs

### Контакты

https://t.me/InvestorPronin

### Лицензия

Copyright 2022, Igor Pronin

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
