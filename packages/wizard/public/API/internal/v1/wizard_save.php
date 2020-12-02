{
  "approvalList2": {
    "1": {
      "id": 33,
      "name": "Philip J. Fry",
      "position": "Delivery boy",
      "group": "Group 1",
      "question": [
        8
      ]
    },
    "2": {
      "id": 34,
      "name": "Bender Bending Rodriguez",
      "position": "Bender/Chef",
      "group": "Group 1",
      "question": [
        9
      ]
    },
    "3": {
      "id": 35,
      "name": "Hermes Conrad",
      "position": "Bureaucrat",
      "group": "Group 2",
      "question": [
        9
      ]
    }
  },
  "gid": {
    "questionList": [
      {
        "id": 9,
        "sort": 99,
        "parentId": "",
        "text": "#deal.1.side.1.name# #deal.1.sum# Текст: #textParam# \n Правление: #executiveBoard.list# #dateFrom#",
        "title": "Тестовый alone 2 #textParam#",
        "position": "alone",
        "hint": "dsfjhsd;fjsd;fsd;lfsd;lflsdkf;ldsk",
        "type": "main",
        "voteResult": "Y",
        "params": [
          "textParam",
          "executiveBoard.list",
          "file",
          "dateFrom"
        ],
        "managementDepartment": [
          23
        ]
      },
      {
        "id": 8,
        "sort": 100,
        "parentId": "",
        "text": "Фио: #CEO.FullName# \r\n Родительный: #CEO.FullName.UF_GENITIVE#",
        "title": "Тестовый alone 1",
        "position": "alone",
        "type": "main",
        "voteResult": "Y",
        "params": [
          "CEO.FullName",
          "CEO.FullName.UF_GENITIVE"
        ],
        "managementDepartment": [
          23
        ]
      },
      {
        "id": 13,
        "sort": 98,
        "parentId": "",
        "text": "Текст: #textParam# \r\n Родительный: #CEO.FullName.UF_GENITIVE#",
        "title": "Тестовый hidden 1",
        "voteResult": "Y",
        "position": "hidden",
        "type": "add",
        "params": [
          "textParam",
          "CEO.FullName",
          "CEO.FullName.UF_GENITIVE"
        ],
        "managementDepartment": [
          23
        ]
      }
    ],
    "paramsList": {
      "CEO.FullName": {
        "type": "datalist",
        "url": "/padej.json?",
        "description": "ФИО",
        "key": "UF_NOMINATIVE"
      },
      "textParam": {
        "type": "input",
        "paramDataType": "number",
        "description": "Текстовый параметр"
      },
      "dateFrom": {
        "type": "date",
        "description": "период с",
        "value": "2020-01-01"
      },
      "executiveBoard.list": {
        "type": "ul-collapsed",
        "description": "Список членов Правления",
        "url": "/padej.json?",
        "key": "UF_NOMINATIVE",
        "source": {
          "type": "datalist",
          "url": "/padej.json?",
          "description": "ФИО"
        },
        "list": {
          "default": [
            {
              "text": "#value# (Председатель Правления)"
            }
          ],
          "generic": {
            "text": "#value# (Род: #value.UF_GENITIVE#)"
          }
        }
      },
      "file": {
        "type": "file",
        "url": "/fileUpload.json",
        "description": "Приложение N",
        "fileType": "doc",
        "maxSize": 23423423,
        "value": []
      },
      "CEO.FullName.UF_GENITIVE": {
        "type": "ref",
        "source": "CEO.FullName",
        "description": "ФИО gen",
        "key": "UF_GENITIVE"
      }
    },
    "id": "gid",
    "managementDepartment": [
      {
        "id": 23,
        "name": "ГИД"
      }
    ]
  },
  "deals": [
    {
      "id": 2,
      "sides": [
        {
          "name": "ПАО НК Роснефть - Смоленскнефтепродукт",
          "isOg": true
        },
        {
          "name": "Банк ВБРР (АО)",
          "isOg": true
        }
      ],
      "sum": "1000",
      "text": "Совершение Банк ВБРР (Клиент) в рамках документа с ПАО НК Роснефть - Смоленскнефтепродукт"
    },
    {
      "id": 1,
      "sides": [
        {
          "name": "ПАО НК Роснефть - Смоленскнефтепродукт",
          "isOg": true
        },
        {
          "name": "Банк ВБРР (АО)",
          "isOg": true
        }
      ],
      "sum": "5000",
      "text": "Оказание ПАО НК Роснефть - Смоленскнефтепродукт (Исполнитель) для Банк ВБРР (АО) (Заказчик) услуг по перевозке"
    }
  ],
  "hints": {
    "approvalList2": "Оказание ПАО НК Роснефть - Смоленскнефтепродукт"
  },
  "success": true,
  "ID": "123"
}
