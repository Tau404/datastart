# DataStart

[![Check and deploy DataStart](https://github.com/Tau404/datastart/actions/workflows/deploy.yml/badge.svg)](https://github.com/Tau404/datastart/actions/workflows/deploy.yml)

Учебный сайт для выбора первого проекта по искусственному интеллекту и анализу данных.

**Сайт:** https://tau404.github.io/datastart/

## Лабораторная работа 5

- Исходный сайт из ЛР4 сохранён отдельным коммитом.
- Ветка `feature/project-photos`: три локальные фотографии, отдельные HTML, CSS и JavaScript.
- Ветка `feature/quiz-navigation`: возврат в мини-тесте, уточнение ничьей и доступность.
- Обе ветки объединены с `main` через pull request с сохранением коммитов слияния.
- Форк внешнего проекта: https://github.com/Tau404/requests

## Лабораторная работа 6

Workflow `.github/workflows/deploy.yml` запускается при push в `main`.
Задание `check` проверяет структуру HTML, уникальные идентификаторы,
локальные файлы и якоря, описания изображений и синтаксис JavaScript.
Задание `deploy` зависит от успешной проверки и публикует только файлы сайта.
Для pull request выполняется проверка без публикации.

Локальная проверка:

```text
python scripts/check_site.py
node --check main.js
```

Это целевые проверки проекта, а не полная проверка HTML по стандарту W3C.
Страница не собирает ответы мини-теста и не передаёт их на сервер.
Источники фотографий указаны в `IMAGE_CREDITS.md`; задания агенту сохранены в `prompts/`.
