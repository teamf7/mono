[
  {
    "title": "Выбор ОУ\\ОК",
    "id": 1,
    "parentFormId": null,
    "parentElementId": 0,
    "items": [
      {
        "type": "button",
        "text": "Вопросы",
        "id": 1,
        "target": {
          "type": "question",
          "id": 9
        }
      },
      {
        "type": "button",
        "text": "Предмет сделки",
        "id": 2,
        "target": {
          "type": "deal_subject",
          "id": 9
        },
        "roles": [
          "agent|printsipal",
          "professor|captain"
        ]
      },
      {
        "type": "button",
        "text": "Поручитель кредитор должник заемщик",
        "id": 3,
        "target": {
          "type": "deal_subject",
          "id": 9
        },
        "roles": [
          "poruchitel|kreditor|dolzhnik|zaemshchik"
        ]
      },
      {
        "type": "button",
        "text": "Продавец",
        "id": 4,
        "target": {
          "type": "deal_subject",
          "id": 9
        },
        "roles": [
          "prodavets"
        ]
      },
      {
        "type": "button",
        "text": "Подформа",
        "id": 5,
        "target": {
          "type": "form",
          "id": 9
        }
      },
      
      {
        "type": "button",
        "text": "Подформа 2",
        "id": 6,
        "target": {
          "type": "form",
          "id": 10
        }
      }
    ]
  },
  {
    "title": "Подформа 1",
    "id": 9,
    "parentFormId": null,
    "items": [
      {
        "type": "button",
        "text": "Подформа 1",
        "id": 1,
        "target": {
          "type": "deal_subject",
          "id": 9
        },
        "roles": [
          "agent|printsipal",
          "professor|captain"
        ]
      }
    ]
  },
  {
    "title": "Подформа 2",
    "id": 10,
    "parentFormId": null,
    "items": [
      {
        "type": "button",
        "text": "Подформа 1",
        "id": 1,
        "target": {
          "type": "deal_subject",
          "id": 9
        },
        "roles": [
          "agent|printsipal",
          "professor|captain"
        ]
      }
    ]
  }
]
