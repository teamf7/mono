{
  "id": 446,
  "target": {
    "type": "deal_subject",
    "id": 500
  },
  "availableRoles": [
    "postavshchik|pokupatel"
  ],
  "sides": [
    {
      "og": true,
      "id": 1305,
      "name": "ПАО АНК «Башнефть»",
      "bsa": 2300000000000,
      "bsaDate": "2023/02/19",
      "anotherSide": false,
      "role": "postavshchik"
    },
    {
      "og": true,
      "id": 9,
      "name": "ПАО «НК «Роснефть»-Дагнефть»",
      "bsa": 1000000,
      "bsaDate": "2020/09/30",
      "anotherSide": false,
      "role": "pokupatel"
    }
  ],
  "sum": {
    "sum": 100000,
    "sumTotal": 100000,
    "type": "",
    "minSum": 0,
    "minSumTotal": 0,
    "obligations": 100000,
    "obligationsCurrency": "RUB",
    "currency": "RUB",
    "vatIncluded": false,
    "vat": "10|",
    "minVatIncluded": 0,
    "minVat": 0
  },
  "currencies": [
    {
      "name": "млн. руб.",
      "code": "MRU"
    },
    {
      "name": "руб.",
      "code": "RUB"
    },
    {
      "name": "тыс. руб.",
      "code": "TRU"
    },
    {
      "name": "Доллар США",
      "code": "USD"
    },
    {
      "name": "Евро",
      "code": "EUR"
    },
    {
      "name": "Гривна",
      "code": "UAH"
    },
    {
      "name": "Белорусский рубль",
      "code": "BYN"
    }
  ],
  "vats": [
    {
      "name": "С учетом НДС",
      "code": 0
    },
    {
      "name": "Без учета НДС",
      "code": 1
    },
    {
      "name": "НДС не облагается",
      "code": 2
    }
  ],
  "rateDate": "1990/01/01",
  "rates": {
    "MRU": 1000000,
    "RUB": 1,
    "TRU": 1000,
    "USD": 75.5379,
    "EUR": 78.32,
    "UAH": 25.11,
    "BYN": 32.2
  },
  "firstSide": [
    {
      "ID": 1305,
      "UF_NAME": "Публичное акционерное общество «Акционерная нефтяная Компания «Башнефть»",
      "UF_SNAME": "ПАО АНК «Башнефть»",
      "UF_M_BSA": 2300000000000,
      "UF_M_BSA_DATE": "2023/02/19"
    },
    {
      "ID": 9,
      "UF_NAME": "Публичное акционерное общество «НК «Роснефть»-Дагнефть»",
      "UF_SNAME": "ПАО «НК «Роснефть»-Дагнефть»",
      "UF_M_BSA": 1000000,
      "UF_M_BSA_DATE": "2020/09/30"
    }
  ],
  "roles": [
    {
      "id": 38,
      "name": "Агент",
      "code": "agent",
      "opposition": [
        "printsipal"
      ]
    },
    {
      "id": 39,
      "name": "Принципал",
      "code": "printsipal",
      "opposition": [
        "agent"
      ]
    },
    {
      "id": 40,
      "name": "Исполнитель",
      "code": "ispolnitel",
      "opposition": [
        "zakazchik"
      ]
    },
    {
      "id": 41,
      "name": "Подрядчик",
      "code": "podryadchik",
      "opposition": [
        "zakazchik"
      ]
    },
    {
      "id": 42,
      "name": "Заказчик",
      "code": "zakazchik",
      "opposition": [
        "ispolnitel",
        "podryadchik"
      ]
    },
    {
      "id": 43,
      "name": "Технический заказчик",
      "code": "tekhnicheskiy-zakazchik",
      "opposition": [
        "zastroyshchik"
      ]
    },
    {
      "id": 44,
      "name": "Застройщик",
      "code": "zastroyshchik",
      "opposition": [
        "tekhnicheskiy-zakazchik"
      ]
    },
    {
      "id": 45,
      "name": "Клиент",
      "code": "klient",
      "opposition": [
        "bank"
      ]
    },
    {
      "id": 46,
      "name": "Банк",
      "code": "bank",
      "opposition": [
        "klient"
      ]
    },
    {
      "id": 47,
      "name": "Комиссионер",
      "code": "komissioner",
      "opposition": [
        "komitent"
      ]
    },
    {
      "id": 48,
      "name": "Комитент",
      "code": "komitent",
      "opposition": [
        "komissioner"
      ]
    },
    {
      "id": 49,
      "name": "Арендодатель",
      "code": "arendodatel",
      "opposition": [
        "arendator"
      ]
    },
    {
      "id": 50,
      "name": "Субарендатор",
      "code": "subarendator",
      "opposition": [
        "arendator"
      ]
    },
    {
      "id": 51,
      "name": "Арендатор",
      "code": "arendator",
      "opposition": [
        "arendodatel",
        "subarendator"
      ]
    },
    {
      "id": 52,
      "name": "Поставщик",
      "code": "postavshchik",
      "opposition": [
        "pokupatel"
      ]
    },
    {
      "id": 53,
      "name": "Продавец",
      "code": "prodavets",
      "opposition": [
        "pokupatel",
        "otsutstvuet"
      ]
    },
    {
      "id": 54,
      "name": "Покупатель",
      "code": "pokupatel",
      "opposition": [
        "postavshchik",
        "prodavets"
      ]
    },
    {
      "id": 55,
      "name": "Займодавец",
      "code": "zaymodavets",
      "opposition": [
        "zaemshchik"
      ]
    },
    {
      "id": 56,
      "name": "Заемщик",
      "code": "zaemshchik",
      "opposition": [
        "zaymodavets"
      ]
    },
    {
      "id": 57,
      "name": "Лицензиар",
      "code": "litsenziar",
      "opposition": [
        "litsenziat"
      ]
    },
    {
      "id": 58,
      "name": "Сублицензиат",
      "code": "sublitsenziat",
      "opposition": [
        "litsenziat"
      ]
    },
    {
      "id": 59,
      "name": "Лицензиат",
      "code": "litsenziat",
      "opposition": [
        "sublitsenziat",
        "litsenziar"
      ]
    },
    {
      "id": 60,
      "name": "Лизингодатель",
      "code": "lizingodatel",
      "opposition": [
        "lizingopoluchatel"
      ]
    },
    {
      "id": 61,
      "name": "Лизингополучатель",
      "code": "lizingopoluchatel",
      "opposition": [
        "lizingodatel"
      ]
    },
    {
      "id": 62,
      "name": "Потребитель",
      "code": "potrebitel",
      "opposition": [
        "setevaya-organizatsiya"
      ]
    },
    {
      "id": 63,
      "name": "Заявитель",
      "code": "zayavitel",
      "opposition": [
        "setevaya-organizatsiya"
      ]
    },
    {
      "id": 64,
      "name": "Сетевая организация",
      "code": "setevaya-organizatsiya",
      "opposition": [
        "potrebitel",
        "zayavitel"
      ]
    },
    {
      "id": 65,
      "name": "Управляемое общество",
      "code": "upravlyaemoe-obshchestvo",
      "opposition": [
        "upravlyayushchaya-organizatsiya"
      ]
    },
    {
      "id": 66,
      "name": "Управляющая организация",
      "code": "upravlyayushchaya-organizatsiya",
      "opposition": [
        "upravlyaemoe-obshchestvo"
      ]
    },
    {
      "id": 67,
      "name": "Поручитель",
      "code": "poruchitel",
      "opposition": [
        "kreditor"
      ]
    },
    {
      "id": 68,
      "name": "Кредитор",
      "code": "kreditor",
      "opposition": [
        "poruchitel"
      ]
    },
    {
      "id": 69,
      "name": "Должник",
      "code": "dolzhnik",
      "opposition": []
    },
    {
      "id": 70,
      "name": "Гарантирующий поставщик",
      "code": "garantiruyushchiy-postavshchik",
      "opposition": [
        "potrebitel",
        "pokupatel"
      ]
    },
    {
      "id": 71,
      "name": "Энергосбытовая организация",
      "code": "energosbytovaya-organizatsiya",
      "opposition": [
        "potrebitel",
        "pokupatel"
      ]
    },
    {
      "id": 72,
      "name": "Энергоснабжающая организация",
      "code": "energosnabzhayushchaya-organizatsiya",
      "opposition": [
        "potrebitel",
        "pokupatel"
      ]
    },
    {
      "id": 73,
      "name": "Отсутствует",
      "code": "otsutstvuet",
      "opposition": []
    }
  ],
  "subject": {
    "id": 107,
    "text": "Поставка #sides.1.name# (#sides.1.role#) в адрес #sides.2.name# (#sides.2.role#) #subject# (#BCAText_side1# #BCAText_side2#)\n<br/><br/>\nОбщая сумма обязательств по сделке может составить #wizardConstant_liabilityUSD# млн. долл. США (по курсу, установленному Банком России на #wizardConstant_dateCurrencyRate#  - #wizardConstant_currencyRatesUSD# #wizardConstant_currency#)",
    "title": "Поставка #subject#",
    "paramValues": {
      "wizardConstant_data": {
        "sum": 100000,
        "sumTotal": 100000,
        "type": "",
        "minSum": 0,
        "minSumTotal": 0,
        "obligations": 100000,
        "obligationsCurrency": "руб.",
        "currency": "руб.",
        "vatIncluded": "с учетом НДС",
        "vat": 10,
        "minVatIncluded": "с учетом НДС",
        "minVat": 0,
        "obligationsUSD": 0.0013,
        "obligationsRUB": 100000,
        "sumUSD": 1323.84,
        "sumRUB": 100000,
        "minSumUSD": 0,
        "minSumRUB": 0,
        "currencyData": {
          "name": "руб.",
          "code": "RUB"
        },
        "obligationsCurrencyData": {
          "name": "руб.",
          "code": "RUB"
        },
        "rateDate": "?23?.?09?.?2020",
        "currencyRatesMRU": 1000000,
        "currencyRatesRUB": 1,
        "currencyRatesTRU": 1000,
        "currencyRatesUSD": 75.5379,
        "currencyRatesEUR": 78.32,
        "currencyRatesUAH": 25.11,
        "currencyRatesBYN": 32.2
      },
      "sides": [
        {
          "id": 1305,
          "name": "ПАО АНК «Башнефть»",
          "isContractor": false,
          "percentBCA": 0,
          "dateBCA": "?19?.?02?.?2023",
          "role": "Поставщик",
          "roleCode": "postavshchik"
        },
        {
          "id": 9,
          "name": "ПАО «НК «Роснефть»-Дагнефть»",
          "isContractor": false,
          "percentBCA": 10,
          "dateBCA": "?30?.?09?.?2020",
          "role": "Покупатель",
          "roleCode": "pokupatel"
        }
      ],
      "subject": [
        {
          "paramValues": {
            "product": 5645,
            "valueProduct": {
              "num": 545,
              "unit": "th_ton",
              "text": "545 тыс. тонн"
            },
            "bazisPostavki": 5454,
            "dateFrom": "2020-08-23T21:00:00.000Z",
            "dateTo": "2020-08-23T21:00:00.000Z",
            "pravo": 54854,
            "priceUSD": {
              "num": "12 555",
              "unit": "th_USD",
              "text": "12 555 тыс. долларов США"
            }
          },
          "default": 0,
          "title": "нефтепродуктов на экспорт"
        }
      ]
    },
    "params": {
      "subject": {
        "type": "ul-custom",
        "description": "Предмет сделки",
        "elementSelect": "radio",
        "list": {
          "default": [
            {
              "title": "нефтепродуктов на экспорт",
              "text": "нефтепродуктов на экспорт на следующих условиях: <br> - Поставляемый товар: #product#. <br> - Объем товара: до #valueProduct#. <br> - Базис поставки: #bazisPostavki#. <br> - Период поставки: с #dateFrom# по #dateTo#. <br> - Применимое право: #pravo#. <br> - Стоимость поставляемого товара: до #priceUSD#",
              "source": {
                "product": {
                  "type": "input",
                  "description": "поставляемый товар"
                },
                "valueProduct": {
                  "type": "numberUnit",
                  "url": "http://172.30.48.151/API/internal/v1/get_unit_text.php?",
                  "showNumText": false,
                  "description": "объем",
                  "units": {
                    "default": "th_ton",
                    "options": [
                      {
                        "code": "th_ton",
                        "name": "тыс. тонн"
                      },
                      {
                        "code": "mln_ton",
                        "name": "млн. тонн"
                      },
                      {
                        "code": "mlrd_ton",
                        "name": "млрд. тонн"
                      }
                    ]
                  }
                },
                "bazisPostavki": {
                  "type": "input",
                  "description": "базис поставки"
                },
                "dateFrom": {
                  "type": "date",
                  "description": "дата начала"
                },
                "dateTo": {
                  "type": "date",
                  "description": "дата окончания"
                },
                "pravo": {
                  "type": "input",
                  "description": "применимое право"
                },
                "priceUSD": {
                  "type": "numberUnit",
                  "description": "стоимость поставляемого товара, долларов США",
                  "units": {
                    "default": "th_USD",
                    "options": [
                      {
                        "code": "th_USD",
                        "name": "тыс. долларов США"
                      },
                      {
                        "code": "mln_USD",
                        "name": "млн. долларов США"
                      }
                    ]
                  }
                }
              },
              "select": true,
              "values": {
                "paramValues": {
                  "product": 5645,
                  "valueProduct": {
                    "num": 545,
                    "unit": "th_ton",
                    "text": "545 тыс. тонн"
                  },
                  "bazisPostavki": 5454,
                  "dateFrom": "2020-09-23T21:00:00.000Z",
                  "dateTo": "2020-09-23T21:00:00.000Z",
                  "pravo": 54854,
                  "priceUSD": {
                    "num": "12 555",
                    "unit": "th_USD",
                    "text": "12 555 тыс. долларов США"
                  }
                },
                "default": 0,
                "title": "нефтепродуктов на экспорт"
              }
            },
            {
              "title": "нефти на экспорт",
              "text": "нефти на экспорт на следующих условиях: <br> - Поставляемый товар: #product#.<br> - Объем товара: до #valueProduct#. <br> - Базис поставки: #bazisPostavki#.<br> - Период поставки: с #dateFrom# по #dateTo#. <br> - Применимое право: #pravo#. <br> - Стоимость поставляемого товара: до #priceUSD#",
              "source": {
                "product": {
                  "type": "input",
                  "description": "поставляемый товар"
                },
                "valueProduct": {
                  "type": "numberUnit",
                  "url": "http://172.30.48.151/API/internal/v1/get_unit_text.php?",
                  "showNumText": false,
                  "description": "объем",
                  "units": {
                    "default": "th_ton",
                    "options": [
                      {
                        "code": "th_ton",
                        "name": "тыс. тонн"
                      },
                      {
                        "code": "mln_ton",
                        "name": "млн. тонн"
                      },
                      {
                        "code": "mlrd_ton",
                        "name": "млрд. тонн"
                      }
                    ]
                  }
                },
                "bazisPostavki": {
                  "type": "input",
                  "description": "базис поставки"
                },
                "dateFrom": {
                  "type": "date",
                  "description": "дата начала"
                },
                "dateTo": {
                  "type": "date",
                  "description": "дата окончания"
                },
                "pravo": {
                  "type": "input",
                  "description": "применимое право"
                },
                "priceUSD": {
                  "type": "numberUnit",
                  "description": "стоимость поставляемого товара, долларов США",
                  "units": {
                    "default": "th_USD",
                    "options": [
                      {
                        "code": "th_USD",
                        "name": "тыс. долларов США"
                      },
                      {
                        "code": "mln_USD",
                        "name": "млн. долларов США"
                      }
                    ]
                  }
                }
              }
            }
          ]
        }
      },
      "BCAText_side1": {
        "type": "subtextCondition",
        "deps": [
          "sides.1.percentBCA"
        ],
        "value": "#sides.1.percentBCA#% балансовой стоимости активов #sides.1.name# по состоянию на #sides.1.dateBCA#"
      },
      "BCAText_side2": {
        "type": "subtextCondition",
        "deps": [
          {
            "source": "side.2.percentBCA",
            "op": ">",
            "value": 0
          }
        ],
        "value": "и #sides.2.percentBCA#% балансовой стоимости активов #sides.2.name# по состоянию на #sides.2.dateBCA#"
      }
    }
  },
  "redirectUrl": "http://172.30.48.151/deal/"
}
