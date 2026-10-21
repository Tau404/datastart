/*
     * Мини-тест «Выбери первый проект».
     * Каждый вариант ответа начисляет баллы одному или нескольким проектам:
     *   data    — анализ открытого датасета
     *   chatbot — чат-бот на готовой модели
     *   vision  — распознавание изображений
     * По итогам выбирается проект с наибольшей суммой баллов.
     * Данные не покидают браузер: никаких сетевых запросов здесь нет.
     */

    var QUESTIONS = [
      {
        text: "Что вам интереснее всего?",
        options: [
          { label: "Числа, таблицы и закономерности",       points: { data: 3, chatbot: 0, vision: 1 } },
          { label: "Тексты, диалоги и общение",             points: { data: 0, chatbot: 3, vision: 0 } },
          { label: "Картинки, фото и всё визуальное",       points: { data: 0, chatbot: 0, vision: 3 } },
          { label: "Пока не знаю — хочу попробовать простое", points: { data: 2, chatbot: 1, vision: 0 } }
        ]
      },
      {
        text: "Какой у вас опыт в программировании?",
        options: [
          { label: "Никогда не писал(а) код",               points: { data: 3, chatbot: 1, vision: 0 } },
          { label: "Пробовал(а) немного, по урокам",        points: { data: 1, chatbot: 2, vision: 1 } },
          { label: "Писал(а) простые скрипты или программы", points: { data: 0, chatbot: 1, vision: 2 } }
        ]
      },
      {
        text: "Сколько времени готовы уделять проекту в неделю?",
        options: [
          { label: "2–3 часа, понемногу",                   points: { data: 3, chatbot: 1, vision: 0 } },
          { label: "4–6 часов",                             points: { data: 0, chatbot: 2, vision: 1 } },
          { label: "Больше 6 часов, готов(а) погрузиться",  points: { data: 0, chatbot: 1, vision: 2 } }
        ]
      },
      {
        text: "Какой результат хочется увидеть в конце?",
        options: [
          { label: "Наглядный отчёт с графиками и выводами", points: { data: 3, chatbot: 0, vision: 0 } },
          { label: "Работающий бот, с которым можно поговорить", points: { data: 0, chatbot: 3, vision: 0 } },
          { label: "Модель, которая узнаёт объекты на фото", points: { data: 0, chatbot: 0, vision: 3 } }
        ]
      }
    ];

    var RESULTS = {
      data: {
        title: "Анализ открытого датасета",
        text: "Самый мягкий старт: вы быстро увидите результат в виде графиков и на практике " +
              "поймёте, как из таблицы рождаются выводы. Ориентировочно 2–4 недели в спокойном темпе.",
        target: "project-data"
      },
      chatbot: {
        title: "Чат-бот на готовой модели",
        text: "Отличный баланс интереса и сложности: вы соберёте работающего бота на бесплатной " +
              "готовой модели, без платного API. Ориентировочно 3–6 недель.",
        target: "project-chatbot"
      },
      vision: {
        title: "Распознавание изображений",
        text: "Проект для тех, кто готов повозиться: дообучите готовую бесплатную нейросеть " +
              "на своих фотографиях. Ориентировочно 4–8 недель — и очень наглядный результат.",
        target: "project-vision"
      }
    };

    // Текущее состояние теста
    var currentQuestion = 0;
    var answers = [];
    var scores = { data: 0, chatbot: 0, vision: 0 };

    // Ссылки на элементы страницы
    var progressEl = document.getElementById("quiz-progress");
    var questionEl = document.getElementById("quiz-question");
    var optionsEl  = document.getElementById("quiz-options");
    var resultEl   = document.getElementById("quiz-result");
    var resultTitleEl = document.getElementById("quiz-result-title");
    var resultTextEl  = document.getElementById("quiz-result-text");
    var gotoBtn    = document.getElementById("quiz-goto");
    var restartBtn = document.getElementById("quiz-restart");
    var backBtn = document.getElementById("quiz-back");
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Отрисовка текущего вопроса
    function renderQuestion(moveFocus) {
      var q = QUESTIONS[currentQuestion];
      progressEl.textContent = "Вопрос " + (currentQuestion + 1) + " из " + QUESTIONS.length;
      questionEl.textContent = q.text;
      optionsEl.innerHTML = "";
      resultEl.classList.remove("visible");
      backBtn.hidden = currentQuestion === 0;

      q.options.forEach(function (opt, optionIndex) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-option";
        btn.textContent = opt.label;
        btn.addEventListener("click", function () {
          answers[currentQuestion] = optionIndex;
          scores = { data: 0, chatbot: 0, vision: 0 };
          answers.forEach(function (answer, index) {
            for (var key in scores) { scores[key] += QUESTIONS[index].options[answer].points[key] || 0; }
          });
          currentQuestion++;
          if (currentQuestion < QUESTIONS.length) {
            renderQuestion(true);
          } else {
            showResult();
          }
        });
        optionsEl.appendChild(btn);
      });
      // При первом открытии страницы фокус остаётся на месте.
      // После ответа новый вопрос получает фокус вместо удалённой кнопки.
      if (moveFocus) { questionEl.focus({ preventScroll: true }); }
    }

    // Определение победителя и показ результата
    function showResult() {
      var winner = "data";
      for (var key in scores) {
        if (scores[key] > scores[winner]) { winner = key; }
      }
      var res = RESULTS[winner];
      var tied = Object.keys(scores).filter(function (key) { return scores[key] === scores[winner]; });
      backBtn.hidden = false;

      progressEl.textContent = "Готово!";
      questionEl.textContent = "";
      optionsEl.innerHTML = "";

      resultTitleEl.textContent = res.title;
      resultTextEl.textContent = res.text + (tied.length > 1 ? " Несколько направлений набрали одинаковый балл: " + tied.map(function (key) { return RESULTS[key].title; }).join(", ") + ". Показан первый из них в порядке карточек; сравните варианты и выберите интересующий." : "");
      gotoBtn.setAttribute("data-target", res.target);
      resultEl.classList.add("visible");
      resultTitleEl.focus({ preventScroll: true });
    }

    // Кнопка «Показать проект»: плавный скролл и подсветка карточки
    gotoBtn.addEventListener("click", function (event) {
      event.preventDefault();
      var card = document.getElementById(gotoBtn.getAttribute("data-target"));
      if (!card) { return; }
      document.querySelectorAll(".project-card").forEach(function (c) {
        c.classList.remove("highlight");
      });
      card.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "center" });
      card.setAttribute("tabindex", "-1");
      card.focus({ preventScroll: true });
      // Подсвечиваем карточку после начала прокрутки
      setTimeout(function () { card.classList.add("highlight"); }, reducedMotion.matches ? 0 : 400);
    });

    // Кнопка «Пройти ещё раз»: сброс состояния теста
    restartBtn.addEventListener("click", function () {
      currentQuestion = 0;
      answers = [];
      scores = { data: 0, chatbot: 0, vision: 0 };
      renderQuestion(true);
    });

    backBtn.addEventListener("click", function () {
      if (currentQuestion === 0) { return; }
      currentQuestion--;
      answers = answers.slice(0, currentQuestion);
      renderQuestion(true);
    });

    // Стартуем тест при загрузке страницы
    renderQuestion();
