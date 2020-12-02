{
  "questionList": [
    {
      "id": 9,
      "sort": 99,
      "parentId": "",
      "text": "#select#",
      "title": "#wizardConstant_OGName#",
      "position": "alone",
      "hint": "dsfjhsd;fjsd;fsd;lfsd;lflsdkf;ldsk",
      "type": "main",
      "voteResult": "Y",
      "params": [
        "select",
        "nu",
        "subject",
        "textParam"
      ],
      "managementDepartment": [
        23
      ]
    },
    {
      "id": 8,
      "sort": 100,
      "parentId": "",
      "text": "Фио: #CEO.FullName# \r\n Родительный: #CEO.FullName.UF_GENITIVE# #selectRef#",
      "title": "Тестовый alone 1 #wizardConstant_OSName# ",
      "position": "alone",
      "type": "main",
      "voteResult": "Y",
      "params": [
        "CEO.FullName",
        "CEO.FullName.UF_GENITIVE",
        "selectRef"
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
        23,
        46
      ]
    }
  ],
  "paramsList": {
    "subject": {
      "type": "ul-custom",
      "description": "a",
      "elementSelect": "none",
      "display": "comma",
      "list": {
        "generic": {
          "title": "Организация",
          "text": "#Reorg.CheckboxOG#",
          "source": {
            "Reorg.CheckboxOG": {
              "type": "checkbox-og",
              "description": "Выберите тип юридического лица",
              "key": "name",
              "true": {
                "type": "ref",
                "source": "Reorg.TextParam"
              },
              "false": {
                "type": "ref",
                "source": "Reorg.TextParam2"
              }
            },
            "Reorg.TextParam": {
              "type": "datalist",
              "description": "Юридическое лицо не является Обществом Группы",
              "url": "/API/internal/v1/deal_sides.php?type=items&ksk=Y&",
              "key": "UF_SNAME",
              "condition": {
                "source": "Reorg.CheckboxOG",
                "key": "source",
                "op": "=",
                "value": "Reorg.TextParam"
              }
            },
            "Reorg.TextParam2": {
              "type": "datalist",
              "description": "Юридическое лицо является Обществом Группы",
              "url": "/API/internal/v1/deal_sides.php?type=items&ksk=N&",
              "key": "UF_SNAME",
              "condition": {
                "source": "Reorg.CheckboxOG",
                "key": "source",
                "op": "=",
                "value": "Reorg.TextParam2"
              }
            }
          }
        }
      }
    },
    "CEO.FullName": {
      "type": "datalist",
      "options": [{
        "UF_NOMINATIVE": "Абатуров",
        "UF_GENITIVE": "Абатурова"
      }],
      "description": "ФИО",
      "key": "UF_NOMINATIVE"
    },
    "checkbox": {
      "type": "checkbox",
      "description": "Чекбокс",
      "key": "name",
      "true": {
        "type": "ref",
        "source": "textParam"
      },
      "false": {
        "name": "b"
      }
    },
    "textParam": {
      "type": "input",
      "paramDataType": "number",
      "description": "Текстовый параметр"
    },
    "dateFrom": {
      "type": "date",
      "description": "период с",
      "mode": "year",
      "value": "lastYear"
    },
    "executiveBoard.list": {
      "type": "ul",
      "description": "Список членов Правления",
      "url": "padej.json?",
      "key": "UF_NOMINATIVE",
      "source": {
        "type": "datalist",
        "url": "padej.json?",
        "description": "ФИО"
      },
      "list": {
        "default": [
          {
            "text": "#value# (Председатель Правления)"
          }
        ],
        "generic": {
          "text": "#value.UF_NOMINATIVE# (Род: #value.UF_GENITIVE#)"
        }
      }
    },
    "file": {
      "type": "file",
      "url": "fileUpload.json",
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
    },
    "selectRef": {
      "type": "multiselect",
      "description": "Выбор рефа",
      "options": [
        "Не зарегистрировано #wizardConstant_OGName#"
      ]
    },
    "select": {
      "type": "select",
      "description": "Agaga",
      "options": [
        "a",
        "b",
        "Agaga"
      ]
    },
    "someProp": {
      "type": "input",
      "description": "Регистрация",
      "condition": {
        "source": "selectRef",
        "key": "name",
        "op": "=",
        "value": "..."
      }
    },
    "nu": {
      "type": "numberUnit",
      "description": "сумма займа",
      "url": "unit_text.json?",
      "units": {
        "default": "th_rub",
        "options": [
          {
            "code": "th_rub",
            "name": "тыс. руб."
          },
          {
            "code": "rub",
            "name": "руб."
          },
          {
            "code": "mln_rub",
            "name": "млн. руб."
          }
        ]
      }
    }
  },
  "id": 4,
  "managementDepartment": [
    {
      "id": 23,
      "name": "Совет директоров"
    },
    {
      "id": 46,
      "name": "Правление"
    }
  ],
  "og": {
    "id": 1,
    "name": "a"
  },
  "ogList": [
    {
      "id": 123,
      "name": "ОГ 1",
      "isRea": false,
      "isKey": true,
      "bsa": "123312",
      "bsaDate": "2020/03/05",
      "os": "ОСА",
      "initiator": {
        "id": 80085,
        "name": "Bender Bending Rodriguez"
      }
    },
    {
      "id": 321,
      "isRea": true,
      "name": "ОГ 2",
      "bsa": "123312",
      "bsaDate": "2020/03/05",
      "isKey": false,
      "os": "ОСУ",
      "initiator": {
        "id": 1337,
        "name": "Philip J. Fry"
      }
    }
  ],
  "group": 16,
  "initiator": {
    "id": 1,
    "name": "не подключен"
  },
  "redirectUrl": "/"
}
